const Sequelize = require('sequelize');

const sequelize = new Sequelize('test_db', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  storage: 'db.sqlite'
});

const Driver = sequelize.define('driver', {
  name: { type: Sequelize.STRING }
});

const CarDriver = sequelize.define('car_driver', {
  name: { type: Sequelize.STRING }
});

CarDriver.belongsTo(Driver, {
  onDelete: 'CASCADE',
  foreignKey: 'driver_id'
});

start();

const raw = true

async function start() {
  await sequelize.sync({force: true});

  const driver = await Driver.create({
    name: 'first driver'
  })

  const carDriver = await CarDriver.create({
    name: 'first carDriver',
    driver_id: driver.id
  })

  const drivers = await Driver.findAll({raw})
  const carDrivers = await CarDriver.findAll({raw})

  console.log('drivers ', drivers)
  console.log('carDrivers ', carDrivers)
}

