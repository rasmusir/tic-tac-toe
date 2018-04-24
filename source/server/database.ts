import { MongoClient, Db } from "mongodb"
import { ServerOptions } from "./serverOptions"

export class Database {
    private mongoClient: MongoClient = null
    private db: Db = null

    async connect() {
        return new Promise((resolve, reject) => {
            MongoClient.connect(`mongodb+srv://${ServerOptions.username}:${ServerOptions.password}@${ServerOptions.server}`, (err, client) => {
                if (err) {
                    reject(err)
                } else {
                    this.mongoClient = client
                    this.db = client.db(ServerOptions.database)
                    resolve()
                }
            })
        })
    }

    isConnected() {
        return this.mongoClient != null && this.mongoClient.isConnected
    }

    getCollection(name: string) {
        return this.db.collection(name)
    }
}