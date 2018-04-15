import { UIElement, root, bind } from "./UIElement";
import { LoginElement } from "./loginElement";

@root(document.body)
export class Index extends UIElement {

    @bind("loginPlaceholder")
    private loginDiv: HTMLDivElement

    protected onViewCreated(): void {
        var loginElement = new LoginElement()
        loginElement.appendTo(this.loginDiv)
    }
}