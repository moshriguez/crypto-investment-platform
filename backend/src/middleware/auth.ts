import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config()


const SECRET = process.env.SECRET!

const auth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    if(!authHeader) {
        return res.status(403).json({ message: 'Forbidden' })
    } else {
        const token = authHeader.split(' ')[1]
        if (token) {
            try {
                let decodedData = jwt.verify(token, SECRET)
                console.log(decodedData)
                next()                
            } catch (error) {
                console.log(error)
                return res.status(401).json({ message: 'Unauthorized' })
            }
        } else {
            return res.status(403).json({ message: 'Forbidden' })
        }

    }
}

export default auth