const User = require('../model/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { errorHandler } = require('../../validator/utils/errorHandler')

// Create user
const createUser = async (req, res) => {
    const { firstName, lastName, username, email, password, address, branch, phoneNumber, profilePicture, coverPhoto } = req.body

    try {
        let salt = await bcrypt.genSalt(10)
        let hashPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email,
            branch: branch,
            password: hashPassword,
            address: address,
            phoneNumber: phoneNumber,
            profilePicture: profilePicture,
            coverPhoto: coverPhoto
        })
        const savedUser = await newUser.save()
        res.status(200).json({ message: "New user has been saved", payload: savedUser })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Error", error: errorHandler(err) })
    }
}

// Update user
const updateUser = async (req, res) => {
    const decodedToken = res.locals.decodedToken

    try {
        const updateUser = await User.findOneAndUpdate({ _id: decodedToken._id }, req.body, { new: true })
        if(!updateUser) throw new Error("No user with id found!")
        res.status(200).json({ message: "Updated user", payload: updateUser })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: errorHandler(err) })
    }
}

// Update user password
const updatePassword = async (req, res) => {
    const decodedToken = res.locals.decodedToken

    try {
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(req.body.password, salt)
        req.body.password = hashPassword

        const updateUser = await User.findOneAndUpdate({ _id: decodedToken._id }, req.body, { new: true })
        if(!updateUser) throw new Error("No user with id found!")
        res.status(200).json({ message: "Updated user", payload: updateUser })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: errorHandler(err) })
    }
}

// Get current user
const getCurrentUser = async (req, res) => {
    const decodedToken = res.locals.decodedToken

    try {
        const foundUser = await User.findOne({ _id: decodedToken._id })
        if(!foundUser) throw { message: "No user with id found!" }
        res.status(200).json({ message: "Current user", payload: foundUser })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Get all users
const getAllUsers = async (req, res) => {
    try {
        let allUsers = await User.find()
        res.status(200).json({ payload: allUsers })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "error", error: err.mesaage })
    }
}

// Delete user
const deleteUser = async (req, res) => {
    const { id } = req.params

    try {
        let deletedUser = await User.findByIdAndDelete(id)
        if(!deletedUser) throw { message: "No user with id found!" }
        res.status(200).json({ message: "User has been deleted", payload: deletedUser })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Login user
const userLogin = async (req, res) => {
    const { email, password } = req.body

    try {
        const foundUser = await User.findOne({ email: email}).populate({ path: 'postHistory', populate: { path: 'postOwner' }}).populate({ path: 'postHistory', populate: { path: 'commentHistory', populate: { path: 'commentOwner' } }})
        if(!foundUser) throw { message: "Email not found!" }
        const comparedPassword = await bcrypt.compare(password, foundUser.password)
        if(!comparedPassword) throw { mesaage: "Password does not match!" }

        const jwtToken = jwt.sign({
            _id: foundUser._id,
            iat: Date.now()
        },
            process.env.SECRET_KEY,
            { expiresIn: "12h" }
        )

        res.status(200).json({ message: "User is logged in",  payload: foundUser, token: jwtToken })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message })
    }
}

module.exports = {
    createUser,
    updateUser,
    getCurrentUser,
    getAllUsers,
    deleteUser,
    userLogin,
    updatePassword
} 