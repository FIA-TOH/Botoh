const room = HBInit({
    roomName: "My room",
    maxPlayers: 16,
    noPlayer: true // Remove host player (recommended!)
});

function vectorSpeed(xSpeed, ySpeed) {
    return 10 * Math.hypot(xSpeed, ySpeed)
}

function distanceFromPointToLine(playerDisc, otherDisc) {

    const x1 = otherDisc.x;
    const y1 = otherDisc.y;

    const x2 = otherDisc.x + otherDisc.xspeed;
    const y2 = otherDisc.y + otherDisc.yspeed;

    const x3 = playerDisc.x;
    const y3 = playerDisc.y;

    // Calculate the coefficients of the line equation Ax + By + C = 0
    let A = y2 - y1;
    let B = x1 - x2;
    let C = (x2 * y1) - (x1 * y2);

    // Calculate the distance using the point-line distance formula
    return Math.abs(A * x3 + B * y3 + C) / Math.sqrt(A * A + B * B);
}



room.onGameTick = () => {
    const players = room.getPlayerList().filter(p => room.getPlayerDiscProperties(p.id) != null);

    players.forEach(p => {
        const disc = room.getPlayerDiscProperties(p.id);
        const speed = vectorSpeed(disc.xspeed, disc.yspeed);
        room.setPlayerAvatar(p.id, Math.floor(speed).toString())
    })

    players.forEach(p => {
        const slipstream = calculateSlipstream(p, players.filter(pl => pl.id !== p.id));
        const disc = room.getPlayerDiscProperties(p.id);
        const speed = vectorSpeed(disc.xspeed, disc.yspeed) / 10;
        const xNorm = disc.xspeed / speed;
        const yNorm = disc.yspeed / speed;

        if (speed > 0 && !isNaN(slipstream) && slipstream > 0.001) {
            console.log(slipstream * xNorm, p.name)
            room.setPlayerDiscProperties(p.id,
                {
                    xgravity: slipstream * xNorm,
                    ygravity: slipstream * yNorm
                }
            )
        } else {
            room.setPlayerDiscProperties(p.id,
                {
                    xgravity: 0,
                    ygravity: 0
                }
            )
        }
    })
};

room.onPlayerChat = (player, message) => {
    if (message === '!coord') {
        room.sendAnnouncement('Coordinates: ' + player.position.x + " " + player.position.y);
    }
    if (message === "!admin") {
        room.setPlayerAdmin(player.id, true);
    }

    const tokens = message.split(' ');
    console.log(tokens)
    if (tokens[0] === "!move") {
        let x = parseFloat(tokens[1]);
        let y = parseFloat(tokens[2]);
        if (isNaN(x)) {
            x = 0
        }

        if (isNaN(y)) {
            y = 0
        }
        console.log("Moving Player to: ", x, y)
        room.setPlayerDiscProperties(player.id, {x: x, y: y});
    }
}