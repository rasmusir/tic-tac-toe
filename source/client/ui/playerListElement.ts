import { UIElement, view } from "./UIElement";
import { Player } from "../player";
import { PlayerPlateElement } from "./playerPlateElement";

@view("playerList")
export class PlayerListElement extends UIElement{
    protected onViewCreated() {
        
    }

    public populate(players: Map<string, Player>) {
        players.forEach( (player, id) => {
            var playerPlate = new PlayerPlateElement()
            playerPlate.appendTo(this.root)
        })
    }
}