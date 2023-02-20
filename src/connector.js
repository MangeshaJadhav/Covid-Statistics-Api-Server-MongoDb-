//const mongodb = require('mongodb');

const mongoURI = "mongodb://0.0.0.0:27017" + "/covidtally";//covidtally is databases name

let mongoose = require("mongoose");
const { tallySchema } = require("./schema");

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connection established with mongodb server online");
  })
  .catch((err) => {
    console.log("error while connection", err);
  });
collection_connection = mongoose.model("covidtally", tallySchema);

exports.connection = collection_connection;
/**
 * Here we creating database at our local storage covidtally
 * and data.js file contain all data
 */