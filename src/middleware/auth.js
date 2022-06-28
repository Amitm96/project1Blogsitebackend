const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const blogModel = require('../models/blogModel')
const isValidObjectId = function (data) {
    return mongoose.Types.ObjectId.isValid(data)
}
const authenticate = function(req , res , next){
    try{
        let token = req.headers["x-api-key"]
        if(!token) return res.status(403).send({status: false , msg: "authentication token is missing"})
        let decodedToken;
        try{
            decodedToken = jwt.verify(token , "first-project")
        }
        catch(err){
            return res.status(400).send({status: false , msg : err.message})
        }
        if(!decodedToken) return res.status(401).send({status: false , msg: "token not valid"})
        else{
            req.decodedToken = decodedToken
            next()
        } 
    }
    catch(err){
        return res.status(500).send({status : false , msg : err.message})
    }
    
}

const authorization = async function(req , res , next){
    try{
        let blogId = req.params.blogId
        if(!isValidObjectId(blogId)) return res.status(400).send({status : false , msg: `${blog} is not a valid blog id `})
        let blog = await blogModel.findById(blogId)
        if(!blog) return res.status(400).send({status : false , msg: "blog is not present"})
        let decodedToken = req.decodedToken
        if(blog.authorId != decodedToken.authorId) return res.status(403).send({status: false , msg:"Not authorized to access the blog"})
        else{
            req.blog = blog
            next()
        }
    }
    catch(err){
        res.status(500).send({status:false , msg: err.message})
    }
}

const queryDeleteAuth = async function(req , res , next){
    try{
        let decodedToken = req.decodedToken
        let qAuthorId = req.query.authorId
        if(decodedToken.authorId != qAuthorId && qAuthorId!= undefined) return res.status(400).send({status:false , msg: "can not access different authorid"})
        else{
            req.authorId = decodedToken.authorId
            next()
        }
    }
    catch(err){
        res.status(500).send({status: false , msg : err.message})
    }
}

module.exports = {authenticate , authorization , queryDeleteAuth}

