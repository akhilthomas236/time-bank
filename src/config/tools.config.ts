import { Tool } from "../models/TimeEntry";

export const toolsConfig: Tool[] = [
    { name: "ChatGPT", multiplier: 1.25, description: "AI-powered chat assistant" },
    { name: "Copilot", multiplier: 1.5, description: "AI pair programmer" },
    { name: "Amazon Q Developer", multiplier: 1.5, description: "AI-powered coding companion for AWS" }
];

export const getTools = async (): Promise<Tool[]> => {
    try {
        // In the future, this could be extended to:
        // 1. Read from a SharePoint list
        // 2. Read from a JSON file
        // 3. Read from an API
        return toolsConfig;
    } catch (error) {
        console.error("Error loading tools configuration:", error);
        return [];
    }
};
