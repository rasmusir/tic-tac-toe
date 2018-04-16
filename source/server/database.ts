import { MongoClient } from "mongodb"
import { ServerOptions } from "./serverOptions"

export class Database {
    private mongoClient: MongoClient = null

    async connect() {
        return new Promise((resolve, reject) => {
            MongoClient.connect(`mongodb+srv://${ServerOptions.username}:${ServerOptions.password}@${ServerOptions.server}`, (err, client) => {
                if (err) {
                    reject(err)
                } else {
                    this.mongoClient = client
                    resolve()
                }
            })
        })
    }
}