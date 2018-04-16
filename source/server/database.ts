import { MongoClient } from "mongodb"
import { ServerOptions } from "./serverOptions"

export class Database {
    private mongoClient: MongoClient
    constructor() {

        MongoClient.connect(`mongodb+srv://${ServerOptions.username}:${ServerOptions.password}@${ServerOptions.server}`)
    }
}