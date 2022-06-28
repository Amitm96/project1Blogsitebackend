const mongoose = require('mongoose');
const validator = require('validator')
const authorSchema = new mongoose.Schema( {
  
     fname: {
        type : String,
        required : 'First Name is required',
        trim : true
     }, 
     lname: {
        type : String,
        required : 'Last Name is required',
        trim : true
     }, 
     title: {
        type : String,
        enum : ['Mr', 'Mrs', 'Miss'],
        required: 'Title is required'
     },
      email: {
        type : String,
        required : 'Email is required',
        trim: true,
        lowercase: true,
        unique : true,
        validate : {
         validator : validator.isEmail,
         message : "Not a valid email",
         isAsync: false
        }
      },  
      password: {
        type : String,
        required : 'Password is required',
        trim : true
      }

},{ timestamps: true });

module.exports = mongoose.model('Author', authorSchema)