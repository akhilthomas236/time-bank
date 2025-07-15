import { PreventIframe } from "express-msteams-host";

/**
 * Used as place holder for the decorators
 */
@PreventIframe("/timebankTab/index.html")
@PreventIframe("/timebankTab/config.html")
@PreventIframe("/timebankTab/remove.html")
export class TimebankTab {
}
