import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/users.js";

const app = express()
dotenv.config()

app.use(express.json({ limit: '30mb' }))
app.use(express.urlencoded({ limit: '30mb', extended: true }))
app.use(cors())

app.use('/users', userRoutes)

app.get('/', (req, res) => {
    res.send('Hello to Crypto Investment Platform API')
})

const PORT = process.env.PORT || 5000
const URL = process.env.CONNECTION_URL!

mongoose.connect(URL)
    .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
    .catch((error) => console.log(error.message))

