require('dotenv').config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const Dropbox = require("dropbox").Dropbox;
const fetch = require("node-fetch");

const app = express();
const port = 3000;

// Enable CORS for any origin
app.use(cors());

// Initialize Dropbox
const dropbox = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN, fetch: fetch });

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory

const upload = multer({ storage: storage });

// Endpoint to receive image uploads
app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const filename = `${Date.now()}-${uuidv4()}${path.extname(req.file.originalname)}`;

  try {
    const response = await dropbox.filesUpload({
      path: `/${filename}`,
      contents: req.file.buffer,
      mode: "add",
      autorename: true,
      mute: false,
    });
    console.log(response);

    const shareResponse = await dropbox.sharingCreateSharedLinkWithSettings({
      path: response.result.path_display,
    });
    console.log(shareResponse);

    const fileUrl = shareResponse.result.url.replace("dl=0", "raw=1"); // Convert to direct download link
    res.json({ url: fileUrl });
  } catch (error) {
    console.error("Error uploading to Dropbox:", error);
    res.status(500).send("Error uploading to Dropbox");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// const express = require('express');
// const multer = require('multer');
// const cors = require('cors');
// const { v4: uuidv4 } = require('uuid');
// const fs = require('fs');
// const path = require('path');

// const app = express();
// const port = 3000;

// // Enable CORS for any origin
// app.use(cors());

// // Set up multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(__dirname, 'uploads');
//     if (!fs.existsSync(uploadPath)){
//       fs.mkdirSync(uploadPath);
//     }
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${uuidv4()}`);
//   },
// });

// const upload = multer({ storage: storage });

// // Endpoint to receive image uploads
// app.post('/upload', upload.single('image'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).send('No file uploaded.');
//   }
//   const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
//   res.json({ url: fileUrl });
// });

// // Serve static files from the uploads directory
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });
