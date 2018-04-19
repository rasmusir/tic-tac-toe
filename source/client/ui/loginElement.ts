import { UIElement, view, bind } from "./UIElement";
import { PopupBubbleElement } from "./popupBubbleElement";
import { RegisterElement, RegisterListener } from "./registerElement";

@view("loginWindow")
export class LoginElement extends UIElement implements RegisterListener {

    @bind("usernameInput")
    private usernameInput: HTMLInputElement
    @bind("passwordInput")
    private passwordInput: HTMLInputElement
    @bind("loginForm")
    private loginForm: HTMLFormElement
    @bind("register")
    private register: HTMLFontElement

    private loginListener: LoginListener = null

    protected onViewCreated() {
        this.loginForm.onsubmit = event => this.onLoginClicked(event)
        this.register.onclick = event => this.onRegisterClicked(event)
    }

    public setLoginListner(loginListener: LoginListener) {
        this.loginListener = loginListener
    }

    private onLoginClicked(event: Event){
        event.preventDefault()
        var name = this.usernameInput.value.trim().toLowerCase()
        var password = this.passwordInput.value
        if (name.length >= 2) {
            if (this.loginListener !== null)
                this.loginListener.onRequestLogin(name, password)
            } else {
            var errBubble = new PopupBubbleElement()
            errBubble.attachTo(this.usernameInput)
            errBubble.setText("Name must be at least 2 characters.")
            errBubble.show()
        }  
    }

    private onRegisterClicked(event: Event){
        event.preventDefault()
        this.hide()
        var registerElement = new RegisterElement()
        registerElement.appendTo(this.root.parentElement)
        registerElement.setRegisterListener(this)
    }

    onRegisterCompleted(username: string) {
        // Yay
    }
    
    onRegisterCancel() {
        this.show()
    }
}

export interface LoginListener {
    onRequestLogin(name: string, password: string): void
}