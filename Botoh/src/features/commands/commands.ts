export interface Commands {
    [key: string]: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void | Promise<void>
}
