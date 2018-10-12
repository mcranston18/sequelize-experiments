const Sequelize = require('sequelize');

// const db = new Sequelize('test_db', 'username', 'password', {
//   host: 'localhost',
//   dialect: 'sqlite',
//   storage: 'db.sqlite'
// });

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

  const created = await User.create({
    name: 'foo',
    products:[
      { title: 'prod1', color:'blue' },
      { title: 'prod2', color:'red' },
    ]
  }, {
    include: [Product]
  });

  const data = await sequelize.models.user.findOne({
      where: { name:'foo' },
      include: [Product]
  });

  // data.products[0].color = 'green';
  await data.products[0].update({
    color: 'some other color'
  });

  // result
  const data2 = await sequelize.models.user.findOne({
      where: { name:'foo' },
      include: [Product]
  });

  data.dataValues.products.forEach(x => console.log(x.dataValues));
  console.log( '-------------' )
  data2.dataValues.products.forEach(x => console.log(x.dataValues));
}

