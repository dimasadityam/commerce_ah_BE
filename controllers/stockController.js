const { dbQuery } = require('../config/database')

module.exports = {
  // fungsi next meneruskan fungsi middleware selanjutnya seperti login ke tokenUser
  // apabila tidak ada middleware selanjutnya, maka next akan mencari middleware di index.js utama
  getData: async (req, res, next) => {
    try {
      let resultsStock = await dbQuery(`SELECT * from stocks`)
      // console.log(resultsStock)
      return res.status(200).send(resultsStock);
    } catch (error) {
      return next(error)
    }
  },
  addData: async (req, res, next) => {
    try {
      if (req.body.qty) {
        resultsAddStock + await dbQuery(`insert into stocks (type_product, qty) values
          ('${req.body.type_product}', '${req.body.qty}';`)
        // console.log("resultsAddStock", resultsAddStock)
        return res.status(200).send(resultsAddStock);
      }
    } catch (error) {
      return next(error)
    }
  }
}