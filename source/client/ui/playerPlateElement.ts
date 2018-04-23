import { UIElement, view, bind } from "./UIElement";
import { Player } from "../player";

@view("playerPlate")
export class PlayerPlateElement extends UIElement{

    @bind("name")
    private nameDiv: HTMLDivElement
    @bind("title")
    private titleDiv: HTMLDivElement

    protected onViewCreated() {
        
    }

    setPlayer(player: Player) {
        this.nameDiv.innerText = player.user.displayname
        this.titleDiv.innerText = player.user.title
    }
}