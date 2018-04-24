export abstract class UIElement {

    private static rootViewPath: string = "/view/"
    private static viewCache = new Map<string, HTMLTemplateElement>()
    protected root : HTMLElement
    private viewBindings : Array<{tag: string, property: string}>

    private displayBeforeGone = "block"

    constructor() {
        this.setViewFromCache((this.constructor as any)["_view"])
        this.bindViews()
        this.onViewCreated()
    }

    protected setViewFromCache(pathOrElement: string | HTMLElement) {
        if (pathOrElement instanceof HTMLElement) {
            this.root = pathOrElement
        } else {
            let cached = UIElement.viewCache.get(pathOrElement)
            if (cached.content.childElementCount == 0) throw Error("A viewfile must have at least 1 root element")
            this.root = document.importNode(cached.content, true).firstElementChild as HTMLElement
        }
    }

    private bindViews() {
        this.viewBindings = this.viewBindings || new Array<{tag: string, property: string}>()
        var nodeList = this.root.querySelectorAll("[tag]")
        var node : Element;
        var binding : {tag: string, property: string}
        for (var i = 0; i < nodeList.length; i++) {
            node = nodeList.item(i)
            binding = this.viewBindings.find(binding => binding.tag == node.getAttribute("tag"))
            if (binding != null)
                (this as any)[binding.property] = node
        }
    }

    public appendTo(parent: Node) {
        parent.appendChild(this.root)
    }

    public hide() {
        this.displayBeforeGone = getComputedStyle(this.root, null).getPropertyValue("display")
        this.root.style.display = "none"
    }

    public show() {
        this.root.style.display = this.displayBeforeGone
    }

    public destroy() {
        this.root.parentElement.removeChild(this.root)
        this.onDestroyed()
    }

    public getRoot(): HTMLElement {
        return this.root
    }

    protected abstract onViewCreated() : void
    protected onDestroyed() : void { }

    public static preload(view: string) {
        UIElement.viewCache.set(view, null)
    }

    public static load() {
        return Promise.all(
            [...UIElement.viewCache.keys()].map(view =>
                fetch(UIElement.rootViewPath + view).then(r => r.text()).then(html => {
                    var tmp = document.createElement("template")
                    tmp.innerHTML = html
                    this.viewCache.set(view, tmp)
                })
            )
        )
    }
}

export function view(view: string) {
    return function<T extends {new(...args:any[]):UIElement}>(constructor: T){
        UIElement.preload(view);
        (constructor as any)["_view"] = view
        return constructor
    }
}

export function root(root: Element) {
    return function<T extends {new(...args:any[]):UIElement}>(constructor: T){
        (constructor as any)["_view"] = root
        return constructor
    }
}

export function bind(tag: string) {
    return function(target: UIElement, property: string) {
        (target as any).viewBindings = (target as any).viewBindings || new Array<any>();
        (target as any).viewBindings.push({
            tag,
            property
        })
    }
}