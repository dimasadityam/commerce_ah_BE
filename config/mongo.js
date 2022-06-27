const mongoose = require('mongoose');
// url untuk access mongodb: mongodb://namaUser:passwordAccount@localhost:27017/databaseName
const mongoAccessURL = `mongodb://al:1234@localhost:27017/commerce-ah`;

// define data structure field at collections
const bannerSchema = mongoose.Schema({
  src: String
});

// Setup collection
const mongoBanner = mongoose.model("bannerCollection", bannerSchema, "banner");

module.exports = {
  mongoAccessURL,
  mongoBanner
}