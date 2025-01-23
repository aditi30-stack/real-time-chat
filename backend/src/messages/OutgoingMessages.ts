

export enum SupportedMessage {
    AddChat = "ADD_CHAT",
    UpdateChat = "UPDATE_CHAT",
    UserAlreadyInRoom = "USER_ALREADY_IN_THE_ROOM",
    UserJoined = "USER_JOINED"

}

export type MessagePayload = {
    roomId: string,
    message:string,
    name:string,
    upvotes:number,
    chatid: string,

}


export type OutgoingMessage = {
    type: SupportedMessage.AddChat,
    payload: MessagePayload
} | {
    type: SupportedMessage.UpdateChat,
    payload:Partial< MessagePayload>
} |  {
    type: SupportedMessage.UserAlreadyInRoom,
    payload: {message: string}
} | {
    type:  SupportedMessage.UserJoined,
    payload: {
        sessionId: string
    }
}