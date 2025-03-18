import { useAuth } from "@clerk/nextjs";
import axios from 'axios'
import { useEffect, useState } from "react";

const BACKEND_URL = "http://localhost:8080"

interface WebsiteTick {
    id: string;
    websiteId: string;
    validatorId: string;
    status: WebsiteStatus;
    latency: number | null;
    createdAt: Date;
    disabled: boolean;
  }
  
  interface Website {
    id: string;
    url: string;
    userId: string;
    disabled: boolean;
    ticks: WebsiteTick[];
  }

  enum WebsiteStatus {
    Good = 'Good',
    Bad = 'Bad'
  }


export function useWebsites(){


    const {getToken} = useAuth();

    const [websites,setWebsites]=useState<Website[]>()

    async function refreshWebsites(){
        const token = await getToken();
            
    const response = await axios.get(`${BACKEND_URL}/api/websites`,{
        headers:{
            Authorization:`${token}`
        }
    })

    setWebsites(response.data.websites);
    }



    useEffect(()=>{
        refreshWebsites();

        const interval = setInterval(()=>{
            refreshWebsites();
        },1000*60*1);

        return ()=>clearInterval(interval);
    },[])

    
    return websites;



}