
const { errorHandler } = require('../helpers/dbErrorHandler')
const User = require('../models/user')
const {Order} = require('../models/order')

exports.userById=(req,res,next,id)=>{
    User.findById(id , (err,user)=>{
        console.log(user)
        if(err || !user){
            return res.status(400).json({
                error:"User Not Found"
            })
        }
        req.profile = user
        next()
    })
}

exports.read = (req,res)=>{
    req.profile.hashed_password = undefined
    req.profile.salt= undefined
    return res.json(req.profile)
}

exports.update = (req,res)=>{
    User.findOneAndUpdate({_id:req.profile._id} , {$set :req.body} ,{new :true} ,(err,user)=>{
        if(err){
            return res.status(400).json({
                error:'You are not authorized to perform these action'
            })
        }
        user.hashed_password = undefined
        user.salt= undefined
        res.json(user)
    })
}

exports.addOrderToUserHistory=(req,res,next)=>{
    let history=[]
    req.body.order.products.forEach((item)=>{
        history.push({
            _id:item._id,
            name:item.name,
            description:item.description,
            category:item.category,
            quantity:item.count,
            transaction_id:req.body.order.transaction_id,
            amount:req.body.amount
        })
    })
    User.findByIdAndUpdate({_id:req.profile._id} , {$push:{history:history}} , {new:true} , (err,rep)=>{
        if(err){
            return res.status(400).json({
                error:"Could not update user history"
            })
        }
        next()
    })
}


exports.purchase=(req,res)=>{
    Order.find({user:req.profile._id})
    .populate('user' , '_id name')
    .sort('-created')
    .exec((error , orders)=>{
        if(error){
            return res.status(400).json({
                error:errorHandler(error)
            })
        }
        res.json(orders)
    })
}