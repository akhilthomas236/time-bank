import * as Express from "express";
import * as http from "http";
import * as path from "path";
import * as morgan from "morgan";
import { MsTeamsApiRouter, MsTeamsPageRouter } from "express-msteams-host";
import * as debug from "debug";
import * as compression from "compression";
import * as dotenv from "dotenv";
import { BotFrameworkAdapter } from "botbuilder";

// Initialize dotenv first
dotenv.config();

// Then import components that might need environment variables
import * as allComponents from "./TeamsAppsComponents";
import { TimeBankBot } from "../bot/TimeBankBot";

// Initialize debug logging module
const log = debug("msteams");

log("Initializing Microsoft Teams Express hosted App...");

// Create the Express webserver
const app = Express();
const port = process.env.port || process.env.PORT || 3007;

// Inject the raw request body onto the request object
app.use(Express.json({
    verify: (req, res, buf: Buffer, encoding: string): void => {
        (req as any).rawBody = buf.toString();
    }
}));
app.use(Express.urlencoded({ extended: true }));

// Express configuration
app.set("views", path.join(__dirname, "/"));

// Add simple logging
app.use(morgan("tiny"));

// Add compression - uncomment to remove compression
app.use(compression());

// Add /scripts and /assets as static folders
app.use("/scripts", Express.static(path.join(__dirname, "web/scripts")));
app.use("/assets", Express.static(path.join(__dirname, "web/assets")));

// routing for bots, connectors and incoming web hooks - based on the decorators
// For more information see: https://www.npmjs.com/package/express-msteams-host
app.use(MsTeamsApiRouter(allComponents));

// routing for pages for tabs and connector configuration
// For more information see: https://www.npmjs.com/package/express-msteams-host
app.use(MsTeamsPageRouter({
    root: path.join(__dirname, "web/"),
    components: allComponents
}));

// Set default web page
app.use("/", Express.static(path.join(__dirname, "web/"), {
    index: "index.html"
}));

// Create bot adapter
const adapter = new BotFrameworkAdapter({
    appId: process.env.NODE_ENV === "development" ? "" : process.env.MICROSOFT_APP_ID,
    appPassword: process.env.NODE_ENV === "development" ? "" : process.env.MICROSOFT_APP_PASSWORD
});

// Error handler
adapter.onTurnError = async (context, error) => {
    console.error(`\n [onTurnError] unhandled error: ${error}`);
    await context.sendTraceActivity(
        "OnTurnError Trace",
        `${error}`,
        "https://www.botframework.com/schemas/error",
        "TurnError"
    );
    await context.sendActivity("An error occurred. Please try again later.");
};

// Create the bot instance
const bot = new TimeBankBot(null); // We'll pass the proper context when available

// Listen for incoming requests
app.post("/api/messages", (req, res) => {
    // In development, bypass authentication
    if (process.env.NODE_ENV === "development") {
        // Add CORS headers for local development
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        if (req.method === "OPTIONS") {
            res.sendStatus(200);
            return;
        }
    }

    adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});

// Start the webserver
app.listen(port, () => {
    log(`Server running on ${port}`);
});
