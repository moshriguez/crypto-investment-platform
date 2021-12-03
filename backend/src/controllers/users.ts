import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config()



import User from '../models/user'

const SECRET = process.env.SECRET!

export const signin = async (req: Request, res: Response) => {
    const { email, password } = req.body
    try {
       const existingUser = await User.findOne({ email }) 
       // check if user exists
       if(!existingUser) return res.status(404).json({ message: 'User does not exist.'})
       // check if password is correct
       const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)
       if(!isPasswordCorrect) return res.status(400).json({ message: 'Invalid credentials'})
       // if all is good, create token
       const token = jwt.sign({id: existingUser._id}, SECRET, { expiresIn: '1h'})
       res.status(200).json({ result: existingUser, token })
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong.'})
    }
}

export const signup = async (req: Request, res: Response) => {
    const { email, firstName, lastName, password, confirm } = req.body
    try {
        const existingUser = await User.findOne({ email })
        // check if user exists
        if(existingUser) return res.status(400).json({ message: 'User already exists.'})
        // check if password and confirm match
        if(password !== confirm) return res.status(400).json({ message: 'Passwords do not match.'})
        // if all is good, hash password and create new user
        const hashedPassword = await bcrypt.hash(password, 12)
        const result = await User.create({ email, password: hashedPassword, name: `${firstName} ${lastName}` })
        // then create token
        const token = jwt.sign({id: result._id}, SECRET, { expiresIn: '1h' })
        res.status(200).json({ result, token })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Something went wrong.'})
    }
}

export const getUser = async (req: Request, res: Response) => {
    const { id } = req.params

    const user = await User.findById(id)
    if (!user) return res.status(404).json({ message: 'User does not exist with that id'})
    res.status(200).json({user})
}

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params
    
    const deletedItem = await User.findByIdAndRemove(id)
    if(deletedItem) return res.json({ message: 'Post deleted successfully', deletedItem})
    res.status(404).send('User does not exist with that id')
}

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params
    const { watchList } = req.body

    const user = await User.findByIdAndUpdate(id, { watchList }, {new: true})
    if (!user) return res.status(404).json({ message: 'User does not exist with that id'})
    res.status(200).json({user})
}