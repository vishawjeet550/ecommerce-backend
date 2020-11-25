const User = require('../models/user')
const jwt = require('jsonwebtoken')
const expressJWT = require('express-jwt')
const {errorHandler} = require('../helpers/dbErrorHandler')

exports.signup = (req,res)=>{
    const user = new User(req.body)
    user.save((err,user)=>{
        if(err){
            return res.status(400).json({
                err:"email already exist"
            })
        }
        user.salt = undefined
        user.hashed_password=undefined
        res.json({
            user
        })
    })
}



exports.signin = (req,res) =>{
    const {email , password} = req.body
    User.findOne({email} , (err,user)=>{
        if(err || !user){
            return res.status(400).json({
                error:'user with that email does not exist.Please Signup'
            })
        }
        console.log(user)
        if(!user.authenticate(password)){
            return res.status(401).json({
                error:"email and password don't match"
            })
        }
        const token = jwt.sign({_id:user._id}, process.env.JWT_SECRETKEY)

        res.cookie("t" , token , { expire: new Date + 9999})

        const {_id , name , email , role} = user

        return res.json({token , user:{_id , name , email , role}})

    })
}


exports.signout=(req,res)=>{
    res.clearCookie("t")
    res.json({
        message:"Logout Successfully"
    })
}




exports.requireSignin = expressJWT({
    secret:process.env.JWT_SECRETKEY,
    userProperty:"auth",
    algorithms:['sha1', 'RS256', 'HS256']
})



exports.isAuth=(req,res,next)=>{
    let user = req.profile && req.auth && req.profile._id ==req.auth._id
    if(!user){
        return res.status(403).json({
            error:"Access denied"
        })
    }
    next()
}

exports.isAdmin=(req,res,next)=>{
    if(req.profile.role === 0){
        return res.status(403).json({
            error:"Admin resource! Access denied"
        })
    }
    next()
}