const express = require('express')
const router = express.Router()
const { requireSignin , isAdmin , isAuth } = require('../controller/auth')
const { userById , read , update , purchase} = require('../controller/user')

router.get('/secret/:userId' , requireSignin , isAuth , isAdmin , (req,res)=>{
    res.json({
        user:req.profile
    })
})
router.get('/user/:userId', requireSignin , isAuth , read)
router.get('/order/by/user/:userId', requireSignin , isAuth , purchase)
router.put('/user/:userId', requireSignin , isAuth , update)
router.param('userId' , userById)

module.exports=router