import { UIElement, root, bind } from "./UIElement";
import { LoginElement, LoginListener } from "./loginElement";
import { Connections } from "../connections";

@root(document.body)
export class Index extends UIElement implements LoginListener {

    @bind("loginPlaceholder")
    private loginDiv: HTMLDivElement

    @bind("mainHolder")
    private mainHolderDiv: HTMLDivElement

    private connections: Connections
    private loginElement: LoginElement

    protected onViewCreated(): void {
        this.loginElement = new LoginElement()
        this.loginElement.appendTo(this.loginDiv)
        this.loginElement.setLoginListner(this)
        window.addEventListener("resize", () => this.onResize())
        this.onResize()
    }

    setConnections(connections: Connections) {
        this.connections = connections
    }

    async onRequestLogin(name: string, title: string) {
        try {
            await this.connections.connectToServer(name)
            this.loginElement.destroy()
            this.loginElement = null
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