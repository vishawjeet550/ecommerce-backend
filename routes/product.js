const express = require('express')
const router = express.Router()
const { isAuth , isAdmin , requireSignin } = require('../controller/auth')
const { userById } = require('../controller/user')
const { create ,productById, photo ,listBySearch, read ,remove , update ,search, listCategories ,  list ,listRelated} = require('../controller/product')

router.get('/product/:productId',read)
router.post('/product/create/:userId' , requireSignin , isAdmin, isAuth, create)
router.post('/products/by/search' , listBySearch)
router.delete('/product/:productId/:userId', requireSignin,isAuth,isAdmin ,remove)
router.put('/product/:productId/:userId', requireSignin,isAuth,isAdmin,update)
router.get('/products' , list)
router.get('/products/search' , search)
router.get('/product/photo/:productId' , photo)
router.get('/products/related/:productId' , listRelated)
router.get('/products/categories' ,listCategories)
router.param("userId", userById)
router.param("productId", productById)
module.exports=router