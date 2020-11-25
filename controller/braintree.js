const User = require('../models/user')
const braintree = require('braintree')
require('dotenv').config()

const gateway = new braintree.BraintreeGateway({
    environment:braintree.Environment.Sandbox,
    merchantId:process.env.BRAINTREE_MERCHANT_ID,
    publicKey:process.env.BRAINTREE_PUBLIC_KEY,
    privateKey:process.env.BRAINTREE_PRIVATE_KEY
})

exports.generateToken = (req,res) =>{
    gateway.clientToken.generate({} , function(err,response){
        if(err){
            return res.status(500).send(err)
        }
        res.send(response)
    })
}

exports.processPayment=(req,res)=>{
    let nonceFromTheClient = req.body.paymentMethodNonce? req.body.paymentMethodNonce:' '
    let amountFromTheClient = req.body.amount

    let newTransaction = gateway.transaction.sale({
        amount:amountFromTheClient,
        paymentMethodNonce:nonceFromTheClient,
        options:{
            submitForSettlement:true
        }
    },(err,response)=>{
        if(err){
            return res.status(404).json({
                error:err
            })
        }
        res.json(response)
    })
}