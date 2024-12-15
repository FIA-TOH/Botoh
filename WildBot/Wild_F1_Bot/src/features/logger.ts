import {sendDiscordMessage} from "./discord";

export function log(message: string) {
    console.log(message)
    sendDiscordMessage(message)
}