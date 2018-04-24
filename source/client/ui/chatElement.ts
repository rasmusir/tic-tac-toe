import { UIElement, view, bind } from "./UIElement";
import {ServerConnection} from "../serverConnection";
import { MessageID } from "../../shared/messageID";
import { Player } from "../player";

@view("chatWindow")
export class ChatElement extends UIElement {

    @bind("chatInput")
    private chatInput: HTMLInputElement
    @bind("chat")
    private chatDiv: HTMLDivElement

    private serverConnection: ServerConnection

    protected onViewCreated() {
        this.chatInput.onkeydown = (e) => this.handleKeyDown(e)
    }

    setServerConnection(serverConnection: ServerConnection) {
        this.serverConnection = serverConnection
        this.serverConnection.on(MessageID.CHAT_MESSAGE, (message: any) => this.handleMessage(message))
    }

    private handleKeyDown(event: KeyboardEvent) {
        if ((event.keyCode || event.which) == 13 && this.chatInput.value.trim().length != 0) {
            event.preventDefault()
            this.serverConnection.send(MessageID.CHAT_MESSAGE, { text: this.chatInput.value })
            this.chatInput.value = ""
        }
    }

    private handleMessage(message: any) {
        let messageDiv = document.createElement("div")
        messageDiv.textContent = Player.get(message.id).user.displayname + ": " + message.text
        this.chatDiv.appendChild(messageDiv)
    }
}