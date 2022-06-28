
const blogModel = require("../models/blogModel");
const authorModel = require("../models/authorModel");
const { default: mongoose } = require("mongoose");

const isValid = function (val) {
    if (typeof val === "undefined" || val === null) return false
    if (typeof val === "string" && val.trim().length === 0) return false
    return true;
}

const bodyValidator = function (data) {
    return Object.keys(data).length > 0
}

const isValidObjectId = function (data) {
    return mongoose.Types.ObjectId.isValid(data)
}

let createBlog = async function (req, res) {
    try {
        let Data = req.body;
        if (!bodyValidator(Data)) return res.status(400).send({ status: false, msg: "please enter the details" })
        if (!isValid(Data.title)) return res.status(400).send({ status: false, msg: "please enter title" })
        if (!isValid(Data.body)) return res.status(400).send({ status: false, msg: "please enter body" })
        if (!isValid(Data.authorId)) return res.status(400).send({ status: false, msg: "please enter authorId" })
        if (!isValidObjectId(Data.authorId)) return res.status(400).send({ status: false, msg: `${Data.authorId} is not a valid author Id` })
        if (!isValid(Data.category)) return res.status(400).send({ status: false, msg: "please enter category" })

        let isValidAuth = await authorModel.findById(Data.authorId)
        if (isValidAuth === null) res.status(400).send({ status: false, msg: "Author does not exist" })
        const { title, body, authorId, category, isPublished, tags, subcategory } = req.body;

        const blogData = {
            title, body, category, authorId, isPublished: isPublished ? isPublished : false,
            publishedAt: isPublished ? new Date() : null
        }

        if (tags) {
            if (Array.isArray(tags)) {
                blogData["tags"] = [...tags]
            }
            if (Object.prototype.toString.call(tags) === "[object String]") {
                blogData["tags"] = [tags]
            }
        }

        if (subcategory) {
            if (Array.isArray(subcategory)) {
                blogData["subcategory"] = [...subcategory]
            }
            if (Object.prototype.toString.call(subcategory) === "[object String]") {
                blogData["subcategory"] = [subcategory]
            }
        }

        let blog = await blogModel.create(blogData)
        res.status(201).send({ status: true, msg: "blog created successfully", data: blog })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: "SERVER ISSUES", reason: err.message })
    }
}



const getBlogs = async function (req, res) {
    try {
        const queryParams = req.query

        let obj = {
            isDeleted: false,
            deletedAt: null,
            isPublished: true
        }

        if (bodyValidator(queryParams)) {
            const {authorId , category , tags , subcategory} = queryParams;

            if (isValid(authorId) && isValidObjectId(authorId)) {
                obj.authorId = authorId
            }
            if (isValid(category)) {
                obj.category = category.trim()
            }
            if (isValid(tags)) {
                const tagsArr = tags.trim().split(',').map(tag => tag.trim())
                obj.tags = {$all : tagsArr}
            }
            if (isValid(subcategory)) {
                const subcArr = subcategory.trim().split(',').map(subc => subc.trim())
                obj.tags = {$all : subcArr}
            }
        }

        let getData = await blogModel.find(obj)
        if (getData.length == 0) {
            return res.status(400).send({ status: false, msg: "No such Blogs Available" })
        } else {
            return res.status(200).send({ status: true, data: getData })
        }
    } catch (err) {
        res.status(500).send({ msg: err.message })
    }
}




const updatedBlogs = async function (req, res) {
    try {
        let { title, body, tags, subcategory, isPublished } = req.body
        let blog = req.blog
        if (!bodyValidator(req.body)) return res.status(400).send({ status: false, msg: "please enter detils to be updated" })
        
        if (blog.isDeleted === false) {
            if (isValid(title)) blog.title = title
            if (isValid(body)) blog.body = body
            if (isValid(tags)) {
                if (Array.isArray(tags)) {
                    for (e of tags) {
                        blog.tags.push(e)
                    }
                }
                else blog.tags.push(tags)
            }
            if (isValid(subcategory)) {
                if (Array.isArray(subcategory)) {
                    for (e of subcategory) {
                        blog.subcategory.push(e)
                    }
                }
                else blog.subcategory.push(subcategory)
            }
            if(isPublished !== undefined ){
                blog.isPublished = isPublished
                let date = new Date();
                blog.publishedAt = isPublished ? date : null
            }
            
            blog.save()
            res.status(200).send({ status: true, data: blog })
        }
        else {
            res.status(404).send({ status: false, msg: "data not found or deleted" })
        }
    }
    catch (err) {
        res.status(500).send({ error: err.message })
    }

}

const deleteBlog = async function (req, res) {
    try {
        let blog = req.blog
        if (blog) {
            if (blog.isDeleted == false) {
                blog.isDeleted = true
                let date = new Date()
                blog.deletedAt = date
                blog.save()
                res.status(200).send({ status: true, })
            } else {
                res.status(404).send({ msg: "already deleted" })
            }
        }
        else {
            res.status(404).send({ status: false, msg: "blog dosen't exist" })
        }
    }
    catch (err) {
        res.status(500).send({ msg: err.message })
    }

}



const deleteBlogByQuery = async function (req, res) {
    try {
        let category = req.query.category
        let tags = req.query.tags
        let subcategory = req.query.subcategory

        let obj = { authorId: req.authorId, isDeleted: false };


        if (isValid(category)) {
            obj.category = category
        }
        if (isValid(tags)) {
            const tagsArr = tags.trim().split(',').map(tag => tag.trim())
            obj.tags = {$all : tagsArr}
        }
        if (subcategory) {
            const subcArr = tags.trim().split(',').map(subc => subc.trim())
            obj.subcategory = {$all : subcArr}
        }


        let blogs = await blogModel.find(obj)
        // console.log(blogs);
        if (blogs.length > 0) {
            let date = new Date()
            let updatedBlogs = await blogModel.updateMany(obj, { $set: { isDeleted: true, deletedAt: date } })
            res.status(200).send({ status: true , msg: "blogs deleted successfully"})
        }
        else {
            res.status(404).send({ status: false, msg: "no such blog available" })
        }

    }
    catch (err) {
        res.status(500).send({ msg: err.message })
    }
}



module.exports.createBlog = createBlog;
module.exports.getBlogs = getBlogs
module.exports.updatedBlogs = updatedBlogs;
module.exports.deleteBlog = deleteBlog;
module.exports.deleteBlogByQuery = deleteBlogByQuery;
