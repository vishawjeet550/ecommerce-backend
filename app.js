const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressValidator = require('express-validator')
require('dotenv').config()
const cors = require('cors')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const categoryRoutes = require('./routes/category')
const productRoutes = require('./routes/product')
const braintreeRoutes = require('./routes/braintree')
const orderRoutes = require('./routes/order')
const path = require('path')

const app = express()

app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(expressValidator())
app.use(cors())

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
}).then(()=>console.log('Database connected'))

app.use('/api',authRoutes)
app.use('/api', userRoutes)
app.use('/api', categoryRoutes)
app.use('/api',productRoutes)
app.use('/api',braintreeRoutes)
app.use('/api' , orderRoutes)


const port = process.env.PORT || 8000 

app.listen(port , ()=>{
    console.log(`Server is running on ${port}`)
})