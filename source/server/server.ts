//NOTE import libraries/modules
import * as express from "express"
import * as http from "http"
import * as WebSocket from "ws"
import { Client } from "./client"
import { Database } from "./database"
import { UserApi } from "./api/userApi";
import { Request, Response } from "express-serve-static-core";
import { TitleApi } from "./api/titleApi";
//NOTE create server "app"
const app = express()

//NOTE create server
const server = http.createServer(app)

const db = new Database()

app.use((req: Request, res: Response, next: Function) => {
    if (db.isConnected())
        next()
    else {
        res.sendStatus(500)
        console.error("Not connected to the database yet.")
    }
})

db.connect().then(() => {
    console.log("Connected to the database!")
    
    app.use("/user/", UserApi.getRouter(db))
    app.use("/title/", TitleApi.getRouter(db))
})

app.use("/script/", express.static("build/client/client/", {extensions: ["js"]}))
app.use("/shared/", express.static("build/client/shared/", {extensions: ["js"]}))
app.use("/style/", express.static("public/css/"))
app.use("/view/", express.static("public/views/", {extensions: ["html"]}))
app.use("/", express.static("public/pages/", {extensions: ["html"]}))

app.get("/playersonline", (req, res) => res.send(JSON.stringify({players: connectedClients.size})))

const webSocketServer = new WebSocket.Server({ server })
const connectedClients = new Map<string, Client>()
var currentId = 1

webSocketServer.on("connection", socket => {
    var client = new Client(socket, connectedClients)
})


server.listen(9080, () => console.log("Listening on port 9080"))