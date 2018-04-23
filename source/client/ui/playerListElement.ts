import { UIElement, view } from "./UIElement";
import { Player } from "../player";
import { PlayerPlateElement } from "./playerPlateElement";

@view("playerList")
export class PlayerListElement extends UIElement{
    protected onViewCreated() {
        
    }

    public populate(players: Array<Player>) {
        players.forEach( player => {
            var playerPlate = new PlayerPlateElement()
            //playerPlate.setPlayer(player)
            playerPlate.appendTo(this.root)
        })
    }
}