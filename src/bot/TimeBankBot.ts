import { TeamsActivityHandler, TurnContext, CardFactory } from "botbuilder";
import { SharePointService } from "../services/SharePointService";
import { TimeEntry, Tool, isValidTool } from "../models/TimeEntry";
import { UserCredits } from "../models/Credits";
import { getTools } from "../config/tools.config";

export class TimeBankBot extends TeamsActivityHandler {
    private sharePointService: SharePointService;
    private tools: Tool[] = [];

    constructor(context: any) {
        super();
        this.sharePointService = new SharePointService(context);
        this.initializeTools();

        // Handle message activity
        this.onMessage(async (context, next) => {
            const text = context.activity.text.toLowerCase();
            const userAadId = context.activity.from.aadObjectId;
            const userName = context.activity.from.name;

            if (!userAadId) {
                await context.sendActivity("Unable to identify user. Please ensure you're properly logged in.");
                return;
            }

            if (text.startsWith("save")) {
                await this.handleSaveTime(context, userAadId, userName || "Unknown User");
            } else if (text.startsWith("balance")) {
                await this.handleCheckBalance(context, userAadId);
            } else if (text.startsWith("redeem")) {
                await this.handleRedeem(context, userAadId);
            } else if (text.startsWith("history")) {
                await this.handleHistory(context, userAadId);
            } else {
                await this.sendHelp(context);
            }

            await next();
        });
    }

    private async initializeTools(): Promise<void> {
        try {
            this.tools = await getTools();
        } catch (error) {
            console.error("Failed to initialize tools:", error);
            this.tools = [];
        }
    }

    private async handleSaveTime(context: TurnContext, userId: string, userName: string): Promise<void> {
        const text = context.activity.text.toLowerCase();
        const parts = text.split(" ");

        // Expected format: save <minutes> mins - <tool>
        if (parts.length < 5) {
            await context.sendActivity("Please use the format: save <minutes> mins - <tool>");
            return;
        }

        const minutes = parseInt(parts[1]);
        const toolUsed = parts.slice(4).join(" ");

        if (isNaN(minutes) || minutes <= 0) {
            await context.sendActivity("Please provide a valid number of minutes.");
            return;
        }

        const tool = isValidTool(toolUsed, this.tools);
        if (!tool) {
            await context.sendActivity(`Tool not recognized. Available tools: ${this.tools.map(t => t.name).join(", ")}`);
            return;
        }

        const timeEntry: TimeEntry = {
            userId,
            userName,
            toolUsed: tool.name,
            timeSaved: minutes,
            description: text,
            dateLogged: new Date(),
            creditsEarned: minutes * tool.multiplier / 30, // 30 mins = 1 credit
            multiplier: tool.multiplier
        };

        await this.sharePointService.addTimeEntry(timeEntry);

        // Update user credits
        let userCredits = await this.sharePointService.getUserCredits(userId);
        if (!userCredits) {
            userCredits = {
                userId,
                userName,
                totalCredits: 0,
                lastUpdated: new Date()
            };
        }

        userCredits.totalCredits += timeEntry.creditsEarned;
        userCredits.lastUpdated = new Date();
        await this.sharePointService.updateUserCredits(userCredits);

        await context.sendActivity(CardFactory.adaptiveCard({
            type: "AdaptiveCard",
            version: "1.0",
            body: [
                {
                    type: "TextBlock",
                    text: "✅ Time saved successfully!",
                    weight: "bolder",
                    size: "large"
                },
                {
                    type: "FactSet",
                    facts: [
                        { title: "Time Saved:", value: `${minutes} minutes` },
                        { title: "Tool Used:", value: tool.name },
                        { title: "Multiplier:", value: `${tool.multiplier}x` },
                        { title: "Credits Earned:", value: timeEntry.creditsEarned.toFixed(2) }
                    ]
                }
            ]
        }));
    }

