const {Order , CartItem} = require('../models/order')
const {errorHandlers} = require('../helpers/dbErrorHandler')



exports.create = (req,res)=>{
    req.body.order.user = req.profile
    const order = new Order(req.body.order)
    order.save((error,data)=>{
        if(error){
            return res.status(400).json({
                error:errorHandlers(error)
            })
        }
        res.json(data)
    })
}

exports.getOrders=(req,res)=>{
    Order.find()
    .populate('user' , "_id name address")
    .sort("-created")
    .exec((err,order)=>{
        if(err){
            return res.status(400).json({
                error:errorHandlers(err)
            })
        }
        res.json(order)
    })
}

exports.statusValue=(req,res)=>{
    res.json(Order.schema.path("status").enumValues)
}

exports.editStatus=(req,res)=>{
    Order.update({_id:req.body.orderId} , {$set:{status:req.body.status}} , (err,order)=>{
        if(err){
            return res.status(400).json({
                error:errorHandlers(err)
            })
        }
        res.json(order)
    })
}

exports.orderById=(req,res,next,id)=>{
    Order.findById(id)
    .populate('products.product' , 'name price') 
    .exec((err,order)=>{
        if(err){
            return res.status(400).json({
                error:"Order not found"
            })
        }
        req.order=order
        next()
    })
}
