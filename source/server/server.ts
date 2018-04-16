//NOTE import libraries/modules
import * as express from "express"
import * as http from "http"
import * as WebSocket from "ws"
import { Client } from "./client"
import { Database } from "./database"
//NOTE create server "app"
const app = express()

//NOTE create server
const server = http.createServer(app)
const db = new Database()
db.connect().then(() => {
    console.log("Connected to the database!")
})


app.use("/script/", express.static("build/client/", {extensions: ["js"]}))
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