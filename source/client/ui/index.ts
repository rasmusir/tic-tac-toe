import { UIElement, root, bind } from "./UIElement";
import { LoginElement, LoginListener } from "./loginElement";
import { Connections } from "../connections";
import { PlayerListElement } from "./playerListElement";
import { Player } from "../player";
import { API } from "../api";

@root(document.body)
export class Index extends UIElement implements LoginListener {

    @bind("loginPlaceholder")
    private loginDiv: HTMLDivElement

    @bind("mainHolder")
    private mainHolderDiv: HTMLDivElement

    @bind("playerListHolder")
    private playerListHolderDiv: HTMLDivElement

    private connections: Connections
    private playerListElement: PlayerListElement

    protected onViewCreated(): void {
        let loginElement = new LoginElement()
        loginElement.appendTo(this.loginDiv)
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
        var parentWidth = this.mainHolderDiv.parentElement.clientWidth
        this.mainHolderDiv.style.width = Math.min(height * ( 4.0 / 3.0), parentWidth) + "px"
        this.mainHolderDiv.style.height = Math.min(height, parentWidth * ( 3.0 / 4.0)) + "px"
    }
}