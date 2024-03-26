import * as net from "net"
import { KVStore } from "../Store/KVStore"

export class RedisServer{
    server:net.Server
    store:KVStore
    constructor() {
        this.server = net.createServer()
        this.store = new KVStore()

        this.server.on("connection", this.handleConnection.bind(this))
        this.server.on("error",this.handleError.bind(this))
    }

    start(port:number):void{
        this.server.listen(port, ()=>{
            console.log("Redis server started on", port)
        })
    }

    private handleConnection(socket:net.Socket):void {
        console.log(`Client connected: ${socket.address}:${socket.remotePort}`)

        socket.on("data",(data:Buffer)=>{
            const command = data.toString().trim().split(" ")
            
            this.handleCommand(socket, command)
        })

        socket.on("error", (error)=>{
            console.log(`Socket error: ${error.message}`)
        })

        socket.on("close", ()=>{
            console.log(`Client disconnected: ${socket.address}:${socket.remotePort}`)
        })
    }

    private handleCommand(socket:net.Socket, command:string[]) {
        const [commandName, ...args] = command

        switch (commandName.toLocaleUpperCase()) {
            case "SET":
                this.handleSetCommand(socket, args)
                break;

            case "GET":
                this.handleGetCommand(socket, args)

            default:
                socket.write("-ERR unkonwn command\r\n")
                break;
        }
    }

    private handleSetCommand(socket:net.Socket, args:string[]) {
        if(args.length !== 2){
            socket.write("-ERR wrong number of arguments for SET command recived")
            return
        }

        const [key, value] = args
        this.store.set(key, value)
        socket.write("+OK\r\n")
    }
    private async handleGetCommand(socket:net.Socket, args:string[]){
        if(args.length !== 1){
            socket.write("-ERR wrong number of arguments for GET command")
            return
        }

        const [key] = args
        let value = await this.store.get(key)
        if(value !== undefined){
            socket.write(`$${value.length}\r\n${value}\r\n`)
        }else{
            socket.write('$-1\r\n')
        }
    }

    private handleError(error:Error) {
        console.log(`Server error:${error.message}`)
    }
}