import { API } from "../api";
import { User } from "../model/user";

export class UserAPI {

    static currentUser: User

    static async register(username: string, password: string, email?: string) {
        if (username.trim().length != 0 && password.trim().length != 0) {
            let result = await API.post("/user/register", {
                username, 
                password,
                email
            }).then(response => response.json())

            if (result.error) {
                switch (result.error) {
                    case "username taken":
                        throw new API.User.UsernameTakenError("Username taken")
                }
            }

            return true
        } else {
            throw new API.User.InvalidUsernameOrPasswordError()
        }
    }

    static async login(username: string, password: string) {
        if (username.trim().length != 0 && password.length != 0) {
            let result = await API.post("/user/login", {
                username,
                password
            })

            if (result.ok) {
                UserAPI.currentUser = User.from((await result.json()).user)
                return true
            }
        }
        return false
    }

    static UsernameTakenError = class extends Error {
        constructor(message: string) {
            super(message)
        }
    }

    static InvalidUsernameOrPasswordError = class extends Error {
        constructor() {
            super("Invalid username or password")
        }
    }
}