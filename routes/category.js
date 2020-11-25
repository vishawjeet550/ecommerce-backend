const express = require('express')
const router = express.Router()
const { isAuth , isAdmin , requireSignin } = require('../controller/auth')
const { userById } = require('../controller/user')
const { create , categoryById , read , update , remove , list} = require('../controller/category')

router.get('./category/:categoryId', read)
router.post('/category/create/:userId' , requireSignin , isAdmin, isAuth, create)
router.put('/category/:categoryId/:userId', requireSignin , isAuth, isAdmin, update)
router.delete('/category/:categoryId/:userId', requireSignin , isAuth, isAdmin, remove)
router.get('/category', list)

router.param('categoryId', categoryById)
router.param("userId", userById)
module.exports=router