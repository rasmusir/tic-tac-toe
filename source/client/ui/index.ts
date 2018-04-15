import { UIElement, root, bind } from "./UIElement";
import { LoginElement, LoginListener } from "./loginElement";
import { Connections } from "../connections";

@root(document.body)
export class Index extends UIElement implements LoginListener {

    @bind("loginPlaceholder")
    private loginDiv: HTMLDivElement

    private connections: Connections
    private loginElement: LoginElement

    protected onViewCreated(): void {
        this.loginElement = new LoginElement()
        this.loginElement.appendTo(this.loginDiv)
        this.loginElement.setLoginListner(this)
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
}