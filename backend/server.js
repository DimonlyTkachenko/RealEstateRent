const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Enable CORS for any origin
app.use(cors());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)){
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${uuidv4()}`);
  },
});

const upload = multer({ storage: storage });

// Endpoint to receive image uploads
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
