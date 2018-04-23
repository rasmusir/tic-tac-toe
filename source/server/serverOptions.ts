//NOTE import serverOptions.json
var serverOptions;
try {
    serverOptions = require("../../../serverOptions.json")
} catch (e) {
    console.error("no serverOptions.json found. See serverOptions.example.json.")
    process.exit(1)
}

export var ServerOptions = serverOptions