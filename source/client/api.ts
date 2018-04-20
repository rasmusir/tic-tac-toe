import { User } from "./model/user";

export class API {
    static post(url: string, data: Object) {
        return fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        })
    }

    static User = class {
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

                return User.from(result)
            } else {
                throw new API.User.InvalidUsernameOrPasswordError()
            }
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
}