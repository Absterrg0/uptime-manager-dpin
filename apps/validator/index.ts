
import type {SignupOutgoingMessage, ValidateOutgoingMessage} from '@repo/common'
import { Keypair } from '@solana/web3.js';
import { randomUUIDv7, type ServerWebSocket } from 'bun';
import nacl from 'tweetnacl';
import nacl_util from "tweetnacl-util";
const CALLBACKS : {[callbackId:string]:(data:SignupOutgoingMessage)=>void}={};


let validatorId:string | null=null;

async function main(){
    const keyPair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.SECRET_KEY!)));
    
    const ws = new WebSocket("http://localhost:8081");


    ws.onmessage = async (event)=>{
        const data = JSON.parse(event.data);

        if(data.type == 'signup'){
            CALLBACKS[data.data.callbackId](data.data);
            delete CALLBACKS[data.data.callbackId];
        }
        else if(data.type == 'validate'){
            await validateHandler(ws,data.data,keyPair)
        }
    }

    ws.onopen = async ()=>{

        const callbackId = randomUUIDv7();

        CALLBACKS[callbackId]= (data)=>{
            validatorId = data.validatorId;
        }

        const signedMessage = await signMessage(`Signing message for ${callbackId}, ${keyPair.publicKey}`, keyPair);

        ws.send(JSON.stringify({
            type:"signiup",
            data:{
                callbackId,
                ip:"127.0.0.1",
                publicKey:keyPair.publicKey,
                signedMessage
            }
        }))

    }


}



async function validateHandler(ws:WebSocket,{url,callbackId,websiteId}:ValidateOutgoingMessage,keyPair:Keypair){
    console.log(`Starting to validate  ${url}`);

    const startTime = Date.now();
    const signature = await signMessage(`Replying to callbackId: ${callbackId}`,keyPair);

    try{
        const response = await fetch(url);
        const endTime = Date.now();
        const latency = endTime-startTime;
        const status = response.status;

        ws.send(JSON.stringify({
            type:'validate',
            data:{
                callbackId,
                latency,
                status: status === 200 ? "Good" : "Bad",
                websiteId,
                validatorId,
                signedMessage:signature
            }
        }))
    }
    catch(e){
        console.error(e);

        ws.send(JSON.stringify({
            type:'validate',
            data:{
                callbackId,
                latency:0,
                status:"Bad",
                websiteId,
                validatorId,
                signedMessage:signature
            }
        }))
    }

}






async function signMessage(message:string,keyPair:Keypair){
    const messageBytes =nacl_util.decodeUTF8(message);

    const signMessage = nacl.sign.detached(messageBytes,keyPair.secretKey);

    return JSON.stringify(Array.from(signMessage));
    

}


main();



setInterval(async ()=>{

},10000);