    private async handleCheckBalance(context: TurnContext, userId: string): Promise<void> {
        const credits = await this.sharePointService.getUserCredits(userId);
        if (!credits) {
            await context.sendActivity("You haven't earned any credits yet.");
            return;
        }

        await context.sendActivity(CardFactory.adaptiveCard({
            type: "AdaptiveCard",
            version: "1.0",
            body: [
                {
                    type: "TextBlock",
                    text: "💳 Credit Balance",
                    weight: "bolder",
                    size: "large"
                },
                {
                    type: "TextBlock",
                    text: `${credits.totalCredits.toFixed(2)} credits`,
                    size: "large"
                },
                {
                    type: "TextBlock",
                    text: `Last updated: ${credits.lastUpdated.toLocaleDateString()}`,
                    isSubtle: true
                }
            ]
        }));
    }

    private async handleRedeem(context: TurnContext, userId: string): Promise<void> {
        const benefits = await this.sharePointService.getActiveBenefits();

        await context.sendActivity(CardFactory.adaptiveCard({
            type: "AdaptiveCard",
            version: "1.0",
            body: [
                {
                    type: "TextBlock",
                    text: "🎁 Available Benefits",
                    weight: "bolder",
                    size: "large"
                },
                ...benefits.map(benefit => ({
                    type: "Container",
                    items: [
                        {
                            type: "TextBlock",
                            text: `${benefit.name} (${benefit.creditsRequired} credits)`,
                            weight: "bolder"
                        },
                        {
                            type: "TextBlock",
                            text: benefit.description,
                            wrap: true
                        }
                    ],
                    style: "emphasis",
                    spacing: "medium"
                }))
            ],
            actions: [
                {
                    type: "Action.Submit",
                    title: "Redeem Benefit",
                    data: {
                        command: "redeem"
                    }
                }
            ]
        }));
    }

    private async handleHistory(context: TurnContext, userId: string): Promise<void> {
        const history = await this.sharePointService.getUserTimeEntries(userId);

        if (history.length === 0) {
            await context.sendActivity("You haven't logged any time yet.");
            return;
        }

        await context.sendActivity(CardFactory.adaptiveCard({
            type: "AdaptiveCard",
            version: "1.0",
            body: [
                {
                    type: "TextBlock",
                    text: "📊 Time Saving History",
                    weight: "bolder",
                    size: "large"
                },
                ...history.slice(0, 5).map(entry => ({
                    type: "Container",
                    items: [
                        {
                            type: "FactSet",
                            facts: [
                                { title: "Date:", value: new Date(entry.dateLogged).toLocaleDateString() },
                                { title: "Time Saved:", value: `${entry.timeSaved} minutes` },
                                { title: "Tool:", value: entry.toolUsed },
                                { title: "Credits:", value: entry.creditsEarned.toFixed(2) }
                            ]
                        }
                    ],
                    style: "emphasis",
                    spacing: "medium"
                }))
            ]
        }));
    }

    private async sendHelp(context: TurnContext): Promise<void> {
        const toolsList = this.tools.map(t => `${t.name} (${t.multiplier}x): ${t.description}`).join("\n");

        await context.sendActivity(CardFactory.adaptiveCard({
            type: "AdaptiveCard",
            version: "1.0",
            body: [
                {
                    type: "TextBlock",
                    text: "🎯 TimeBank Commands",
                    weight: "bolder",
                    size: "large"
                },
                {
                    type: "TextBlock",
                    text: "Here are the available commands:",
                    wrap: true
                },
                {
                    type: "FactSet",
                    facts: [
                        {
                            title: "save",
                            value: "save <minutes> mins - <tool>\nE.g., save 30 mins - ChatGPT"
                        },
                        {
                            title: "balance",
                            value: "Check your current credit balance"
                        },
                        {
                            title: "redeem",
                            value: "View and redeem available benefits"
                        },
                        {
                            title: "history",
                            value: "View your time saving history"
                        }
                    ]
                },
                {
                    type: "TextBlock",
                    text: "🛠️ Available Tools:",
                    weight: "bolder",
                    spacing: "medium"
                },
                {
                    type: "TextBlock",
                    text: toolsList,
                    wrap: true
                }
            ]
        }));
    }
}
