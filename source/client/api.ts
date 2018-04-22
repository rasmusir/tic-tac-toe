import { User } from "./model/user";
import { UserAPI } from "./api/user";

export class API {
    static post(url: string, data: Object) {
        return fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        })
    }

    static get(url: string) {
        return fetch(url, {
            method: "GET"
        })
    }

    static User = UserAPI
}

