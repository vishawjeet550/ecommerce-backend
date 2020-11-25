const Product = require('../models/product')
const fs = require('fs')
const formidable = require('formidable')
const {errorHandler} = require('../helpers/dbErrorHandler')
const _ = require('lodash')

exports.productById = (req,res,next,id)=>{
    Product.findById(id).exec((err,product)=>{
        if(err || !product){
            return res.status(400).json({
                error:"product not found"
            })
        }
        req.product=product
        next()
    })
}

exports.read=(req,res)=>{
    req.product.photo = undefined
    return res.json(req.product)
}


exports.create = (req,res)=>{
   let form = new formidable.IncomingForm()
   form.keepExtensions=true
   form.parse(req,(err,fields,files)=>{
       if(err){
           res.status(400).json({
               error:"Image could not be uploaded"
           })
       }

       const {name , description , price , quantity , category , shipping} = fields

       if(!name || !description || !price || !quantity || !category || !shipping){
        return res.status(400).json({
            error:"All fields are rquired!"
        })
       }

       let product = new Product(fields)

       if(files.photo){
           if(files.photo.size > 1000000){
               return res.status(400).json({
                   error:"Image is too large"
               })
           }
           product.photo.data=fs.readFileSync(files.photo.path)
           product.photo.contentType=files.photo.type
       }
       product.save().then(product=>{
           res.json(product)
       }).catch(err=>{
           res.status(400).json({
               error:errorHandler(err)
           })
       })
    })
}




exports.remove=(req,res)=>{
    let product = req.product
    product.remove((err,result)=>{
        if(err){
            return res.status(400).json({
                err:"Something went wrong!!"
            })
        }
        res.json({
            "message":"Product deleted successfully"
        })
    })
}


exports.update=(req,res)=>{
    let form = new formidable.IncomingForm()
    form.keepExtensions=true
    form.parse(req,(err,fields,files)=>{
        if(err){
            res.status(400).json({
                error:"Image could not be uploaded"
            })
        }
 
        const {name , description , price , quantity , category , shipping} = fields
 
        if(name=='' || description=='' || price=='' || quantity=='' || category=='' || shipping==''){
         return res.status(400).json({
             error:"All fields are rquired!"
         })
        }
 
        let product = req.product
        product = _.extend(product, fields)
 
        if(files.photo){
            if(files.photo.size > 1000000){
                return res.status(400).json({
                    error:"Image is too large"
                })
            }
            product.photo.data=fs.readFileSync(files.photo.path)
            product.photo.contentType=files.photo.type
        }
        product.save().then(product=>{
            res.json(product)
        }).catch(err=>{
            res.status(400).json({
                error:errorHandler(err)
            })
        })
     })
}


exports.list = (req,res) =>{
    let order = req.query.order ? req.query.order : 'asc'
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
    let limit = req.query.limit ? parseInt(req.query.limit) : 6
    
    Product.find()
        .select("-photo")
        .populate('category')
        .sort([[
            sortBy , order
        ]])
        .limit(limit)
        .exec((err,data)=>{
            if(err){
                return res.status(400).json({
                    error:"products not found"
                })
            }
            res.json(data)
        })
}

exports.listRelated = (req,res )=>{
    let limit = req.query.limit ? parseInt(req.query.limit): 6
    Product.find({_id : {$ne : req.product} , category : req.product.category})
    .limit(limit)
    .populate('category', '_id name')
    .exec((err, product)=>{
        if(err){
            return res.status(400).json({
                error:"products not found"
            })
        }
        res.json(product)
    })
}


exports.listCategories = (req, res)=>{
    Product.distinct("category" , {} ,(err , category) =>{
        if(err){
            return res.status(400).json({
                error:"categories not found"
            })
        }
        res.json(category)
    })
}

exports.listBySearch=(req,res)=>{
    let order = req.query.order ? req.query.order : 'desc'
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
    let limit = req.query.limit ? parseInt(req.query.limit) : 6
    let skip = parseInt(req.body.skip)
    let findArgs = {}
    for (let key in req.body.filters){
        if(req.body.filters[key].length>0){
            if(key==="price"){
                findArgs[key]={
                    $gte : req.body.filters[key][0],
                    $lte :req.body.filters[key][1]
                }
            }else{
                findArgs[key] = req.body.filters[key]
            }
        }
    }
    Product.find(findArgs)
        .select("-photo")
        .populate("category")
        .sort([[sortBy,order]])
        .skip(skip)
        .limit(limit)
        .exec((err, category)=>{
            if(err){
                return res.status(400).json({
                    error:"categories not found"
                })
            }
            res.json(category)
        })
}


exports.photo = (req,res,next)=>{
    if(req.product.photo.data){
        res.set('Content-Type', req.product.photo.contentType)
        return res.send(req.product.photo.data)
    }
    next()
}

exports.search = (req,res)=>{

    
    const query = {}
    if(req.query.search){
        query.name={$regex:req.query.search.trim() , $options:'i'}
        if(req.query.category === "Category" || req.query.category==="All" || req.query.category===""){
            delete query.category
        }else{
            query.category = req.query.category
        }
    }
    Product.find(query , (err,data)=>{
        if(err){
            return res.json({
                error:"Products not found"
            })
        }
        res.json(data)
    }).select('-photo')
}

exports.decreaseQuantity=(req,res,next)=>{
    let bulk = req.body.order.products.map((item)=>{
        return {
            updateOne:{
                filter:{_id:item._id},
                update:{$inc:{quantity:-item.count , sold:+item.count}}
            }
        }
    })
    Product.bulkWrite(bulk ,{} , (err ,product)=>{
        if(err){
            return res.status(400).json({
                error:"Could not update"
            })
        }
        next()
    })
}