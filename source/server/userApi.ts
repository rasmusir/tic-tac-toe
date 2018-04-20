import { Database } from "./database";
import { Router } from "express";
import { Request, Response } from "express-serve-static-core";
import * as express from "express"
import * as bcrypt from "bcryptjs"
import { User } from "./model/user";
import { Collection } from "mongodb";
import { ErrorCodes } from "./ErrorCodes";

export class UserApi {

    private router: Router
    private userCollection: Collection<User>

    constructor(db: Database) {
        this.userCollection = db.getCollection("user")
        this.router = Router()

        this.router.use(express.json())
        this.router.post("/register", (req, res) => this.register(req, res))
        this.router.post("/authenticate", (req, res) => this.authenticate(req, res))
    }

    getRouter() { return this.router }

    async register(req: Request, res: Response) {
        let user = new User()
        user.username = (req.body.username as string).toLowerCase()
        user.password = await bcrypt.hash(req.body.password, 8)
        user.displayname = req.body.username
        user.email = req.body.email || null
        user.created = new Date()
        user.coins = 0

        let foundUser = await this.userCollection.findOne({ username: user.username })

        if (foundUser) {
            res.send({ error: ErrorCodes.UsernameTaken })
        } else {
            await this.userCollection.insert(user)
            delete user.password
            delete user.titles
            delete user.playerToken
            res.send(user)
        }
    }

    async authenticate(req: Request, res: Response) {
        let username = req.body.username.toLowerCase()
        let password = req.body.password
        
        let user = await this.userCollection.findOne({ username: username })

        if (user != null && await bcrypt.compare(password, user.password)) {
            delete user.password
            delete user.titles
            delete user.playerToken
            res.send(user)
            return
        }

        res.statusCode = 401
        res.send({
            error: ErrorCodes.InvalidAuthentication
        })
    }
}