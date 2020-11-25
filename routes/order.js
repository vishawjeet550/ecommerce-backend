const express = require('express')
const router = express.Router()


const { requireSignin , isAuth , isAdmin} = require('../controller/auth')
const {userById , addOrderToUserHistory } = require('../controller/user')
const { create ,getOrders , statusValue , editStatus , orderById , checkout} = require('../controller/order')
const {decreaseQuantity} = require('../controller/product')

router.post('/order/create/:userId' , requireSignin , isAuth , addOrderToUserHistory , decreaseQuantity , create)
router.get('/order/list/:userId' ,requireSignin , isAuth , isAdmin , getOrders)
router.get('/order/status-value/:userId' , requireSignin , isAuth , isAdmin , statusValue)
router.put('/order/:orderId/status/:userId' , requireSignin , isAuth , isAdmin , editStatus)


router.param('userId' , userById)
router.param('orderId' , orderById)

module.exports = router