import { json, Router, Request } from "express";
import { Collection, ObjectID, ObjectId } from "mongodb";
import { Title } from "../model/title";
import { Database } from "../database";
import { Response } from "express-serve-static-core";
import { UserApi } from "./userApi";

export class TitleApi {

    private static router: Router
    public static collection: Collection<Title>

    static getRouter(db: Database) {
        TitleApi.collection = db.getCollection("title")
        TitleApi.router = Router()

        TitleApi.router.use(json())
        TitleApi.router.get("/list", UserApi.authenticate, (req, res) => TitleApi.list(req, res))
        TitleApi.router.post("/set", UserApi.authenticate, (req, res) => TitleApi.set(req, res))

        return TitleApi.router
    }

    private static async list(req: Request, res: Response) {

        let result = await UserApi.collection.aggregate([
            { $match: { "_id": new ObjectId(req.userId) }},
            { $lookup: {
                from: TitleApi.collection.collectionName,
                localField: "titles",
                foreignField: "_id",
                as: "titles"
            }},
            { $project: { "titles": true }}
        ]).next()

        res.send(result.titles)
    }

    private static async set(req: Request, res: Response) {

        let titleResult = await UserApi.collection.aggregate([
            { $match: { "_id": new ObjectId(req.userId) }},
            { $lookup: {
                from: TitleApi.collection.collectionName,
                localField: "titles",
                foreignField: "_id",
                as: "titles"
            }},
            { $unwind: "$titles"},
            { $replaceRoot: { newRoot: "$titles" }},
            { $match: { "_id": new ObjectId(req.body.titleId) }}
        ]).next()

        if (titleResult && titleResult._id) {
            await UserApi.collection.update({ _id: new ObjectId(req.userId) }, { $set: { title: titleResult.title }} )
            return res.send(titleResult)
        }
        res.statusCode = 404
        res.send()
    }
}