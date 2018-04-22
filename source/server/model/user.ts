import { Title } from "./title";
import { PlayerToken } from "./playerToken";
import { ObjectID } from "bson";

export class User {
    constructor(id?: ObjectID) {
        this._id = id || new ObjectID()
    }
    _id: ObjectID
    username: string = null
    password: string = null
    email: string = null
    displayname: string = null
    titles = new Array<ObjectID>()
    title: string = null
    created: Date = null
    coins: number = null
}