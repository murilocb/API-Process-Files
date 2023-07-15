const { Boletos } = require("../models");
const PDFDocument = require("pdfkit");
const { Op } = require("sequelize");

async function filtrarBoletos(nome, valor_inicial, valor_final, id_lote) {
  let where = {};

  if (nome) {
    where.nome_sacado = { [Op.like]: `%${nome}%` };
  }
  if (valor_inicial) {
    where.valor = { [Op.gte]: parseFloat(valor_inicial) };
  }
  if (valor_final) {
    where.valor = {
      ...where.valor,
      [Op.lte]: parseFloat(valor_final),
    };
  }
  if (id_lote) {
    where.id_lote = parseInt(id_lote);
  }

  const boletosFiltrados = await Boletos.findAll({ where });
  return boletosFiltrados;
}

async function gerarRelatorioPDF() {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    doc.text("Relatório de Boletos", { align: "center", fontSize: 16 });
    doc.moveDown();

    Boletos.findAll()
      .then((boletos) => {
        const table = {
          headers: ["ID", "Nome Sacado", "ID Lote", "Valor", "Linha Digitável"],
          rows: boletos.map((boleto) => [
            boleto.id,
            boleto.nome_sacado,
            boleto.id_lote,
            boleto.valor.toFixed(2),
            boleto.linha_digitavel,
          ]),
        };

        const columnWidths = [60, 150, 60, 80, 150];

        const columnBody = [10, 25, 10, 15, 20];

        generateTable(doc, table, columnWidths, columnBody);

        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => {
          const pdfBytes = Buffer.concat(chunks);
          resolve(pdfBytes);
        });

        doc.end();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function generateTable(doc, table, columnWidths, columnBody) {
  const { headers, rows } = table;

  doc.font("Helvetica-Bold").fontSize(12);

  const headerRow = headers.join("   |   ");
  doc.text(headerRow, {
    width: columnWidths.reduce((a, b) => a + b),
    align: "center",
  });

  const horizontalLine = "-".repeat(headerRow.length);
  doc.text(horizontalLine, {
    width: columnWidths.reduce((a, b) => a + b),
    align: "center",
  });

  doc.font("Helvetica").fontSize(10);

  for (const row of rows) {
    const formattedRow = row.map((item, index) => {
      const width = columnBody[index] - 5;
      return item.toString().padEnd(width);
    });
    doc.text(formattedRow.join("|      "), {
      width: columnWidths.reduce((a, b) => a + b),
      align: "center",
    });
  }
}

async function allBoletos() {
  const boleto = await Boletos.findAll();

  return boleto;
}

module.exports = { filtrarBoletos, gerarRelatorioPDF, allBoletos };
