const { dbQuery } = require('../config/database')

module.exports = {
  // fungsi next meneruskan fungsi middleware selanjutnya seperti login ke tokenUser
  // apabila tidak ada middleware selanjutnya, maka next akan mencari middleware di index.js utama
  getData: async (req, res, next) => {
    try {
      let resultsImage = await dbQuery(`SELECT * from images_product`)
      // console.log(resultsImage)
      return res.status(200).send(resultsImage);
    } catch (error) {
      return next(error)
    }
  },
  addData: async (req, res, next) => {
    try {
      if (req.body.url_images) {
        resultsAddImage + await dbQuery(`insert into images_product (url_img, url_img2, url_img3, url_img4) values
            ('${req.body.url_images}', NULL, NULL, NULL;`);
        // console.log("resultsAddImage", resultsAddImage)
        return res.status(200).send(resultsAddImage);
      }
    }
    catch (error) {
      return next(error)
    }
  }
}