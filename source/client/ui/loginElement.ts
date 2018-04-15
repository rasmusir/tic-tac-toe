import { UIElement, view, bind } from "./UIElement";
import { PopupBubbleElement } from "./popupBubbleElement";

@view("loginWindow")
export class LoginElement extends UIElement{

    @bind("nameInput")
    private nameInput: HTMLInputElement
    @bind("titleInput")
    private titleInput: HTMLInputElement
    @bind("loginForm")
    private loginForm: HTMLFormElement

    private loginListener: LoginListener = null

    protected onViewCreated() {
        this.loginForm.onsubmit = event => this.onLoginClicked(event)
    }

    public setLoginListner(loginListener: LoginListener) {
        this.loginListener = loginListener
    }

    private onLoginClicked(event: Event){
        event.preventDefault()
        var name = this.nameInput.value.trim().toLowerCase()
        var title = this.titleInput.value.trim().toLowerCase()
        if (name.length >= 2) {
            if (this.loginListener !== null)
                this.loginListener.onRequestLogin(name, title)
        } else {
            var errBubble = new PopupBubbleElement()
            errBubble.attachTo(this.nameInput)
            errBubble.setText("Name must be at least 2 characters. Dickhead.")
            errBubble.show()
        }  
    }
}

export interface LoginListener {
    onRequestLogin(name: string, title: string): void
}