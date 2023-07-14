const { createReadStream } = require("fs");
const { Boletos, LotesConsult, Lotes } = require("../models/index");
const csv = require("csv-parser");

async function processCSV(filePath) {
  const results = [];

  return new Promise((resolve, reject) => {
    createReadStream(filePath)
      .pipe(csv({ delimiter: "," }))
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          const promises = results.map(async (row) => {
            const { nome, unidade, valor, linha_digitavel } = row;

            const lotesConsultRecord = await LotesConsult.findOne({
              where: { nome_lote: '00' + unidade },
            });

            await Lotes.findOrCreate({
              where: { id: lotesConsultRecord.id },
              nome,
              ativo: true,
              criado_em: new Date(),
            });

            if (!lotesConsultRecord) {
              console.error(
                `No matching lotesConsult record found for unidade: ${unidade}`
              );
              return;
            }

            await Boletos.create({
              nome_sacado: nome,
              id_lote: lotesConsultRecord.id,
              valor: parseFloat(valor),
              linha_digitavel,
              ativo: true,
              criado_em: new Date(),
            });
          });

          await Promise.all(promises);

          console.log("CSV file processed successfully.");
          resolve();
        } catch (error) {
          console.error("Error processing CSV file:", error);
          reject(error);
        }
      });
  });
}

module.exports = { processCSV };
