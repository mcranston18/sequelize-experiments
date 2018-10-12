const Sequelize = require('sequelize');

const sequelize = new Sequelize('dummy_db', 'postgres', '', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

const Product = sequelize.define('product', {
  title: { type: Sequelize.STRING },
  color: { type: Sequelize.STRING },
});

const User = sequelize.define('user', {
    name: { type: Sequelize.STRING },
});

Product.belongsTo(User);
User.hasMany(Product);

start();

async function start() {
  await sequelize.sync({force: true});
}

