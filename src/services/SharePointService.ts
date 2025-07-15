import { spfi, SPFx as spSPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { TimeEntry } from "../models/TimeEntry";
import { UserCredits, RedemptionHistory, Benefit } from "../models/Credits";

export class SharePointService {
    private sp = spfi();
    private readonly TIME_ENTRIES_LIST = "TimeEntries";
    private readonly USER_CREDITS_LIST = "UserCredits";
    private readonly REDEMPTION_HISTORY_LIST = "RedemptionHistory";
    private readonly BENEFITS_LIST = "Benefits";
    private isLocalDev: boolean;

    // Mock data for local development
    private localTimeEntries: TimeEntry[] = [];
    private localUserCredits: { [key: string]: UserCredits } = {};
    private localRedemptions: RedemptionHistory[] = [];
    private localBenefits: Benefit[] = [
        {
            name: "Family Day Off",
            description: "Take a day off to spend with family",
            creditsRequired: 100,
            category: "Family",
            isActive: true
        },
        {
            name: "Extended Break",
            description: "Take an extended lunch break",
            creditsRequired: 30,
            category: "Wellness",
            isActive: true
        },
        {
            name: "Professional Course",
            description: "Enroll in a professional development course",
            creditsRequired: 200,
            category: "Professional",
            isActive: true
        },
        {
            name: "Team Lunch",
            description: "Organize a team lunch",
            creditsRequired: 50,
            category: "Team",
            isActive: true
        },
        {
            name: "Work From Home Day",
            description: "Additional work from home day",
            creditsRequired: 80,
            category: "Wellness",
            isActive: true
        }
    ];

    constructor(context: any) {
        this.isLocalDev = !context || process.env.NODE_ENV === "development";
        if (!this.isLocalDev) {
            this.sp = spfi().using(spSPFx(context));
        }
    }

    // Time Entries operations
    async addTimeEntry(entry: TimeEntry): Promise<void> {
        if (this.isLocalDev) {
            this.localTimeEntries.push({ ...entry, id: Date.now().toString() });
            return;
        }

        await this.sp.web.lists.getByTitle(this.TIME_ENTRIES_LIST).items.add({
            UserId: entry.userId,
            UserName: entry.userName,
            ToolUsed: entry.toolUsed,
            TimeSaved: entry.timeSaved,
            Description: entry.description,
            DateLogged: entry.dateLogged,
            CreditsEarned: entry.creditsEarned,
            Multiplier: entry.multiplier
        });
    }

    async getUserTimeEntries(userId: string): Promise<TimeEntry[]> {
        if (this.isLocalDev) {
            return this.localTimeEntries.filter(e => e.userId === userId)
                .sort((a, b) => b.dateLogged.getTime() - a.dateLogged.getTime());
        }

        const list = this.sp.web.lists.getByTitle(this.TIME_ENTRIES_LIST);
        const items: any[] = await list.items
            .select("Id,UserId,UserName,ToolUsed,TimeSaved,Description,DateLogged,CreditsEarned,Multiplier")
            .filter(`UserId eq '${userId}'`)
            .orderBy("DateLogged", false)();

        return items.map(item => ({
            id: item.Id,
            userId: item.UserId,
            userName: item.UserName,
            toolUsed: item.ToolUsed,
            timeSaved: item.TimeSaved,
            description: item.Description,
            dateLogged: new Date(item.DateLogged),
            creditsEarned: item.CreditsEarned,
            multiplier: item.Multiplier
        }));
    }

    async getUserCredits(userId: string): Promise<UserCredits | null> {
        if (this.isLocalDev) {
            return this.localUserCredits[userId] || null;
        }

        const list = this.sp.web.lists.getByTitle(this.USER_CREDITS_LIST);
        const items: any[] = await list.items
            .select("Id,UserId,UserName,TotalCredits,LastUpdated")
            .filter(`UserId eq '${userId}'`)();

        if (items.length === 0) return null;

        return {
            id: items[0].Id,
            userId: items[0].UserId,
            userName: items[0].UserName,
            totalCredits: items[0].TotalCredits,
            lastUpdated: new Date(items[0].LastUpdated)
        };
    }

    async updateUserCredits(credits: UserCredits): Promise<void> {
        if (this.isLocalDev) {
            this.localUserCredits[credits.userId] = credits;
            return;
        }

        if (credits.id) {
            await this.sp.web.lists.getByTitle(this.USER_CREDITS_LIST).items
                .getById(parseInt(credits.id))
                .update({
                    TotalCredits: credits.totalCredits,
                    LastUpdated: credits.lastUpdated
                });
        } else {
            await this.sp.web.lists.getByTitle(this.USER_CREDITS_LIST).items.add({
                UserId: credits.userId,
                UserName: credits.userName,
                TotalCredits: credits.totalCredits,
                LastUpdated: credits.lastUpdated
            });
        }
    }

    async addRedemption(redemption: RedemptionHistory): Promise<void> {
        if (this.isLocalDev) {
            this.localRedemptions.push({ ...redemption, id: Date.now().toString() });
            return;
        }

        await this.sp.web.lists.getByTitle(this.REDEMPTION_HISTORY_LIST).items.add({
            UserId: redemption.userId,
            UserName: redemption.userName,
            Benefit: redemption.benefit,
            CreditsSpent: redemption.creditsSpent,
            DateRedeemed: redemption.dateRedeemed,
            Status: redemption.status
        });
    }

    async getUserRedemptions(userId: string): Promise<RedemptionHistory[]> {
        if (this.isLocalDev) {
            return this.localRedemptions
                .filter(r => r.userId === userId)
                .sort((a, b) => b.dateRedeemed.getTime() - a.dateRedeemed.getTime());
        }

        const list = this.sp.web.lists.getByTitle(this.REDEMPTION_HISTORY_LIST);
        const items: any[] = await list.items
            .select("Id,UserId,UserName,Benefit,CreditsSpent,DateRedeemed,Status")
            .filter(`UserId eq '${userId}'`)
            .orderBy("DateRedeemed", false)();

        return items.map(item => ({
            id: item.Id,
            userId: item.UserId,
            userName: item.UserName,
            benefit: item.Benefit,
            creditsSpent: item.CreditsSpent,
            dateRedeemed: new Date(item.DateRedeemed),
            status: item.Status
        }));
    }

    async getActiveBenefits(): Promise<Benefit[]> {
        if (this.isLocalDev) {
            return this.localBenefits.filter(b => b.isActive);
        }

        const list = this.sp.web.lists.getByTitle(this.BENEFITS_LIST);
        const items: any[] = await list.items
            .select("Title,Description,CreditsRequired,Category,IsActive")
            .filter("IsActive eq 1")();

        return items.map(item => ({
            name: item.Title,
            description: item.Description,
            creditsRequired: item.CreditsRequired,
            category: item.Category,
            isActive: item.IsActive
        }));
    }
}
