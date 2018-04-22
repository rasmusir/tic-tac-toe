import { Database } from "../database";
import { Router } from "express";
import { Request, Response } from "express-serve-static-core";
import * as express from "express"
import * as bcrypt from "bcryptjs"
import * as jsonwebtoken from "jsonwebtoken";
import { User } from "../model/user";
import { Collection, Server } from "mongodb";
import { ErrorCodes } from "../ErrorCodes";
import { ServerOptions } from "../serverOptions";

export class UserApi {

    private static router: Router
    public static collection: Collection<User>

    static getRouter(db: Database) {
        UserApi.collection = db.getCollection("user")
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

        let foundUser = await UserApi.collection.findOne({ username: user.username })

        if (foundUser) {
            res.send({ error: ErrorCodes.UsernameTaken })
        } else {
            await UserApi.collection.insert(user)
            res.send()
        }
    }

    static async login(req: Request, res: Response) {
        let username = req.body.username.toLowerCase()
        let password = req.body.password
        
        let user = await this.collection.findOne({ username: username })

        if (user != null && await bcrypt.compare(password, user.password)) {
            
            let jwt = await new Promise((resolve, reject) =>
                    jsonwebtoken.sign(
                        { sub: user._id },
                        ServerOptions.jwtKey,
                        (err: any, token: Object) => {
                            if (err) reject()
                            else resolve(token)
                        }))

            res.send({
                user: {
                    id: user._id,
                    displayname: user.displayname,
                    username: user.username,
                    title: user.title,
                    coins: user.coins
                },
                jwt
            })
            return
        }

        res.statusCode = 401
        res.send({
            error: ErrorCodes.InvalidAuthentication
        })
    }

    static authenticate(req: Request, res: Response, next: Function) {
        let header = req.header("Authorization")
        let success = false
        let split = header ? header.split(" ") : []

        if (split.length == 2 && split[0] == "Bearer") {
            let token = split[1]

            jsonwebtoken.verify(token, ServerOptions.jwtKey, (err: any, decoded: {sub: string}) => {
                if (!err && decoded) {
                    req.userId = decoded.sub
                    success = true
                    next()
                }
            })
        }

        if (!success) {
            res.statusCode = 403
            res.send()
        }
    }

    static updateUser(user: User) {
        return UserApi.collection.update({ _id: user._id }, user)
    }
}

declare global {
    namespace Express {
        interface Request {
            userId: string
        }
    }
}
