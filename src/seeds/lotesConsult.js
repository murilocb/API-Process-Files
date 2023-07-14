const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: './database.sqlite',
});

const LotesConsult = sequelize.define('lotesConsult', {
  nome_lote: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

async function seed() {
  try {
    await LotesConsult.sync({ force: true });

    await LotesConsult.bulkCreate([
      { nome_lote: '0017', id: 3 },
      { nome_lote: '0018', id: 6 },
      { nome_lote: '0019', id: 7 },
    ]);

    console.log('Seed data inserted successfully.');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await sequelize.close();
  }
}

seed();
