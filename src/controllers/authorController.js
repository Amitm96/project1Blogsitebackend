
const authorModel = require('../models/authorModel');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const isValid = function (val) {
    if (typeof val === "undefined" || val === null) return false
    if (typeof val === "string" && val.trim().length === 0) return false
    return true;
}

const regexValidator = function(val){
    let regx = /^[a-zA-z]+([\s][a-zA-Z]+)*$/;
    return regx.test(val);
}

const bodyValidator = function (data) {
    return Object.keys(data).length > 0
}
const createAuthor = async function (req, res) {
    try {
        let data = req.body
        let titleValues = ["Mr","Mrs", "Miss"];
        if (!bodyValidator(data)) return res.status(400).send({ status: false, msg: "please enter body" })
        if (!isValid(data.fname) || !regexValidator(data.fname)) return res.status(400).send({ status: false, msg: "please enter first name correctly" })

        if (!isValid(data.lname) || !regexValidator(data.lname)) return res.status(400).send({ status: false, msg: "please enter last name correctly" })

        if (!isValid(data.title)) return res.status(400).send({ status: false, msg: "please enter title" })

        if(!titleValues.includes(data.title)) return res.status(400).send({status: false , msg : "Title should be Mr , Mrs , Miss from this options"})

        if (!isValid(data.email)) return res.status(400).send({ status: false, msg: "please enter email" })

        if (!(validator.isEmail(data.email))) return res.status(400).send({ status: false, msg: "please enter a valid email" })

        if (!isValid(data.password)) return res.status(400).send({ status: false, msg: "please enter password" })

        let usedEmail = await authorModel.findOne({ email: data.email })
        if (usedEmail) return res.status(400).send({ status: false, msg: `${data.email} already registered` })

        let author = await authorModel.create(data)

        res.status(201).send({ status: true, msg: " author created successfully", data: author })

    }
    catch (err) {
        res.status(500).send({ errror: err.message })
    }
}

const authorLogin = async function (req, res) {
    try {
        let data = req.body
        if (!(bodyValidator(data))) return res.status(400).send({ status: false, msg: "please enter login details" })
        if (!isValid(data.email)) return res.status(400).send({ status: false, msg: "please enter email" })
        if (!(validator.isEmail(data.email))) return res.status(400).send({ status: false, msg: "please enter a valid email" })
        if (!isValid(data.password)) return res.status(400).send({ status: false, msg: "please enter password" })

        let author = await authorModel.findOne({ email: data.email, password: data.password })

        if (!author) return res.status(401).send({ satus: false, msg: "login failed, please provide correct email and password" })
        else {
            let token = jwt.sign({ authorId: author._id.toString(), iat: Math.floor(Date.now()/1000) , exp: Math.floor(Date.now()/1000) + 10*60*60 }, "first-project");
            res.setHeader("x-api-key", token)
            res.status(200).send({ status: true, data: token })
        }
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports = { createAuthor, authorLogin }
