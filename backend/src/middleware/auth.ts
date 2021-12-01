import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config()


const SECRET = process.env.SECRET!

const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if (token) {
            let decodedData = jwt.verify(token, SECRET)
            // if (typeof decodedData !== 'string') {
            //     req.userId = decodedData?.id
            // }
        }
        next()
    } catch (error) {
        console.log(error)
    }
}