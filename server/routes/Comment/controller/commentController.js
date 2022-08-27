const Comment = require('../model/Comment')
const Post = require('../../Post/model/Post')
const User = require('../../User/model/User')

// Create comment
const createComment = async (req, res) => {
    const decodedToken = res.locals.decodedToken
    const { comment } = req.body
    const { id } = req.params

    try {
        const foundPost = await Post.findById(id)
        if(!foundPost) throw { message: "Post not found" }
        const foundUser = await User.findOne({ _id: decodedToken._id })
        if(!foundUser) throw { message: "User not found" }

        const newComment = new Comment({
            comment: comment,
            post: id,
            commentOwner: foundUser._id
        })
        const savedComment = await newComment.save()
        foundUser.commentHistory.push(savedComment.id)
        foundPost.commentHistory.push(savedComment.id)
        await foundUser.save()
        await foundPost.save()
        const updatedUser = await User.findOne({ _id: decodedToken._id }).populate({ path: 'postHistory', populate: { path: 'postOwner' }}).populate({ path: 'postHistory', populate: { path: 'commentHistory', populate: { path: 'commentOwner' } }})
        res.status(200).json({ message: "Saved new comment", payload: updatedUser, savedComment: savedComment })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Get all comments
const getAllComments = async (req, res) => {
    const decodedToken = res.locals.decodedToken

    try {
        const foundUser = await User.findOne({ _id: decodedToken._id })
        if(!foundUser) throw { message: "User not found!" }
        const foundComments = await Comment.find({ commentOwner: foundUser._id }).populate("commentOwner")
        res.status(200).json({ payload: foundComments })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Update comment
const updateComment = async (req, res) => {
    const decodedToken = res.locals.decodedToken
    const { id } = req.params

    try {
        const foundComment = await Comment.findById(id).populate("commentOwner")
        if(!foundComment) throw { message: "Comment not found" }
        const foundUser = await User.findOne({ _id: decodedToken._id })
        if(!foundUser) throw { message: "User not found" }

        if(foundComment.commentOwner._id.toString() === foundUser._id.toString()) {
            const updatedComment = await Comment.findByIdAndUpdate(id, req.body, { new: true })
            res.status(200).json({ message: "Comment has been updated", payload: updatedComment })
        }
        else {
            throw { message: "You do no have permission" }
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Delete comment
const deleteComment = async (req, res) => {
    const decodedToken = res.locals.decodedToken
    const { id } = req.params

    try {
        const foundComment = await Comment.findById(id)
        if(!foundComment) throw { message: "Comment not found" }
        const deletedComment = await Comment.findByIdAndDelete(id)
        if(!deletedComment) throw { message: "Comment not found" }
        const foundPost = await Post.findById(deletedComment.post)
        if(!foundPost) throw { message: "Post not found" }
        const foundUser = await User.findOne({ _id: decodedToken._id })
        if(!foundUser) throw { message: "User not found" }

        if(foundComment.commentOwner._id.toString() === foundUser._id.toString()) {
            foundUser.commentHistory.pull(id)
            foundPost.commentHistory.pull(id)
            await foundUser.save()
            await foundPost.save()
            res.status(200).json({ message: "Comment has been deleted", payload: deletedComment })
        }
        else {
            throw { message: "You do not have permission" }
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "error", error: err.message })
    }
}

module.exports = {
    createComment,
    getAllComments,
    updateComment,
    deleteComment
} 