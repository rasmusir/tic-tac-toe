import { UIElement, view, bind } from "./UIElement";
import {PopupBubbleElement} from "./popupBubbleElement";

@view("registerWindow")
export class RegisterElement extends UIElement{
    
    @bind("usernameInput")
    private usernameInput: HTMLInputElement
    @bind("passwordInput")
    private passwordInput: HTMLInputElement
    @bind("repeatPasswordInput")
    private repeatPasswordInput: HTMLInputElement
    @bind("emailAddressInput")
    private emailAddressInput: HTMLInputElement
    @bind("cancel")
    private cancel: HTMLLinkElement
    @bind("registerForm")
    private registerForm: HTMLFormElement

    private registerListener: RegisterListener = null

    protected onViewCreated() {
        this.registerForm.onsubmit = event => this.onRegisterClicked(event)
        this.cancel.onclick = event => this.onCancelClicked(event)
    }

    public setRegisterListener(registerListener: RegisterListener){
        this.registerListener = registerListener
    }

    private onRegisterClicked(event: Event){
        event.preventDefault()
        var success = true
        var name = this.usernameInput.value.trim().toLowerCase()
        var password = this.passwordInput.value
        var repeatPassword = this.repeatPasswordInput.value

        if (name.length < 2){
            let errBubble = new PopupBubbleElement()
            errBubble.attachTo(this.usernameInput)
            errBubble.setText("Name must be at least 2 characters.")
            errBubble.show()
            success = false
        }
        if (password.length < 8){
            let errBubble = new PopupBubbleElement()
            errBubble.attachTo(this.passwordInput)
            errBubble.setText("Password must be at least 8 characters.")
            errBubble.show()
            success = false
        }
        if (password !== repeatPassword){
            let errBubble = new PopupBubbleElement()
            errBubble.attachTo(this.repeatPasswordInput)
            errBubble.setText("Passwords don't match.")
            errBubble.show()
            success = false
        }
        if (this.registerListener !== null && success){
            this.destroy()
            this.registerListener.onRegisterCompleted(name)
        }
    }

    private onCancelClicked(event: Event){
        event.preventDefault()
        this.destroy()
        if (this.registerListener !== null){
            this.registerListener.onRegisterCancel()
        }
    }
}
export interface RegisterListener {
        onRegisterCompleted(name: string): void
        onRegisterCancel(): void
}