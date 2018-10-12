const Sequelize = require('sequelize');

const sequelize = new Sequelize('test_db', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  storage: 'db.sqlite'
});

const Card = sequelize.define('card', {
  name: { type: Sequelize.STRING }
});

const Order = sequelize.define('order', {
  name: { type: Sequelize.STRING }
});

Order.hasOne(Card, { foreignKey: 'order_id' }); // if foreignKey is not included, will default to orderId

start();

const raw = true

async function start() {
  await sequelize.sync({force: true});

  const order = await Order.create({
    name: 'first order'
  })

  const card = await Card.create({
    name: 'first card',
    order_id: order.id
  })

  const orders = await Order.findAll({raw})
  const cards = await Card.findAll({raw})

  console.log('orders ', orders)
  console.log('cards ', cards)
}

