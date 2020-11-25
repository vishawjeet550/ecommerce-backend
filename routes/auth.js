const express = require('express')
const router = express.Router()
const {signup , signin , signout , requireSignin} = require('../controller/auth')
const {userSignupvalidator} = require('../vaidator')

router.post('/signup' , userSignupvalidator, signup)
router.post('/signin' , signin)
router.get('/signout' , signout)



module.exports=router