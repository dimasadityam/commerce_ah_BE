const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const { dbQuery, dbConf } = require('./database');
const GOOGLE_CLIENT_ID = process.env.GCLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GCLIENT_SECRET
const { hashPassword, createToken } = require('./encription');
const { transporter } = require('./nodemailer')
// console.log("GCLIENT_ID", GOOGLE_CLIENT_ID)

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {

    // memeriksa apakah user sudah terdaftar
    let login = await dbQuery(`Select iduser, username, email, role, status FROM users
        where email LIKE '%${profile.emails[0].value}%' and password LIKE '%${hashPassword(profile.id)}%';`);

    if (login.length == 1) {
      // Generate Token
      let { iduser, username, email, role, status } = login[0]
      let token = createToken({ iduser, username, email, role, status }, "1h")

      // Mengirimkan Email untuk Login
      await transporter.sendMail({
        from: "Admin Commerce",
        to: profile.emails[0].value,
        subject: "Login by Google Account",
        html: `<div>
          <h3>Click Link Below :</h3>
          <a href="${process.env.FE_URL}?otkn=${token}">Login Account Here</a>
        </div>`
      })
    } else {
      // from profile argument google, we action to regis the user
      let regis = await dbQuery(`INSERT INTO users (username, email, password, role)
      values (${dbConf.escape(profile.displayName)}, ${dbConf.escape(profile.emails[0].value)},
      ${dbConf.escape(hashPassword(profile.id))}, ${dbConf.escape('user')});`)

      if (regis.insertId) {
        let resultsLogin = await dbQuery(`Select iduser, username, email, role, status FROM users
              where iduser =${regis.insertId};`);
        if (resultsLogin.length == 1) {

          let { iduser, username, email, role, status } = resultsLogin[0]
          let token = createToken({ iduser, username, email, role, status }, "1h")

          // Mengirimkan Email untuk Verifikasi
          await transporter.sendMail({
            from: "Admin Commerce",
            to: profile.emails[0].value,
            subject: "Verification Email Account From Google",
            html: `<div>
              <h3>Click Link Below :</h3>
              <a href="${process.env.FE_URL}/verification/${token}">Verified Account Here</a>
            </div>`
          })
          // console.log("resultsLogin", resultsLogin[0], token)
        } else {
          throw 'User not found'
        }
      }
      console.log('profile from google', profile)
      // output profile yang disimpan ke mysql adalah data displayName, name, email, id(password default user tersebut dan harus di hashPassword)
      fs.writeFileSync('./auth.json', JSON.stringify(profile));
    }
  } catch (error) {
    console.log(error)
  }

  return done(null, profile);
}));

passport.serializeUser((user, cb) => {
  console.log("serializeUser", user)
  cb(null, user);
})

passport.deserializeUser((obj, cb) => {
  console.log("deserializeUser", obj)
  cb(null, obj);
})