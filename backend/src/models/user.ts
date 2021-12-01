import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    watchList: {type: [String], default: []},
    id: { type: String }
})

const User = mongoose.model('User', userSchema)

export default User