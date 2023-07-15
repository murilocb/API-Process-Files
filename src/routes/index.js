const express = require("express");
const multer = require("multer");
const fs = require("fs").promises;
const path = require("path");
const { processCSV } = require("../service/csvService");
const { filtrarBoletos, gerarRelatorioPDF, allBoletos } = require('../service/getBoletosService')
const pdfService = require("../service/pdfService");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/boleto", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded." });
      return;
    }

    await processCSV(req.file.path);

    res
      .status(200)
      .json({ message: "File uploaded and processed successfully." });
  } catch (error) {
    console.error("Error processing CSV file:", error);
    res.status(500).json({ error: "Error processing CSV file." });
  }
});

router.get(
  "/boletos/:nome?/:valor_inicial?/:valor_final?/:id_lote?/:relatorio?",
  async (req, res) => {
    const { relatorio, nome, valor_inicial, valor_final, id_lote } = req.query;

    if (relatorio) {
      const relatorioPDF = await gerarRelatorioPDF();
      const fileName = 'relatorio_boletos.pdf';
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/pdf');
      res.send(relatorioPDF);
    } else if (nome || valor_inicial || valor_final || id_lote) {
      const boletosFiltrados = await filtrarBoletos(
        nome,
        valor_inicial,
        valor_final,
        id_lote
      );
      res.json(boletosFiltrados);
    } else {
      const boletosFiltrados = await allBoletos();
      res.json(boletosFiltrados);
    }
  }
);

router.post("/pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded." });
      return;
    }

    const inputPdfPath = req.file.path;
    const outputDirectory = path.join(__dirname, "..", "..", "pdfs");
    await fs.mkdir(outputDirectory, { recursive: true });
    await fs.chmod(outputDirectory, 0o755);

    await pdfService.extractPages(inputPdfPath, outputDirectory);

    res.status(200).json({ message: "PDF pages extracted successfully." });
  } catch (error) {
    console.error("Error extracting PDF pages:", error);
    res.status(500).json({ error: "Error extracting PDF pages." });
  }
});

module.exports = router;
