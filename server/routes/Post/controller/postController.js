const Post = require('../model/Post')
const User = require('../../User/model/User')
const Comment = require('../../Comment/model/Comment')

// Create post
const createPost = async (req, res) => {
    const decodedToken = res.locals.decodedToken
    const { post } = req.body

    try {
        const foundUser = await User.findOne({ _id: decodedToken._id })
        if(!foundUser) throw { message: "User not found!" }

        const newPost = new Post({
            post: post,
            postOwner: foundUser._id
        })
        const savedPost = await newPost.save()
        foundUser.postHistory.push(savedPost.id);
        await foundUser.save()
        const updatedUser = await User.findOne({ _id: decodedToken._id }).populate({ path: 'postHistory', populate: { path: 'postOwner' }}).populate({ path: 'postHistory', populate: { path: 'commentHistory', populate: { path: 'commentOwner' } }})
        res.status(200).json({ message: "Saved new post!", payload: updatedUser, savedPost: savedPost })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Get all posts
const getAllPosts = async (req, res) => {
    try {
        const foundPosts = await Post.find().populate("postOwner")
        res.status(200).json({ posts: foundPosts })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Update post
const updatePost = async (req, res) => {
    const decodedToken = res.locals.decodedToken
    const { id } = req.params

    try {
        const foundPost = await Post.findById(id).populate("postOwner")
        if(!foundPost) throw { message: "Post not found!" }
        const foundUser = await User.findOne({ _id: decodedToken._id })
        if(!foundUser) throw { message: "User not found!" }

        if(foundUser._id.toString() === foundPost.postOwner._id.toString()) {
            const updatedPost = await Post.findByIdAndUpdate(id, req.body, { new: true })
            res.status(200).json({ message: "Post has been updated!", payload: updatedPost })
        }
        else {
            throw { message: "You do not have permission!" }
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "error", error: err.message })
    }
}

// Delete post
const deletePost = async (req, res) => {
    const decodedToken = res.locals.decodedToken
    const { id } = req.params

    try {
        const foundPost = await Post.findById(id).populate("postOwner")
        if(!foundPost) throw { message: "Post not found!" }
        const foundUser = await User.findOne({ _id: decodedToken._id })
        if(!foundUser) throw { message: "User not found!" }

        if(foundUser._id.toString() === foundPost.postOwner._id.toString()) {
            const deletedPost = await Post.findByIdAndDelete(id)
            if(!deletePost) throw { message: "Post not found!" }

            if(foundPost.commentHistory.length > 0) {
                const foundComments = await Comment.find({ post: id })
                if(!foundComments) throw { message: "No Comments found" }

                await foundComments.map(async comment => {
                    let commentUser = await User.findById(comment.commentOwner)
                    await commentUser.commentHistory.pull(comment._id.toString())
                    await commentUser.save()
                })
                await Comment.deleteMany({ post: id })
            }
            await foundUser.postHistory.pull(id)
            await foundUser.save()
            res.status(200).json({ message: "Post was deleted", deletedPost: deletedPost, deletedInUser: foundUser })
        }
        else {
            throw { message: "You do not have permission!" }
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "error", error: err.message })
    }
}

module.exports = {
    createPost,
    getAllPosts,
    updatePost,
    deletePost
} 