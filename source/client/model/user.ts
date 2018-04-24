export class User {
    private _displayname: string
    private _username: string
    private _title: string
    private _coins: number
    private _id: string

    get displayname() { return this._displayname }
    get username() { return this._username }
    get title() { return this._title }
    get coins() { return this._coins }
    get id() { return this._id }

    private constructor(source: any) {
        this._username = source.username
        this._displayname = source.displayname
        this._title = source.title
        this._coins = source.coins
        this._id = source.id
    }

    static from(source: Object) {
        return new User(source)
    }
}