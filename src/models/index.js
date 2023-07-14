const Sequelize = require('sequelize');
const sequelize = require('../database/db');

const Lotes = sequelize.define('lotes', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nome: {
    type: Sequelize.STRING(100),
    allowNull: true,
  },
  ativo: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
  },
  criado_em: {
    type: Sequelize.DATE,
    allowNull: true,
  },
});

const Boletos = sequelize.define('boletos', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nome_sacado: {
    type: Sequelize.STRING(255),
    allowNull: true,
  },
  id_lote: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Lotes,
      key: 'id',
    },
  },
  valor: {
    type: Sequelize.DECIMAL,
    allowNull: true,
  },
  linha_digitavel: {
    type: Sequelize.STRING(255),
    allowNull: true,
  },
  ativo: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
  },
  criado_em: {
    type: Sequelize.DATE,
    allowNull: true,
  },
});

Lotes.hasMany(Boletos, { foreignKey: 'id_lote' });
Boletos.belongsTo(Lotes, { foreignKey: 'id_lote' });

sequelize.sync()
  .then(() => {
    console.log('Tables created successfully.');
  })
  .catch((error) => {
    console.error('Unable to create tables:', error);
  });

module.exports = {
  Lotes,
  Boletos,
};
