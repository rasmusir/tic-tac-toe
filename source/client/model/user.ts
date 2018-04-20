export class User {
    private _username: string
    private _title: string
    private _email: string
    private _coins: number
    private _id: string
    private _created: Date

    get username() { return this._username }
    get title() { return this._title }
    get email() { return this._email }
    get coins() { return this._coins }
    get id() { return this._id }
    get created() { return this._created }

    private constructor(source: any) {
        this._username = source.username
        this._title = source.title
        this._email = source.email
        this._coins = source.coins
        this._id = source.id
        this._created = source.created
    }

    static from(source: Object) {
        return new User(source)
    }
}