import { json, Router, Request } from "express";
import { Collection, ObjectID } from "mongodb";
import { Title } from "../model/title";
import { Database } from "../database";
import { Response } from "express-serve-static-core";
import { UserApi } from "./userApi";

export class TitleApi {

    private static router: Router
    private static titleCollection: Collection<Title>

    static getRouter(db: Database) {
        TitleApi.titleCollection = db.getCollection("title")
        TitleApi.router = Router()

        TitleApi.router.use(json())
        TitleApi.router.get("/list", UserApi.authenticate, (req, res) => TitleApi.list(req, res))
        TitleApi.router.post("/set", UserApi.authenticate, (req, res) => TitleApi.set(req, res))

        return TitleApi.router
    }

    private static async list(req: Request, res: Response) {
        let titles = await TitleApi.titleCollection.find({ _id: {
            $in: req.user.titles
        }}).toArray()
        res.send(titles)
    }

    private static async set(req: Request, res: Response) {
        let titleId = req.user.titles.find(title => title.equals(new ObjectID(req.body.titleId)))

        if (titleId) {
            let title = await TitleApi.titleCollection.findOne({ _id: new ObjectID(titleId) })
            if (title) {
                req.user.title = title.title
                let result = await UserApi.updateUser(req.user)
                return res.send(title)
            }
        }

        res.statusCode = 404
        res.send()
    }
}