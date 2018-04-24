import { User } from "./model/user";
import { ServerConnection } from "./serverConnection";
import { MessageID } from "../shared/messageID";

export class Player {
    public id: string
    public user: User
    public playing: string

    private static serverConnection: ServerConnection;
    private static players = new Map<string, Player>()
    private static listeners = new Array<PlayerEventListener>()

    public static setServerConnection(serverConnection: ServerConnection) {
        Player.serverConnection = serverConnection

        Player.serverConnection.on(MessageID.PLAYER_CAME_ONLINE, (player: Player) => Player.handlePlayerCameOnline(player))
        Player.serverConnection.on(MessageID.PLAYER_WENT_OFFLINE, (player: Player) => Player.handlePlayerWntOffline(player.id))

        Player.serverConnection.request(MessageID.GET_PLAYERS).then((players: Player[]) => Player.handleGetAllPlayers(players))
    }

    public static addEventListener(listener: PlayerEventListener) {
        Player.listeners.push(listener)
    }

    public static removeEventListener(listener: PlayerEventListener) {
        Player.listeners.splice(Player.listeners.findIndex(l => l === listener), 1)
    }

    public static getAll() {
        return Array.from(Player.players.values())
    }

    public static get(id: string) {
        return Player.players.get(id)
    }

    private static handlePlayerCameOnline(player: Player) {
        Player.players.set(player.id, player)
        Player.listeners.forEach(listener => listener.onPlayerCameOnline(player))
    }

    private static handlePlayerWntOffline(playerId: string) {
        let player = Player.players.get(playerId)
        if (Player.players.delete(playerId)) {
            Player.listeners.forEach(listener => listener.onPlayerWentOffline(player))
        }
    }

    private static handleGetAllPlayers(players: Player[]) {
        players.forEach(player => Player.players.set(player.id, player))
        Player.listeners.forEach(listener => listener.onAllPlayers(players))
    }
}

export interface PlayerEventListener {
    onPlayerCameOnline(player: Player) : void
    onPlayerWentOffline(player: Player) : void
    onAllPlayers(players: Player[]) : void
}