
import { randomUUIDv7, type ServerWebSocket } from "bun";
import type {IncomingMessage, SignupIncomingMessage} from "@repo/common"
import {prisma} from "@repo/db/client"
import nacl from 'tweetnacl';
import nacl_util from 'tweetnacl-util';
import { PublicKey } from "@solana/web3.js";

const availableValidators : {validatorId:string,ws:ServerWebSocket,publicKey:string}[]=[];

const COST_PER_VALIDATION = 100;
const CALLBACKS: {[validatorId:string]:(data:IncomingMessage)=> void}={}

Bun.serve({
    fetch(req,server){
        if(server.upgrade(req)){
            return;
        }

        return new Response("Upgrade request failed",{status:500});
    },
    port:8081,
    websocket:{
        async message(ws:ServerWebSocket,message:string){
            const data = JSON.parse(message);
            
            if(data.type=='signup'){
                const verified = await verifyMessage(
                    `Signed message for ${data.data.callbackId} with ${data.data.publicKey}`,
                    data.data.publicKey,
                    data.data.signedMessage
                )

                if(verified){
                    signupHandler(ws,data.data);
                }
            }
            else if(data.type== 'validate'){
                CALLBACKS[data.data.callbackId](data);
                delete CALLBACKS[data.data.callbackId];
            }
        },


        async close(ws:ServerWebSocket){
            availableValidators.splice(availableValidators.findIndex(v=>v.ws === ws),1);
        }   
    }
})




setInterval(async ()=>{

    const websitesToMonitor = await prisma.website.findMany({
        where:{
            disabled:false
        }
    })


    for(const website of websitesToMonitor){
        availableValidators.forEach(validator=>{
            const callbackId = randomUUIDv7();
            console.log(`Sending validate for ${validator.validatorId}`);
            validator.ws.send(JSON.stringify({
                type:'validate',
                data:{
                    url:website.url,
                    callbackId
                }
            }))


            CALLBACKS[callbackId]= async (data:IncomingMessage)=>{
                if(data.type=== 'validate'){
                    const {validatorId,latency,status,signedMessage}=data.data;

                    const verified = await verifyMessage(
                        `Replying to callback id : ${callbackId}`,
                        validator.publicKey,
                        signedMessage
                    )

                    if(!verified){
                        return;

                    }

                    await prisma.$transaction(async(tx)=>{
                        await tx.websiteTick.create({
                            data:{
                                latency,
                                status,
                                validatorId,
                                websiteId:website.id
                            }
                        })

                        await tx.validator.update({
                            where:{
                                id:validatorId
                            },
                            data:{
                                pendingAmount:{increment:COST_PER_VALIDATION}
                            }
                        })
                    })
                }
            }
        })
    }

},60 * 1000);



async function verifyMessage(message:string,publicKey:string,signature:string){
    const messageBytes = nacl_util.decodeUTF8(message);
    const result = nacl.sign.detached.verify(
        messageBytes,
        new Uint8Array(JSON.parse(signature)),
        new PublicKey(publicKey).toBytes()
    )

    return result;
}



async function signupHandler(ws:ServerWebSocket,{ip,publicKey,signedMessage,callbackId}:SignupIncomingMessage){

    const validatorDb = await prisma.validator.findFirst({
        where:{
            publicKey
        }
    })

    if(validatorDb){
        ws.send(JSON.stringify({
            type:'signup',
            data:{
                validatorId:validatorDb.id,
                callbackId
            }
        }))


        availableValidators.push({
            validatorId:validatorDb.id,
            ws:ws,
            publicKey:validatorDb.publicKey
        })
        return;
    }



    const validator = await prisma.validator.create({
        data:{
            publicKey,
            ipAddress:ip,
            location:'unkown'
        }
    })

    ws.send(JSON.stringify({
        type:'signup',
        data:{
            validatorId:validator.id,
            callbackId,

        }
    }))


    availableValidators.push({
        validatorId:validator.id,
        ws:ws,
        publicKey:validator.publicKey
    })



}