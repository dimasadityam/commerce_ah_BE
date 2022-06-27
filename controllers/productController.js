const { dbQuery, dbConf } = require('../config/database');
const { uploader } = require('../config/uploader')
const { fs } = require('../config/uploader')
module.exports = {
  // fungsi next meneruskan fungsi middleware selanjutnya seperti login ke tokenUser
  // apabila tidak ada middleware selanjutnya, maka next akan mencari middleware di index.js utama
  getData: async (req, res, next) => {

    try {
      // CARA KAK ABDI
      // console.log("req.query tes", req.query)
      let getProducts = await dbQuery(`SELECT * FROM products`);
      let getStocks = await dbQuery(`SELECT * FROM stocks;`);
      let getImages = await dbQuery(`SELECT * FROM images_product;`);
      getProducts.forEach(value => {
        value.stocks = [];
        value.images = [];

        getStocks.forEach(val => {
          if (value.idproduct == val.idproduct) {
            value.stocks.push(val)
          }
        })

        getImages.forEach(val => {
          if (value.idproduct == val.idproduct) {
            // console.log(val.urlimg)
            value.images.push(val.urlimg)
          }
        })
      });

      // console.log("getQuery", getQuery(`idproduct`, `${req.query.idproduct}`))

      if (req.query.idproduct) {
        let filterProducts = await dbQuery(`SELECT * FROM products p WHERE p.idproduct=${req.query.idproduct}`);
        let getStocks = await dbQuery(`SELECT * FROM stocks`);
        let getImages = await dbQuery(`SELECT * FROM images_product`);
        filterProducts.forEach(value => {
          value.stocks = [];
          value.images = [];
          getStocks.forEach(val => {
            if (value.idproduct == val.idproduct) {
              value.stocks.push(val)
            }
          })

          getImages.forEach(val => {
            if (value.idproduct == val.idproduct) {
              value.images.push(val)
            }
          })
        });
        return res.status(200).send(filterProducts);
      } else if (req.query.nama) {
        let filterProducts = await dbQuery(`SELECT * FROM products p WHERE p.nama='${req.query.nama}'`);
        let getStocks = await dbQuery(`SELECT * FROM stocks`);
        let getImages = await dbQuery(`SELECT * FROM images_product`);
        filterProducts.forEach(value => {
          value.stocks = [];
          value.images = [];

          getStocks.forEach(val => {
            if (value.idproduct == val.idproduct) {
              value.stocks.push(val)
            }
          })

          getImages.forEach(val => {
            if (value.idproduct == val.idproduct) {
              value.images.push(val)
            }
          })
        });
        return res.status(200).send(filterProducts);
      } else if (req.query.brand) {
        let filterProducts = await dbQuery(`SELECT * FROM products p WHERE p.brand='${req.query.brand}'`);
        let getStocks = await dbQuery(`SELECT * FROM stocks`);
        let getImages = await dbQuery(`SELECT * FROM images_product`);
        filterProducts.forEach(value => {
          value.stocks = [];
          value.images = [];

          getStocks.forEach(val => {
            if (value.idproduct == val.idproduct) {
              value.stocks.push(val)
            }
          })

          getImages.forEach(val => {
            if (value.idproduct == val.idproduct) {
              value.images.push(val)
            }
          })
        });
        return res.status(200).send(filterProducts);
      } else if (req.query.harga) {
        let filterProducts = await dbQuery(`SELECT * FROM products p WHERE p.harga=${req.query.harga}`);
        let getStocks = await dbQuery(`SELECT * FROM stocks`);
        let getImages = await dbQuery(`SELECT * FROM images_product`);
        filterProducts.forEach(value => {
          value.stocks = [];
          value.images = [];

          getStocks.forEach(val => {
            if (value.idproduct == val.idproduct) {
              value.stocks.push(val)
            }
          })

          getImages.forEach(val => {
            if (value.idproduct == val.idproduct) {
              value.images.push(val)
            }
          })
        });
        return res.status(200).send(filterProducts);
      }
      return res.status(200).send(getProducts);
    } catch (error) {
      return next(error)
    }
  },
  addData: (req, res, next) => {
    if (req.dataUser.role == 'admin') {
      // imgProduct = directory , IMGPRO = fileNamePrefix, array = untuk multiple upload, 'images' = untuk koneksi file ke front end
      const uploadFile = uploader('/imgProduct', 'IMGPRO').array('images', 5)

      uploadFile(req, res, async (error) => {
        try {

          // upload file data harus menggunakan jason stringfy (merubah object jadi string) dan json parse
          // console.log(req.body);
          // console.log('pengecekan file', req.files);

          let { addNama, addDeskripsi, addBrand, addKategori, addHarga, stocks, images } = JSON.parse(req.body.data);

          let insertProduct = await dbQuery(`INSERT INTO products (nama, deskripsi, brand, kategori, harga)
            values (${dbConf.escape(addNama)}, ${dbConf.escape(addDeskripsi)}, ${dbConf.escape(addBrand)},
            ${dbConf.escape(addKategori)}, ${dbConf.escape(addHarga)});`);

          if (insertProduct.insertId) {
            // add images
            let imgData = req.files.map(val => {
              return `(${dbConf.escape(insertProduct.insertId)}, ${dbConf.escape(`/imgProduct/${val.filename}`)})`;
            })

            await dbQuery(`INSERT INTO images_product (idproduct, urlimg) values ${imgData.join(',')};`)
            // add stocks
            let stocksData = stocks.map(val => {
              return `(${dbConf.escape(insertProduct.insertId)}, ${dbConf.escape(val.type)}, ${dbConf.escape(val.qty)})`
            })
            await dbQuery(`INSERT INTO stocks (idproduct, type_product, qty) values ${stocksData.join(',')};`)
            return res.status(200).send({
              success: true,
              message: "add products success"
            })
          }

        } catch (error) {
          req.files.forEach(val => fs.unlinkSync(`./public/`))
          next(error)
        }
      })
    } else {
      return res.status(401).send('You Not Authorize For This Feature')
    }

    // try {
    //   // if (req.body.nama) {
    //   let resultsAddProduct = await dbQuery(`insert into products (nama, deskripsi, brand, kategori, harga) values
    //     ('${req.body.nama}', '${req.body.deskripsi}', '${req.body.brand}', '${req.body.kategori}', ${req.body.harga});`)
    //   console.log("resultsAddProduct", resultsAddProduct)
    //   console.log("REQ.BODY", req.body)
    //   // if (req.body.qty) {
    //   //   let resultsAddStock = await dbQuery(`insert into stocks (idproduct, type_product, qty) values
    //   // ('${req.body.nama}', '${req.body.deskripsi}', '${req.body.brand}', '${req.body.kategori}', ${req.body.harga});`)
    //   // }
    //   return res.status(200).send(resultsAddProduct);

    //   // }
    // } catch (error) {
    //   return next(error)
    // }
  },
  // getDataPaginate: async (req, res, next) => {
  //   try {
  //     let resultsProductPg = await dbQuery(`SELECT p.*, i.url_img from products p
  //     JOIN images_product i ON i.idproduct = p.idproduct;`)
  //     // console.log(resultsProduct)
  //     return res.status(200).send(resultsProduct);
  //   } catch (error) {
  //     return next(error)
  //   }
  // }
}
