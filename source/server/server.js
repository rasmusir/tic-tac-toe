//NOTE import libraries/modules
const express = require("express")
const http = require("http")

//NOTE create server "app"
const app = express()

//NOTE create server
const server = http.createServer(app)

app.use("/script/", express.static("source/client/"))
app.use("/", express.static("public/views/"))

server.listen(9080, () => console.log("Listening on port 9080"))