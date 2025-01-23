import * as uuid from "uuid";

type UserId = string


interface Chat{
    chatId: string,
    userId: UserId,
    name:string,
    message: string,
    upvotes: UserId[]

}

interface Room {
    roomId: string,
    chats: Chat[]
}

export class Store{
    private store: Map<string, Room>
    constructor() {
        this.store = new Map<string, Room>()

    }
    initRoom(roomId:string) {
        this.store.set(roomId, {
            roomId,
            chats: []
        })

    }

    getChats(roomId:string) {
        const room = this.store.get(roomId)
        if(!room) {
            return []
        }
        if(room.chats.length > 100){
        return room.chats.slice(-100)
        }
        return room.chats

    }

    addChat(userId:UserId, name:string, message:string, roomId:string){
        if(!this.store.get(roomId)){
            this.initRoom(roomId)
        }

        const room = this.store.get(roomId)
        if(!room) {
            return
        }

        let chat = {
            chatId: uuid.v4(),
            userId: userId,
            name: name,
            message: message,
            upvotes: []
        }

        room.chats.push(chat)
        return chat

    }

    upvote(roomId:string, chatId:string, userId:UserId){
        const room = this.store.get(roomId)

        if(!room) {
            console.log("No room Found!")
            return null

        }

        const chat = room.chats.find(id => id.chatId === chatId)
        if(!chat) {
            console.log("No chat Found!")
            return
        }

        const upvoted = chat.upvotes.includes(userId)

        if(upvoted){
          chat.upvotes = chat.upvotes.filter((id) => id !== userId)
        }
        else {
            chat.upvotes.push(userId)

        }

       
        return chat



    }

}