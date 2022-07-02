const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    username: {
        type: String,
        unique: true,
        required: true
    },
    
    email: {
        type: String,
        unique: true,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    profilePicture: {
        type: String,
        default: "https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg"
    },

    address: {
        type: String,
        required: true
    },

    branch: {
        type: String,
        required: true
    },

    phoneNumber: {
        type: String,
        required: true
    },

    isAdmin: {
        type: Boolean,
        default: false
    },

    friends: [{
        type: String
    }],

    postHistory: [{
        type: mongoose.Schema.ObjectId,
        ref: "post"
    }],

    commentHistory: [{
        type: mongoose.Schema.ObjectId,
        ref: "comment"
    }]

}, { timestamps: true })

module.exports = mongoose.model("user", UserSchema)