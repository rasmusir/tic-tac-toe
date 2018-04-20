import { Database } from "../database";
import { Router } from "express";
import { Request, Response } from "express-serve-static-core";
import * as express from "express"
import * as bcrypt from "bcryptjs"
import { User } from "../model/user";
import { Collection } from "mongodb";
import { ErrorCodes } from "../ErrorCodes";

export class UserApi {

    private static router: Router
    private static userCollection: Collection<User>

    static getRouter(db: Database) {
        UserApi.userCollection = db.getCollection("user")
        UserApi.router = Router()

        UserApi.router.use(express.json())
        UserApi.router.post("/register", (req, res) => UserApi.register(req, res))
        UserApi.router.post("/login", (req, res) => UserApi.login(req, res))

        return UserApi.router
    }

    static async register(req: Request, res: Response) {
        let user = new User()
        user.username = (req.body.username as string).toLowerCase()
        user.password = await bcrypt.hash(req.body.password, 8)
        user.displayname = req.body.username
        user.email = req.body.email || null
        user.created = new Date()
        user.coins = 0
        user.accessToken = await bcrypt.genSalt(8)

        let foundUser = await UserApi.userCollection.findOne({ username: user.username })

        if (foundUser) {
            res.send({ error: ErrorCodes.UsernameTaken })
        } else {
            await UserApi.userCollection.insert(user)
            delete user.password
            delete user.titles
            delete user.accessTokenIssued
            res.send(user)
        }
    }

    static async login(req: Request, res: Response) {
        let username = req.body.username.toLowerCase()
        let password = req.body.password
        
        let user = await this.userCollection.findOne({ username: username })

        if (user != null && await bcrypt.compare(password, user.password)) {
            delete user.password
            delete user.titles
            delete user.accessTokenIssued
            res.send(user)
            return
        }

        res.statusCode = 401
        res.send({
            error: ErrorCodes.InvalidAuthentication
        })
    }

    static authenticate(req: Request, res: Response, next: Function) {
        let header = req.header("Authorization")

        if (header) {
            let split = header.split(" ")
            if (split.length == 2 && split[0] == "Token") {
                let token = split[1]
                UserApi.userCollection.findOne({ accessToken: token }).then(user => {
                    if (user != null) {
                        req.user = user
                        next()
                    }
                    else {
                        res.statusCode = 403
                        res.send()
                    }
                }).catch(() => {
                    res.statusCode = 403
                    res.send()
                })
            } else {
                res.statusCode = 403
                res.send()
            }
        } else {
            res.statusCode = 403
            res.send()
        }
    }

    static updateUser(user: User) {
        return UserApi.userCollection.update({ _id: user._id }, user)
    }
}

declare global {
    namespace Express {
        interface Request {
            user: User
        }
    }
}
