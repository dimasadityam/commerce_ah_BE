const express = require('express');
const app = express();
const cors = require('cors')
const dotenv = require('dotenv'); // menyimpan value kedalam environtment variable
dotenv.config();
const mongoose = require('mongoose');
const { mongoAccessURL } = require('./config/mongo');
const bearerToken = require('express-bearer-token')
const passport = require('passport')
const session = require('express-session')


const PORT = process.env.PORT;
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET'
}))

app.use(bearerToken()) // untuk mengambil data token dari req.header

app.use(express.json()) // express.json untuk membaca data dari request body
app.use(express.static('public'));
app.use(cors())

// Config Passport / Google Auth
require('./config/passport')
app.use(passport.initialize())
app.use(passport.session())

// Databse Check Connection
const { dbConf } = require('./config/database')

// jika menggunakan createConnection menggunakan dbConf.connect
dbConf.getConnection((error, connection) => {
  if (error) {
    console.log("Error MySQL Connectin", error.message, error.sqlMessage);
  }
  console.log(`Connection to MySQL Server : ${connection.threadId}`)
})

// Mongo Check Connection
mongoose.connect(mongoAccessURL, () => {
  console.log("Connect Mongo Success")
})

/////////////////////////////////////////////////
app.post('/', (req, res) => {
  console.log(req.body);      // your JSON
  // res.status(200).send(req.body);    // echo the result back
});


app.get('/', (req, res) => {
  res.status(200).send("<h1>JCWDAHLS Ecommerce API</h1>")
})

const { userRouter, bannerRouter, productRouter, stockRouter, imageRouter, authRouter } = require('./routers');

app.use('/users', userRouter)
app.use('/banner', bannerRouter)
app.use('/product', productRouter)
app.use('/stock', stockRouter)
app.use('/image', imageRouter)
app.use('/auth', authRouter)

// Handling Error
app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).send(error)
})

app.listen(PORT, () => console.log(`Running API at PORT ${PORT}`));