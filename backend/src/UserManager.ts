import  WebSocket from "ws"
import { OutgoingMessage, SupportedMessage } from "./messages/OutgoingMessages"


interface User{
    name: string,
    id:string,
    ws:WebSocket
}

interface Room{
    users: User[]
}


export class UserManager {
    private rooms: Map<string, Room>
     constructor() {
        this.rooms = new Map<string, Room>()

    }

    addUser(name:string, userId: string, roomId:string, ws:WebSocket ){
        if(!this.rooms.get(roomId)){
            this.rooms.set(roomId, {
                users: []
            })
        }

        let findUser = this.rooms.get(roomId)?.users.find((user) => user.name === name )
        if(findUser) {
            return null
        }

        let userAdded = this.rooms.get(roomId)?.users.push({
            id: userId,
            name: name,
            ws
        })
        return userAdded

    }

    removeUser(roomId:string, userId:string){
       let room = this.rooms.get(roomId)
       if(!room) {
        console.log("No room exists!")
        return

       }

       room.users = room.users.filter((user) => user.id !== userId);
       
        
    }

    getUser(roomId:string, userId:string){
        let userList = this.rooms.get(roomId)?.users
        let user = userList?.find((uid) => uid.id === userId)
        return user

    }

    broadcast(roomId:string, userId:string, message: OutgoingMessage){
        const user = this.getUser(roomId, userId)
        if(!user){
            console.error("User not Found!")
            return
        }

        const room = this.rooms.get(roomId) 
        if(!room) {
            console.error("Room not Found!")
            return
        }

        room.users.forEach((user)=> {
                try{
                user.ws.send(JSON.stringify(message))
                console.log("response sent to the user!")
                }catch(e){
                    console.log(e)
                    return null
                }
                
               
            
        })
    }

   

    
}