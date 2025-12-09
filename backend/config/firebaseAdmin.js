const admin = require("firebase-admin");
const fs = require("fs");
require('dotenv').config();

const serviceAccount = JSON.parse(
  fs.readFileSync(__dirname + "/firebaseServiceAccount.json", "utf-8")
);

const { FIREBASE_BUCKET } = process.env;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: FIREBASE_BUCKET
});

const bucket = admin.storage().bucket();

module.exports = bucket;
