const express = require('express');
const router = express.Router();

const authorController= require("../controllers/authorController")
const blogController= require("../controllers/blogController")
const middleware = require("../middleware/auth")

// author apis
router.post("/authors", authorController.createAuthor)
router.post("/login" , authorController.authorLogin)

// blog apis
router.post("/blogs", middleware.authenticate ,  blogController.createBlog)
router.get("/blogs",middleware.authenticate, blogController.getBlogs)
router.put("/blogs/:blogId",middleware.authenticate, middleware.authorization, blogController.updatedBlogs)
router.delete("/blogs/:blogId" ,middleware.authenticate, middleware.authorization, blogController.deleteBlog)
router.delete("/blogs" ,middleware.authenticate,middleware.queryDeleteAuth, blogController.deleteBlogByQuery)

module.exports = router;