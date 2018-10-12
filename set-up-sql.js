const Sequelize = require('sequelize');

const db = new Sequelize('test_db', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  storage: 'db.sqlite'
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

