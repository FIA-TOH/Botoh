import { LEAGUE_MODE } from "../hostLeague/leagueMode";

const PUBLIC_URL =
  "https://discord.com/api/webhooks/1115666517971980328/iJdg0SHMlFrzjHTosNis6bS1CntFjZXdngQkzeGqfNnNyILWCeQjRnLLyLe7F7ywlSMS";
const LEAGUE_URL =
  "https://discord.com/api/webhooks/1257590457576329327/VD8S5_EkwLiMKOcN2QBmjEaAtLqI0F6f-rsiEHzcFsvdtw70kpZLS0LvqVPi0gvQDfTL";

export function sendDiscordMessage(message: string) {
  // const MESSAGES_URL = LEAGUE_MODE ? LEAGUE_URL : PUBLIC_URL;
  // const request = new XMLHttpRequest();
  // const sanitizedMessage = message.replace(/@(?=[a-zA-Z])/g, '@ ');
  // request.open("POST",
  //     MESSAGES_URL);
  // request.setRequestHeader('Content-type', 'application/json');
  // const params = {
  //     content: sanitizedMessage
  // }
  // request.send(JSON.stringify(params));
}

function generateFileName() {
  // const now = new Date();
  // const day = now.getDate().toString().padStart(2, '0');
  // const month = (now.getMonth() + 1).toString().padStart(2, '0'); // January is 0!
  // const year = now.getFullYear();
  // const hours = now.getHours().toString().padStart(2, '0');
  // const minutes = now.getMinutes().toString().padStart(2, '0');
  // return `HBReplay-${day}-${month}-${year}-${hours}h${minutes}m.hbr2`;
}

export function sendDiscordReplay(replay: Uint8Array) {
  // const REPLAYS_URL = LEAGUE_MODE ? LEAGUE_URL : PUBLIC_URL;
  // const request = new XMLHttpRequest();
  // request.open("POST", REPLAYS_URL)
  // // Convert Uint8Array to Blob
  // const blob = new Blob([replay], {type: 'application/octet-stream'});
  // // Create FormData object
  // const formData = new FormData();
  // // Append file, assuming fileName includes the desired extension (e.g., 'name.hbs2')
  // formData.append('file', blob, generateFileName());
  // // Send the FormData object; no need to set Content-Type, XMLHttpRequest does it
  // request.send(formData);
}
