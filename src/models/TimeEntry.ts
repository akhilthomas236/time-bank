export interface TimeEntry {
    id?: string;
    userId: string;
    userName: string;
    toolUsed: string;
    timeSaved: number; // in minutes
    description: string;
    dateLogged: Date;
    creditsEarned: number;
    multiplier: number;
}

export interface Tool {
    name: string;
    multiplier: number;
    description: string;
}

export const isValidTool = (toolName: string, tools: Tool[]): Tool | undefined => {
    return tools.find(t => t.name.toLowerCase() === toolName.toLowerCase());
};
