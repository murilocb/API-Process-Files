const express = require('express');
const multer = require('multer');
const { processCSV } = require('../service/csvService');

const router = express.Router();
const upload = multer();

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }
    const { path } = req.file;
    await processCSV(path);

    res.status(200).json({ message: 'File uploaded and processed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Error processing CSV file.' });
  }
});

module.exports = router;
