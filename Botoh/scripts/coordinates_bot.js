const room = HBInit({
    roomName: "My room",
    maxPlayers: 20,
    noPlayer: true,
    public: false
});


room.onPlayerChat = (player, message) => {
    if (message === '!coord') {
        room.sendAnnouncement('[' + player.position.x + "," + player.position.y + '],');
    }
    if(message === "!admin") {
        room.setPlayerAdmin(player.id, true);
    }

    const tokens = message.split(' ');
    console.log(tokens)
    if(tokens[0] === "!move") {
        let x = parseFloat(tokens[1]);
        let y = parseFloat(tokens[2]);
        if(isNaN(x)) {
            x = 0
        }

        if(isNaN(y)) {
            y = 0
        }
        console.log("Moving Player to: ", x, y)
        room.setPlayerDiscProperties(player.id, {x: x, y: y});
    }
}