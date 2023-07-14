const express = require('express');
const multer = require('multer');
const { processCSV } = require('../service/csvService');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    await processCSV(req.file.path);

    res.status(200).json({ message: 'File uploaded and processed successfully.' });
  } catch (error) {
    console.error('Error processing CSV file:', error);
    res.status(500).json({ error: 'Error processing CSV file.' });
  }
});

module.exports = router;
