const jwt = require('jsonwebtoken'); // enkripsi semua data yang dimiliki
const Crypto = require('crypto') // enkripsi password

module.exports = {
  hashPassword: (pass) => {
    // untuk mengenerate kode enkripsinya
    return Crypto.createHmac("sha256", "JCWDAHLS-01").update(pass).digest("hex");
  },
  // payload mengirim data apa saja yang akan dijadikan token
  createToken: (payload, time = "24h") => {
    let token = jwt.sign(payload, "JCWDAHLS-01", {
      expiresIn: time
    })

    return token;
  },
  readToken: (req, res, next) => {
    jwt.verify(req.token, "JCWDAHLS-01", (err, decode) => {
      if (err) {
        res.status(401).send({
          message: "User Not Authentication"
        })
      }
      // property yang dibuat sendiri
      req.dataUser = decode;

      next();
    })
  }
}