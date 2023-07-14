const fs = require('fs');
const csv = require('csv-parser');
const { Boletos } = require('../models/index');

async function processCSV(filePath) {
  const results = [];

  return new Promise((resolve, reject) => {
    const parser = csv({columns: true}, function (err, records) {
      console.log(records);
    });

    fs.createReadStream(filePath)
      .pipe(csv(parser))
      .on('data', (data) => results.push(data))
      .on('end', () => {
        const promises = results.map(async (row) => {
          const { nome, unidade, valor, linha_digitavel } = row;

          try {
            await Boletos.create({
              nome_sacado: nome,
              valor: parseFloat(valor),
              linha_digitavel,
              ativo: true,
              criado_em: new Date(),
              loteId: parseInt(unidade),
            });
          } catch (error) {
            console.error('Error inserting row:', error);
            reject(error);
          }
        });

        Promise.all(promises)
          .then(() => {
            console.log('CSV file processed successfully.');
            resolve();
          })
          .catch((error) => {
            console.error('Error processing CSV file:', error);
            reject(error);
          });
      });
  });
}

module.exports = {
  processCSV,
};
