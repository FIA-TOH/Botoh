import { leagueScuderia } from "../../scuderias/scuderias";

export function handleSeeScuderias(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  let message = "Name | Tag\n-------------\n";

  for (const scuderiaKey in leagueScuderia) {
    if (Object.prototype.hasOwnProperty.call(leagueScuderia, scuderiaKey)) {
      const scuderia = leagueScuderia[scuderiaKey];
      message += `${scuderia.name} | ${scuderia.tag}\n`;
    }
  }

  room.sendAnnouncement(message, byPlayer.id);
}
