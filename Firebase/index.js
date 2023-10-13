const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey"); // private key
const imageThumbnail = require("image-thumbnail");
const fs = require("fs");

admin.initializeApp({
  // credential
  credential: admin.credential.cert(serviceAccount),
  //databaseURL: process.env.FIREBASE_BUCKET_KEY ,
  storageBucket: process.env.FIREBASE_BUCKET_KEY,
});

const b = admin.storage().bucket(); // firebase storage bucket

const db = admin.firestore(); // firebase database for save data
let a = db.collection("Users"); // create collection

// upload data to firebase collections
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    // upload data to firestore database
    await a.add({ data });
    res.status(200).json({ status: 1, message: "Success upload to firebase " });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: 0, message: error.message });
  }
});

// upload images to firebase storage
router.post("/upload", upload.single("file"), async (req, res) => {
  // upload image to firebase
  try {
    const fileName = req.file.originalname;

    const imageData = await b
      .file(fileName)
      .createWriteStream()
      .end(req.file.buffer);

    console.log("=====imageData====", imageData);
    res
      .status(200)
      .send({ status: 1, message: "Successfully upload to firebase" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: 0, message: error.message });
  }
});

module.exports = router;
