import { Mutex } from "../utils/mutex"

export class KVStore<T = string>{
    private store: Map<T, any>
    private lock: Mutex

    constructor() {
        this.store = new Map()
        this.lock = new Mutex()
    }

    //store a smiple value 
    public async get(key: T) {
        return await this.lock.asyncMutex(() => {
            return this.store.get(key)
        })
    }
    public async set(key: T, value: any): Promise<void> {
        return await this.lock.asyncMutex(() => {
            this.store.set(key, value)
        })
    }
    public async delete(key: T): Promise<void> {
        return await this.lock.asyncMutex(() => {
            this.store.delete(key)
        })
    }
    public async has(key: T): Promise<boolean> {
        return this.lock.asyncMutex(() => {
            return this.store.has(key)
        })
    }

    // store a list
    public async listGet(key: T) {
        return await this.store.get(key) || []
    }
    public async listSet(key: T, value: any): Promise<void> {
        return await this.lock.asyncMutex(async () => {
            const list = await this.listGet(key) || []
            list.push(value)
            this.store.set(key, list)
        })
    }

    //store a set
    public async setGet(key: T) {
        return await this.store.get(key) || new Set()
    }
    public async setAdd(key: T, value: any): Promise<void> {
        return await this.lock.asyncMutex(async () => {
            const set = await this.listGet(key) || new Set()
            set.add(value)
            this.store.set(key, set)
        })
    }

    //store a hash map
    public async hashGet(key: T, field?:string) {
        let hash = await this.store.get(key)
        if(!field) return hash || new Map()

        return hash.get(field)
    }
    public async hashSet(key: T, field: string, value: any): Promise<void> {
        return await this.lock.asyncMutex(async () => {
            const hash = await this.listGet(key) || new Map<string, any>()
            hash.set(field, value)
            this.store.set(key, hash)
        })
    }
}