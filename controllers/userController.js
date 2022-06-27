const { dbConf, dbQuery } = require('../config/database')
const { hashPassword, createToken } = require('../config/encription');
const { transporter } = require('../config/nodemailer');
// kumpulan property untuk menaruh middleware
module.exports = {
  getData: async (req, res, next) => {
    try {
      let resultsUsers = await dbQuery('Select iduser, username, email, role, status FROM users;')
      let resultsCart = await dbQuery(`select p.nama, i.urlimg, p.harga, s.type_product as type,
      s.qty as stockQty, c.* from cart c
      JOIN stocks s ON c.idstock = s.idstock
      JOIN products p ON p.idproduct = s.idproduct
      JOIN images_product i ON i.idproduct = p.idproduct GROUP BY c.idcart;`);


      resultsUsers.forEach((val, idx) => {
        val.cart = [];
        resultsCart.forEach((valCart, idxCart) => {
          if (val.iduser == valCart.idusers) {
            val.cart.push(valCart)
          }
        })
      })
      return res.status(200).send(resultsUsers);
    } catch (error) {
      return next(error)
    }

    // // dbConf.query untuk menjalankan database di mysql
    // dbConf.query('Select iduser, username, email, role FROM users;', (error, resultsUser) => {
    //   if (error) {
    //     // console.log(error);
    //     // res.status(500).send(error); // 500 ada error di API
    //     return next(error)
    //   }
    //   // console.log(resultsUser);
    //   // res.status(200).send(resultsUser);
    //   dbConf.query('Select * from cart;', (errorCart, resultsCart) => {
    //     if (errorCart) {
    //       return next(errorCart)
    //     }
    //     console.log(resultsUser);
    //     console.log(resultsCart);

    //     resultsUser.forEach((val, idx) => {
    //       val.cart = [];
    //       resultsCart.forEach((valCart, idxCart) => {
    //         if (val.iduser == valCart.idusers) {
    //           val.cart.push(valCart)
    //         }
    //       })
    //     })
    //     res.status(200).send(resultsUser);
    //   })
    // })
    // res.status(200).send("<h2>GET DATA</h2>")
  },
  register: async (req, res, next) => {
    try {
      console.log(hashPassword(req.body.password));

      let resultsRegister = await dbQuery(`INSERT INTO users (username, email, password, role)
      values (${dbConf.escape(req.body.username)}, ${dbConf.escape(req.body.email)},
      ${dbConf.escape(hashPassword(req.body.password))}, ${dbConf.escape(req.body.role)});`);
      console.log("resultsRegister", resultsRegister)
      console.log("hash", hashPassword(req.body.password))

      if (resultsRegister.insertId) {
        let resultsLogin = await dbQuery(`Select iduser, username, email, role, status FROM users
              where iduser =${resultsRegister.insertId};`);
        if (resultsLogin.length == 1) {
          // let resultsCart = await dbQuery(`select p.nama, i.urlimg, p.harga, s.type_product as type,
          // s.qty as stockQty, c.* from cart c
          // JOIN stocks s ON c.idstock = s.idstock
          // JOIN products p ON p.idproduct = s.idproduct
          // JOIN images_product i ON i.idproduct = p.idproduct WHERE
          // c.idusers=${resultsRegister.insertId} GROUP BY c.idcart;`);
          // resultsLogin[0].cart = resultsCart

          let { iduser, username, email, role, status } = resultsLogin[0]
          let token = createToken({ iduser, username, email, role, status }, "1h")

          // Mengirimkan Email untuk Verifikasi
          await transporter.sendMail({
            from: "Admin Commerce",
            to: email,
            subject: "Verification Email Account",
            html: `<div>
              <h3>Click Link Below :</h3>
              <a href="${process.env.FE_URL}/verification/${token}">Verified Account Here</a>
            </div>`
          })
          // console.log("resultsLogin", resultsLogin[0], token)
          return res.status(200).send({ ...resultsLogin[0], token });
        } else {
          return res.status(404).send({
            success: false,
            message: "User not found"
          });
        }
      }
      return res.status(200).send(resultsRegister)

    } catch (error) {
      return next(error)
    }
  },
  // register: async (req, res, next) => {
  //   try {
  //     console.log(hashPassword(req.body.password));

  //     let resultsRegister = await dbQuery(`INSERT INTO users (username, email, password, role)
  //     values (${dbConf.escape(req.body.username)}, ${dbConf.escape(req.body.email)},
  //     ${dbConf.escape(hashPassword(req.body.password))}, ${dbConf.escape(req.body.role)});`);
  //     console.log("resultsRegister", resultsRegister)
  //     console.log("hash", hashPassword(req.body.password))

  //     if (resultsRegister.insertId) {
  //       let resultsLogin = await dbQuery(`Select iduser, username, email, role FROM users
  //             where iduser =${resultsRegister.insertId};`);
  //       if (resultsLogin.length == 1) {
  //         let resultsCart = await dbQuery(`select p.nama, i.urlimg, p.harga, s.type_product as type,
  //         s.qty as stockQty, c.* from cart c
  //         JOIN stocks s ON c.idstock = s.idstock
  //         JOIN products p ON p.idproduct = s.idproduct
  //         JOIN images_product i ON i.idproduct = p.idproduct WHERE
  //         c.idusers=${resultsRegister.insertId} GROUP BY c.idcart;`);
  //         resultsLogin[0].cart = resultsCart
  //         console.log("resultsLogin", resultsLogin)
  //         return res.status(200).send(resultsLogin[0]);
  //       } else {
  //         return res.status(404).send({
  //           success: false,
  //           message: "User not found"
  //         });
  //       }
  //     }
  //     return res.status(200).send(resultsRegister)

  //   } catch (error) {
  //     return next(error)
  //   }
  // },
  login: async (req, res, next) => {
    try {
      let resultsLogin = await dbQuery(`Select iduser, username, email, role, status FROM users
        where email LIKE '%${req.body.email}%' and password LIKE '%${hashPassword(req.body.password)}%';`);
      // res.status(200).send(resultsLogin)

      if (resultsLogin[0].iduser) {
        let resultsCart = await dbQuery(`select p.nama, i.urlimg, p.harga, s.type_product as type,
      s.qty as stockQty, c.* from cart c
      JOIN stocks s ON c.idstock = s.idstock
      JOIN products p ON p.idproduct = s.idproduct
      JOIN images_product i ON i.idproduct = p.idproduct WHERE
      c.idusers=${resultsLogin[0].iduser} GROUP BY c.idcart;`);
        resultsLogin[0].cart = resultsCart;

        // generate token
        let { iduser, username, email, role, status } = resultsLogin[0]
        let token = createToken({ iduser, username, email, role, status })
        return res.status(200).send({ ...resultsLogin[0], token });
      }
      else {
        res.status(404).send({
          success: false,
          message: "User not Found"
        })
      }
    } catch (error) {
      return next(error)
    }

    //   dbConf.query(`Select iduser, username, email, role FROM users where email LIKE '%${body.email}%' and password LIKE '%${body.password}%';`, (error, resultsUser) => {
    //     if (error) {
    //       // console.log(error);
    //       // res.status(500).send(error); // 500 ada error di API
    //       // console.log(body.email)
    //       return next(error)
    //     }
    //   console.log(resultsUser);
    //   res.status(200).send(resultsUser);
    //   dbConf.query('Select * from cart;', (errorCart, resultsCart) => {
    //     if (errorCart) {
    //       return next(errorCart)
    //     }
    //     console.log(resultsUser);
    //     console.log(resultsCart);

    //     resultsUser.forEach((val, idx) => {
    //       val.cart = [];
    //       resultsCart.forEach((valCart, idxCart) => {
    //         if (val.iduser == valCart.idusers) {
    //           val.cart.push(valCart)
    //         }
    //       })
    //     })
    //     res.status(200).send(resultsUser);
    //   })
    // })
    // res.status(200).send("<h2>LOGIN</h2>")
  },
  keepLogin: async (req, res, next) => {
    try {
      console.log("req.dataUsers", req.dataUser)
      if (req.dataUser.iduser) {
        let resultsLogin = await dbQuery(`Select iduser, username, email, role, status
        FROM users where iduser=${req.dataUser.iduser};`);
        // res.status(200).send(resultsLogin)

        if (resultsLogin.length == 1) {
          let resultsCart = await dbQuery(`select p.nama, i.urlimg, p.harga, s.type_product as type,
        s.qty as stockQty, c.* from cart c
        JOIN stocks s ON c.idstock = s.idstock
        JOIN products p ON p.idproduct = s.idproduct
        JOIN images_product i ON i.idproduct = p.idproduct WHERE
        c.idusers=${resultsLogin[0].iduser} GROUP BY c.idcart;`);
          resultsLogin[0].cart = resultsCart;

          // generate token
          let { iduser, username, email, role, status } = resultsLogin[0]
          let token = createToken({ iduser, username, email, role, status })
          return res.status(200).send({ ...resultsLogin[0], token });
        }
        else {
          res.status(404).send({
            success: false,
            message: "User not Found"
          })
        }
      } else {
        return res.status(401).send({
          success: false,
          message: "Token expired"
        })
      }
    } catch (error) {
      return next(error)
    }
  },
  edit: async (req, res, next) => {
    try {
      // res.status(200).send("<h2>EDIT</h2>")
      console.log("req.dataUsers Verified", req.dataUser)
      if (req.dataUser.iduser) {
        let resultsEdit = await dbQuery(`UPDATE users SET status = 'Verified'
        WHERE iduser = ${req.dataUser.iduser};`);

        let { iduser, username, email, role, status } = resultsEdit
        let token = createToken({ iduser, username, email, role, status })
        return res.status(200).send({ ...resultsEdit, token });
      }
    } catch (error) {
      return next(error)
    }
  },
  sendVerification: async (req, res, next) => {
    try {
      // res.status(200).send("<h2>EDIT</h2>")
      // console.log("req.dataUsers Verified", req.dataUser)
      if (req.dataUser.iduser) {
        let resultsLogin = await dbQuery(`Select iduser, username, email, role, status FROM users
              where iduser =${req.dataUser.iduser};`);
        if (resultsLogin.length == 1) {
          // let resultsCart = await dbQuery(`select p.nama, i.urlimg, p.harga, s.type_product as type,
          // s.qty as stockQty, c.* from cart c
          // JOIN stocks s ON c.idstock = s.idstock
          // JOIN products p ON p.idproduct = s.idproduct
          // JOIN images_product i ON i.idproduct = p.idproduct WHERE
          // c.idusers=${resultsRegister.insertId} GROUP BY c.idcart;`);
          // resultsLogin[0].cart = resultsCart

          // let resultsSendVerif = await dbQuery(`UPDATE users SET status = 'Verified'
          let { iduser, username, email, role, status } = resultsLogin[0]
          let token = createToken({ iduser, username, email, role, status })
          // WHERE iduser = ${req.dataUser.iduser};`);
          await transporter.sendMail({
            from: "Admin Commerce",
            to: req.dataUser.email,
            subject: "Verification Email Account",
            html: `<div>
            <h3>Click Link Below :</h3>
            <a href="${process.env.FE_URL}/verification/${token}">Verified Account Here</a>
            </div>`
          })

          if (req.dataUser.iduser) {
            let resultsLogin2 = await dbQuery(`Select iduser, username, email, role, status FROM users
                  where iduser =${req.dataUser.iduser};`);
            console.log("RESULTS2", resultsLogin2)
            return res.status(200).send({ ...resultsLogin2, token });
          }

          // let { iduser, username, email, role, status } = resultsEdit
          // let token = createToken({ iduser, username, email, role, status })
        }
      }
    } catch (error) {
      return next(error)
    }
  },
  reVerified: async (req, res, next) => {
    try {
      if (req.dataUser) {
        let resultsLogin = await dbQuery(`Select iduser, username, email, role, status FROM users
        WHERE iduser = ${req.dataUser.iduser};`);

        let { iduser, username, email, role, status } = resultsLogin[0];
        let token = createToken({ iduser, username, email, role, status }, "1h");

        await transporter.sendMail({
          from: "Admin Commerce",
          to: email,
          subject: "Re-Verification Email Account",
          html: `<div>
            <h3>Click Link Below :</h3>
            <a href="${process.env.FE_URL}/verification/${token}">Verified Account Here</a>
            </div>`
        })
        return res.status(200).send({
          success: true,
          message: "Reverification email link delivered"
        })
      }
    } catch (error) {
      return next(error)
    }
  },
  verifiedAccount: async (req, res, next) => {
    try {
      // res.status(200).send("<h2>EDIT</h2>")
      // console.log("req.dataUsers Verified", req.dataUser)
      if (req.dataUser) {
        let update = await dbQuery(`UPDATE users SET status='Verified'
        WHERE iduser=${req.dataUser.iduser};`)
        let resultsLogin = await dbQuery(`Select iduser, username, email, role, status FROM users
        WHERE iduser = ${req.dataUser.iduser};`);

        let { iduser, username, email, role, status } = resultsLogin[0]
        let token = createToken({ iduser, username, email, role, status })
        return res.status(200).send({ ...resultsLogin[0], token, success: true });
      }
    } catch (error) {
      return next(error)
    }
  },
  forgot: async (req, res, next) => {
    try {
      // console.log("req.body", req.body)
      let forgot = await dbQuery(`Select iduser, username, email, password, role, status FROM users
      WHERE email = '${req.body.email}';`);
      // console.log("FORGOT", forgot[0].email)
      // console.log("hash", hashPassword(req.body.password))

      if (forgot[0].email) {
        let { iduser, username, email, password, role, status } = forgot[0]
        let token = createToken({ iduser, username, email, password, role, status }, "1h")
        // console.log("TOKEN", token)
        // Mengirimkan Email untuk Verifikasi
        await transporter.sendMail({
          from: "Admin Commerce",
          to: email,
          subject: "Reset Password E-Commerce",
          html: `<div>
              <h3>Click Link Below :</h3>
              <a href="${process.env.FE_URL}/forgotpass/${token}">Reset Your Password Here</a>
            </div>`
        })
        return res.status(200).send({ ...forgot[0], token });
      } else {
        return res.status(404).send({
          success: false,
          message: "User not found"
        });
      }
    } catch (error) {
      return next(error)
    }
  },
  resetPass: async (req, res, next) => {
    try {
      console.log("req.body resetPass", req.body.newPass)
      console.log("dataUser reset", req.dataUser)
      if (req.dataUser.iduser) {
        await dbQuery(`UPDATE users SET password=${dbConf.escape(hashPassword(req.body.newPass))}
        WHERE iduser=${req.dataUser.iduser};`);
      }
      // console.log("FORGOT", forgot[0].email)
      // console.log("hash", hashPassword(req.body.password))

      // if (forgot[0].email) {
      //   let { iduser, username, email, password, role, status } = forgot[0]
      //   let token = createToken({ iduser, username, email, password, role, status }, "1h")
      //   console.log("TOKEN", token)
      //   // Mengirimkan Email untuk Verifikasi
      //   await transporter.sendMail({
      //     from: "Admin Commerce",
      //     to: email,
      //     subject: "Reset Password E-Commerce",
      //     html: `<div>
      //         <h3>Click Link Below :</h3>
      //         <a href="${process.env.FE_URL}/forgotpass/${token}">Reset Your Password Here</a>
      //       </div>`
      //   })
      //   return res.status(200).send({ ...forgot[0], token });
      // } else {
      //   return res.status(404).send({
      //     success: false,
      //     message: "User not found"
      //   });
      // }
    } catch (error) {
      return next(error)
    }
  },
  deActiveAccount: (req, res) => {

  }
}