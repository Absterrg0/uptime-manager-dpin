import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { CLERK_SECRET_KEY } from "./config";

//TODO: CONVERT THE CONFIG TO ENV VARIABLE


export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token =  req.headers.authorization as string;
    

    if (!token) {
         res.status(403).json({ error: "Unauthorized" });
         return;
    }
    try {
        const decoded = jwt.verify(token, CLERK_SECRET_KEY) as { sub: string };

        req.userId = decoded.sub; // Clerk uses "sub" as user ID
        next();
    } catch (error) {

        res.status(403).json({ error: "Unauthorized" });
        return;
    }
}
