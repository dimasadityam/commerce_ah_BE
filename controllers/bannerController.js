const { dbConf, dbQuery } = require('../config/database')
const { mongoBanner } = require('../config/mongo')

module.exports = {
  // fungsi next meneruskan fungsi middleware selanjutnya seperti login ke tokenUser
  // apabila tidak ada middleware selanjutnya, maka next akan mencari middleware di index.js utama
  getData: async (req, res, next) => {
    try {
      // Banner at MySQL
      // let resultsBanner = await dbQuery('Select * from banner;')
      // return res.status(200).send(resultsBanner);

      // Banner at MongoDB
      mongoBanner.find({ ...req.query }, (err, data) => {
        res.status(200).send(data);
      })
    } catch (error) {
      return next(error)
    }
  },
  addData: async (req, res, next) => {
    try {

      mongoBanner(req.body).save().then((data) => {
        res.status(200).send({
          success: true,
          results: data
        })
      })

    } catch (error) {
      return next(error)
    }
  },
  deleteData: async (req, res, next) => {
    try {
      mongoBanner.deleteOne(req.query, (err, data) => {
        res.status(200).send({
          success: true,
          results: data
        })
      })
    } catch (error) {
      return next(error)
    }
  },
  update: async (req, res, next) => {
    try {
      mongoBanner.updateOne(req.query, { $set: req.body },
        {}, (err, results) => {
          res.status(200).send({
            success: true,
            results
          })
        })
    } catch (error) {
      return next(error)
    }
  }
  // getData: (req, res, next) => {
  //   dbConf.query('Select * from data;', (error, results) => {
  //     if (error) {
  //       return next(error);
  //     }
  //     // console.log(results)
  //     return res.status(200).send(results)
  //   })
  // }

}
// namaproduct
// harga satuan
// qty yang dipilih
// tipe stock yang dipilih
// gambar

// kolom id img
// kolom url
// idproduct