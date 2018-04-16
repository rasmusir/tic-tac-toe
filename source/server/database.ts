import { MongoClient } from "mongodb"
var serverOptions = require("../../options.json")

export class Database {
    private mongoClient: MongoClient
    constructor() {

        MongoClient.connect(`mongodb+srv://${serverOptions.username}:${serverOptions.password}@${serverOptions.server}`)
    }
}