import { User } from "./model/user";
import { UserAPI } from "./api/user";

export class API {

    static jwt: string = null

    static post(url: string, data: Object) {
        let headers = API.getHeaders()
        headers.set("Content-Type", "application/json")
        return fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers
        })
    }

    static get(url: string) {
        return fetch(url, {
            method: "GET",
            headers: API.getHeaders()
        })
    }

    private static getHeaders() {
        let headers = new Headers()
        if (API.jwt)
            headers.set("Authorization", "Bearer " + API.jwt)
        return headers
    }

    static User = UserAPI
}

