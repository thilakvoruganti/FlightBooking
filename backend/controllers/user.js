const User = require('../models/User')
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is required')
}
const getUsers = async (req,res) => {
    try {
        const users = await User.find({})
        res.status(200).json(users)
    } catch (error) {
        console.log(error)
    }
}

// register
const createUser = async (req,res) => {
    try {
        const { email, password, countrycode, mobilenumber, firstname, lastname, dateofbirth ,gender, state} = req.body
        bodyObject = {}
        var validation = true
        const duplicate = await User.findOne({ email:email })
        if(duplicate){  
            res.status(400).json({msg:'User already exsisted with this email'})
            var validation = false
        }
        if(email){
            bodyObject.email= email
        }
        if(password){
            var salt = await bcrypt.genSalt(10);
            var secPass = await bcrypt.hash(password, salt);
            bodyObject.password = secPass
        }
        if(countrycode){
            bodyObject.countrycode = countrycode
        }
        if(mobilenumber){
            bodyObject.mobilenumber = mobilenumber
        }
        if(firstname){
            bodyObject.firstname = firstname
        }
        if(lastname){
            bodyObject.lastname = lastname
        }
        if(dateofbirth){
            bodyObject.dateofbirth =dateofbirth
        }
        if(gender){
            bodyObject.gender= gender
        }
        if(state){
            bodyObject.state = state
        }
        if(validation){
            const user = await User.create(bodyObject)
            const data = {
                user:{
                    id: user._id
                }
            }
            const token = jwt.sign(data,JWT_SECRET)
            res.status(200).json({token,user,success:true})
        }
    } catch (error) {
        res.status(201).json({msg:'Please try again' ,errorStatus:error})
    }
} 


// login
const authUser = async (req,res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({ email: email })
        if(!user){
            res.status(400).json({msg: "Please try to login with correct credentials",success:false})
        }
        if(user){
            var pwdCompare = await bcrypt.compare(password,user.password)
            if(!pwdCompare){
                res.status(400).json({msg: "Please try to login with correct credentials",success:false})
            }
        }
        if(user && pwdCompare){
            const data = {
                user:{
                    id: user._id
                }
            }
            const token = jwt.sign(data, JWT_SECRET)
            res.status(200).json({token,user,success:true})
        }

    } catch (error) {
        res.status(201).json({msg:'Please try again' ,errorStatus:error})
    }
}

// get user data after login

const getUser = async (req,res) => {
    try {
        console.log('hi')
        const user = await User.findById(req.user.id).select('-password')
        res.status(200).json({user})
    } catch (error) {
        res.status(201).json({msg:'Please try again' ,errorStatus:error})
    }
}



module.exports = { getUser, getUsers, createUser, authUser} 
