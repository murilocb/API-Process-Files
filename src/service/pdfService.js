const { PDFDocument } = require("pdf-lib");
const { Boletos } = require("../models");
const { Op } = require("sequelize");
const fs = require("fs").promises;

const PDFExtract = require("pdf.js-extract").PDFExtract;
const pdfExtract = new PDFExtract();

async function extractPages(pdfPath, outputDirectory) {
  try {
    const data = await pdfExtract.extract(pdfPath, {});
    const pages = data.pages;
    const pdfDoc = await PDFDocument.load(await fs.readFile(pdfPath));

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const lines = page.content;

      for (let j = 0; j < lines.length; j++) {
        const line = lines[j].str;
        const words = line.split(" ");
        const desiredWord = words[3];

        const boleto = await Boletos.findOne({
          where: {
            nome_sacado: {
              [Op.like]: `%${desiredWord}%`,
            },
          },
        });

        if (boleto) {
          const extractedPdfDoc = await PDFDocument.create();
          const [copiedPage] = await extractedPdfDoc.copyPages(pdfDoc, [i]);
          extractedPdfDoc.addPage(copiedPage);

          const extractedPdfBytes = await extractedPdfDoc.save();
          const outputPath = `${outputDirectory}/${boleto.id}.pdf`;
          await fs.writeFile(outputPath, extractedPdfBytes);
        }
      }
    }

    console.log("PDF pages extracted and saved successfully.");
  } catch (error) {
    console.error("Error extracting and saving PDF pages:", error);
    throw error;
  }
}

module.exports = { extractPages };
