import http from "http";
import WebSocket, {Server} from "ws";
import {  SupportedMessage, IncomingMessage } from "./messages/incominMessages";
import { OutgoingMessage } from "./messages/OutgoingMessages";
import { SupportedMessage as OutgoingSupportedMessage } from "./messages/OutgoingMessages";
import { UserManager } from "./UserManager";
import { Store } from "./Store/Store";
import * as uuid from "uuid";

const PORT = 8080

const sessions = new Map()


const httpServer = http.createServer((req, res)=>{
    res.writeHead(200, {'content-type': 'text/plain'})
    res.end()

})

const userManager = new UserManager()
const store = new Store()

const wss = new Server({server: httpServer})

wss.on('connection', (ws:WebSocket)=>{
    
    console.log("New Websocket connection!")

    ws.on("message", (message)=>{
        
      try{
        messageHandler(ws, JSON.parse(message.toString()))

      }catch(e){
        console.log(e)

      }
    })


})



httpServer.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`)
})

function messageHandler(ws:WebSocket, message: IncomingMessage) {
    
    if(message.type === SupportedMessage.JoinRoom){
        
        const {name, roomId} = message.payload

        if(!name || !roomId) {
            ws.send(JSON.stringify("Error: name, userid and roomid is required to join the room"))
            return
        }

        const existingSession = Array.from(sessions.values()).find(
        (session)=> session.name === name && session.roomId === roomId)
        

        const chatHistory = store.getChats(roomId);

        if (existingSession) {
            ws.send(
              JSON.stringify({
                type: OutgoingSupportedMessage.UserAlreadyInRoom,
                payload: {
                  message: `${name} is already in the room!`,
                  sessionId: existingSession.sessionId,
                  roomId: existingSession.roomId,
                  chatHistory: chatHistory.length > 0 ? chatHistory : [],
                },
              })
            );
            return;
          }

        
        const sessionId = uuid.v4()
        const userId = uuid.v4()

        sessions.set(sessionId, {
            name: name,
            roomId: roomId,
            userId: userId,
            ws: ws,
            sessionId: sessionId,
        })
        

        let userResult = userManager.addUser(message.payload.name, userId, roomId, ws)
        
        
        ws.send(JSON.stringify({
            type: OutgoingSupportedMessage.UserJoined,
            payload: {
                sessionId: sessionId,
                roomId: roomId,
                chatHistory: chatHistory.length > 0 ? chatHistory : [],
            }
        }))

    }

    if(message.type === SupportedMessage.SendMessage) {
        const {sessionId} = message.payload
        
        
        if(!sessionId) {
            ws.send(JSON.stringify("Error: sessionId and roomid is required to join the room"))
            return
        }

        const findSession = sessions.has(sessionId)
        
        
        if(!findSession) {
            return
            
        }

        let foundUserId = sessions.get(sessionId)
        let roomId = foundUserId.roomId
        

       
        
        let user = userManager.getUser(roomId, foundUserId.userId)
        if(!user){
            console.log("No user Found in this chat!")
            return
        }
        
        let chat = store.addChat(foundUserId.userId, user?.name, message.payload.message, roomId)
        
        

        if(!chat){
            return
        }
        
        const outgoingPayload: OutgoingMessage = {
            type: OutgoingSupportedMessage.AddChat,
            payload: {
                    chatid: chat.chatId,
                    roomId: roomId,
                    message: message.payload.message,
                    name: user.name,
                    upvotes:0

                }


            }

        userManager.broadcast(roomId, foundUserId.userId, outgoingPayload)



    }

    if(message.type === SupportedMessage.UpvoteMessage){
        const {sessionId, chatId } = message.payload
        
        if(!chatId || !sessionId) {
            ws.send(JSON.stringify("Error: chatid, userid and roomid is required to join the room"))
            return
        }

        const findSession = sessions.has(sessionId)
        if(!findSession) {
            return
            
        }

        let foundUserId = sessions.get(sessionId)
        let roomId = foundUserId?.roomId
       

        

        const chat = store.upvote(roomId, message.payload.chatId, foundUserId.userId)
        if(!chat){
            return
        }

        const outgoingPayload: OutgoingMessage = {
            type: OutgoingSupportedMessage.UpdateChat,
            payload: {
                    chatid: chat.chatId,
                    roomId: roomId,
                    upvotes:chat.upvotes.length

                }


            }

           let output = userManager.broadcast(roomId, foundUserId.userId, outgoingPayload)
           if(output !== null) {
            console.log("upvoted!")

           }


            
            



    }

}