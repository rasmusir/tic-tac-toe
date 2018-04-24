import { UIElement, bind, view } from "./UIElement";

@view("popupBubble")
export class PopupBubbleElement extends UIElement {

    @bind("text")
    private textDiv: HTMLDivElement

    private attachedTo: Element
    private offset = {x: 0, y: 0}
    private text: string

    protected onViewCreated(): void {
        
    }

    public setText(text: string) {
        this.text = text
    }

    public attachTo(element: HTMLElement | UIElement) {
        if (element instanceof UIElement)
            element = element.getRoot()
        var parent = element.parentElement

        this.attachedTo = parent
        this.offset.x = element.clientLeft + element.offsetLeft + element.clientWidth
        this.offset.y = element.clientTop + element.offsetTop
    }

    public show() {
        this.root.style.left = this.offset.x + "px"
        this.root.style.top = this.offset.y + "px"
        this.textDiv.innerText = this.text
        this.attachedTo.appendChild(this.root)
        window.setTimeout(() => this.destroy(), 5000)
    }
}