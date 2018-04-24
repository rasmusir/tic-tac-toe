import { UIElement } from './ui/UIElement'
import { Index } from './ui/index'
import { Connections } from './connections';

class Application {
    async main() {
        var index = new Index()
        index.setConnections(new Connections())
    }
}

var app = new Application()
var windowLoader = new Promise(resolve => window.addEventListener("load", () => resolve()))

Promise.all([
    UIElement.load(),
    windowLoader
]).then(() => app.main())