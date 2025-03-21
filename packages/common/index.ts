


export interface SignupIncomingMessage{
    ip:String,
    publicKey:String,
    signedMessagE:String,
    callbackId:String
}


export interface ValidateIncomingMessage{
    callbackId:String,
    signedMessage:String,
    status:"Good" | "Bad",
    latency:Number,
    websiteId:String,
    validatorId:String,

}


export interface SignupOutgoingMessage{
    validatorId:String,
    callbackId:String
}


export interface ValidateOutgoingMessage{
    url:String,
    callbackId:String,
    websiteId:String,
}




export type IncomingMessage={

    type:"signup",
    data:SignupIncomingMessage
} | {
    type:"validate",
    data:ValidateIncomingMessage
}



export type OutgoingMessage={

    type:"signup",
    data:SignupOutgoingMessage
} | {
    type:"validate",
    data:ValidateOutgoingMessage
}