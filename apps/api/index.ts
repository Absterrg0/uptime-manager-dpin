import  express  from "express";
import type { Request,Response } from "express";
import {prisma} from "@repo/db/client"
import { authMiddleware } from "./middleware";
const app = express();




app.use(express.json())

app.post("/api/website",authMiddleware,async (req:Request,res:Response)=>{
    try{


    const userId = req.userId!;

    const {url} = req.body;

    const response = await prisma.website.create({
        data:{
            userId,
            url
        }
    })


    if(response.id){
        res.json({
            msg:"Website successfully created",
            id:response.id
        }).status(201)
    }

    }
    catch(e){
        console.error(e);
        res.json("Error occurred while creating website").status(500)
    }
})



app.get("/api/website/status",authMiddleware,async (req:Request,res:Response)=>{
    try{


    const userId = req.userId;
    const websiteId=req.query.websiteId as string;

    const response = await prisma.website.findFirst({
        where:{
            id:websiteId,
            userId,
            disabled:true
        },
        include:{
            ticks:true
        }
    })


    res.json(response).status(200)

    

    }
    catch(e){
        console.error(e);
        res.json("Error occurred while fetching status of the website").status(500)
    }

})



app.get("/api/websites",authMiddleware, async(req:Request,res:Response)=>{


    try{

    const userId = req.userId;


    const websites = await prisma.website.findMany({
        where:{
            userId,
            disabled:false
        }
    })

    res.json({
        websites
    }).status(200)

    

    }
    catch(e){
        console.error(e);
        res.json("Error while fetching all websites").status(500)
    }

})



app.delete("/api/website",authMiddleware, async (req:Request,res:Response)=>{

    try{
        const userId = req.userId;

        const websiteId = req.params.websiteId as string;
    
        const websiteResponse = await prisma.website.update({
            where:{
                id:websiteId,
                userId
            },
            data:{
                disabled:true,
                
            }
        })
    
        const tickResponse = await prisma.websiteTick.updateMany({
            where:{
                websiteId
            },
            data:{
                disabled:true
            }
        })
        if(websiteResponse && tickResponse){
            res.json({
                msg:"Website has been successfully deleted"
            }).status(200);
        }
    
    

    }catch(e){
        console.error(e);
        res.json("Error while deleting the website").status(500)
    }
})


app.listen(3000);