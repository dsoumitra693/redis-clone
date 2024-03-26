export class Mutex {
    private isLock: boolean
    constructor() {
        this.isLock = false
    }


    private async aquireLock(): Promise<void> {
        return new Promise((resolve, reject) => {
            const waitForlock = () => {
                if (!this.isLock) {
                    this.isLock = true
                } else {
                    setTimeout(waitForlock, 10);
                }
            }

            waitForlock()
        })
    }

    private async releaseLock() {
        this.isLock = false
    }

    public async asyncMutex(func:()=>any) {
        this.aquireLock()

        try {
            return await func()
        } catch (error) {
            throw new Error(error as "")
        }finally{
            this.releaseLock()
        }
    }
}