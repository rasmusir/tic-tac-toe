import { Title } from "./title";
import { PlayerToken } from "./playerToken";
import { ObjectID } from "bson";

export class User {
    constructor(id?: ObjectID) {
        id = id || new ObjectID()
    }
    id: ObjectID
    username: string = null
    password: string = null
    email: string = null
    displayName: string = null
    titles = new Array<ObjectID>()
    activeTitle: string = null
    playerToken: string = null
    created: Date = null
    coins: number = null
}