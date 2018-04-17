import { UIElement, view, bind } from "./UIElement";
import { PopupBubbleElement } from "./popupBubbleElement";

@view("loginWindow")
export class LoginElement extends UIElement{

    @bind("usernameInput")
    private usernameInput: HTMLInputElement
    @bind("passwordInput")
    private passwordInput: HTMLInputElement
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
        var name = this.usernameInput.value.trim().toLowerCase()
        var title = this.passwordInput.value.trim().toLowerCase()
        if (name.length >= 2) {
            if (this.loginListener !== null)
                this.loginListener.onRequestLogin(name, title)
        } else {
            var errBubble = new PopupBubbleElement()
            errBubble.attachTo(this.usernameInput)
            errBubble.setText("Name must be at least 2 characters.")
            errBubble.show()
        }  
    }
}

export interface LoginListener {
    onRequestLogin(name: string, title: string): void
}