import { UIElement, view, bind } from "./UIElement";
import { PopupBubbleElement } from "./popupBubbleElement";
import { RegisterElement, RegisterListener } from "./registerElement";
import { User } from "../model/user";
import { API } from "../api";

@view("loginWindow")
export class LoginElement extends UIElement implements RegisterListener {

    @bind("usernameInput")
    private usernameInput: HTMLInputElement
    @bind("passwordInput")
    private passwordInput: HTMLInputElement
    @bind("loginForm")
    private loginForm: HTMLFormElement
    @bind("register")
    private register: HTMLLinkElement

    private loginListener: LoginListener = null

    protected onViewCreated() {
        this.loginForm.onsubmit = event => this.onLoginClicked(event)
        this.register.onclick = event => this.onRegisterClicked(event)
    }

    public setLoginListner(loginListener: LoginListener) {
        this.loginListener = loginListener
    }

    private async onLoginClicked(event: Event){
        event.preventDefault()
        var username = this.usernameInput.value.trim().toLowerCase()
        var password = this.passwordInput.value

        if (username.length <= 2) {
            var errBubble = new PopupBubbleElement()
            errBubble.attachTo(this.usernameInput)
            errBubble.setText("Name must be at least 2 characters.")
            errBubble.show()
            return
        }
        
        if (password.length == 0) {
            var errBubble = new PopupBubbleElement()
            errBubble.attachTo(this.passwordInput)
            errBubble.setText("Enter a password")
            errBubble.show()
            return
        }

        if (await API.User.login(username, password)) {
            this.destroy()
            if (this.loginListener !== null) {
                this.loginListener.onLogin()
            }
        }
    }

    private onRegisterClicked(event: Event){
        event.preventDefault()
        this.hide()
        var registerElement = new RegisterElement()
        registerElement.appendTo(this.root.parentElement)
        registerElement.setRegisterListener(this)
    }

    onRegisterCompleted() {
        this.show()
    }
    
    onRegisterCancel() {
        this.show()
    }
}

export interface LoginListener {
    onLogin(): void
}