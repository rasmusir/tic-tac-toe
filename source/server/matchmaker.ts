import { Client } from "./client";
import { IMatchmakeSuccessPayload } from "../shared/messagepayloads/iMatchmakeSuccessPayload"
import { IMatchmakePayload } from "../shared/messagepayloads/iMatchmakePayload"
import { MessageID } from "../shared/messageID";

export class Matchmaker {

    private activeGames = new Map<string, Array<{client: Client, once: Function}>>()

    handleMatchmake(client: Client, message: IMatchmakePayload) {
        let queue = this.activeGames.get(message.gameId) || new Array<{client: Client, once: Function}>()
        this.activeGames.set(message.gameId, queue)

        console.log(`${client.user.displayname} is in queue for ${message.gameId}.`)
        
        let once = client.once("close", () => {
            queue.splice(queue.findIndex(clientToRemove => clientToRemove.client === client), 1)
        })
        
        let clientAndOnce = {
            once,
            client
        }

        queue.push(clientAndOnce)

        if (queue.length > 1) {
            let clients = queue.splice(0, 2)
            
            console.log(`${clients.map(client => client.client.user.displayname).join(",")} matched for ${message.gameId}.`)

            let successMessage : IMatchmakeSuccessPayload = {
                gameId: message.gameId,
                clientIds: clients.map(clientAndOnce => clientAndOnce.client.id)
            }

            clients.forEach(clientAndOnce => {
                clientAndOnce.client.send(MessageID.MATCHMAKE_SUCCESS, successMessage)
                clientAndOnce.client.removeOnceListener("close", clientAndOnce.once)
            })
        }
    }
}