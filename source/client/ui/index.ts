import { UIElement, root, bind } from "./UIElement";
import { LoginElement, LoginListener } from "./loginElement";
import { Connections } from "../connections";
import { PlayerListElement } from "./playerListElement";
import { Player } from "../player";
import { API } from "../api";
import { ChatElement } from "./chatElement";
import { GameElement } from "./gameElement";
import { GameListElement } from "./gameListElement";

@root(document.body)
export class Index extends UIElement implements LoginListener {

    @bind("loginPlaceholder")
    private loginDiv: HTMLDivElement
    @bind("mainHolder")
    private mainHolderDiv: HTMLDivElement
    @bind("playerListHolder")
    private playerListHolderDiv: HTMLDivElement
    @bind("chat")
    private chatDiv: HTMLDivElement
    
    private connections: Connections
    private playerListElement: PlayerListElement

    protected onViewCreated(): void {
        let loginElement = new LoginElement()
        loginElement.appendToRoot()
        loginElement.setLoginListner(this)

        window.addEventListener("resize", () => this.onResize())
        this.onResize()
    }

    setConnections(connections: Connections) {
        this.connections = connections
    }

    private async onLoggedIn() {
        Player.setServerConnection(this.connections.serverConnection)
        this.playerListElement = new PlayerListElement()
        this.playerListElement.appendTo(this.playerListHolderDiv)
        
        let chatElement = new ChatElement()
        chatElement.setServerConnection(this.connections.serverConnection)
        chatElement.appendTo(this.chatDiv)

        let gameListELement = new GameListElement(this.connections)
        gameListELement.appendTo(this.mainHolderDiv)
    }

    async onLogin() {
        try {
            await this.connections.connectToServer(API.User.currentUser.username)
            this.onLoggedIn()
        }
        catch (e) {
            alert("Name already taken")
        }
    }

    private onResize() {
        var height = this.mainHolderDiv.parentElement.clientHeight
        var minWidth = this.mainHolderDiv.parentElement.clientWidth - (190 + 190)
        this.mainHolderDiv.style.width = Math.min(height * ( 4.0 / 3.0), minWidth) + "px"
        this.mainHolderDiv.style.height = Math.min(height, minWidth * ( 3.0 / 4.0)) + "px"
    }
}