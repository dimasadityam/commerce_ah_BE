const mysql = require('mysql');
const util = require('util');

//Jika lagi development bisa menggunakan createConnection, jika deploy menggunakan createPool
// createConnection jika awal dijalankan masuk ke mysql hanya 1x, jika berhubungan server menggunakan createPool karna sekali request ke mysql dijalankan koneksinya dan setelah selesai jalurnya ditutup jadi bisa bergantian
// createConnection bikin koneksi ke server 1x, untuk ke localhost kalo server akan error karna server akan ada batasan request koneksi

// Jika mendapat error : Error MySQL Connectin Handshake inactivity timeout undefined
// harus ditambahkan connectionLimit, connectTimeout, acquireTimeout dan timeout
const dbConf = mysql.createPool({
  connectionLimit: 1000,
  connectTimeout: 60 * 60 * 1000,
  acquireTimeout: 60 * 60 * 1000,
  timeout: 60 * 60 * 1000,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
})
// const dbConf = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'ecommerce',
//   port: 3306
// })

const dbQuery = util.promisify(dbConf.query).bind(dbConf);

module.exports = { dbConf, dbQuery };