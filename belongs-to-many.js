const Sequelize = require('sequelize');

// const db = new Sequelize('test_db', 'username', 'password', {
//   host: 'localhost',
//   dialect: 'sqlite',
//   storage: 'db.sqlite'
// });

const db = new Sequelize('sequelize', 'postgres', '', {
  host: 'localhost',
  dialect: 'postgres'
});

let models = {};
let instances = {};

run();

async function run() {
  await db.authenticate();
  await db.sync({force: true});
  const models = defineModels(db);
  const instances = await createModelInstances(models);

  await instances.filmInstance.setFestivals([instances.festivalInstance]);

  await instances.filmInstance.destroy();
  await instances.festivalInstance.destroy();

  const counts = await getCounts();

  console.log('counts', counts);
  if (counts.film !== 0) {
    console.error('\x1b[31m', `Film count should be zero`)
  }

  if (counts.festival !== 0) {
    console.error('\x1b[31m', `Festival count should be zero`)
  }

  if (counts.filmFestival !== 0) {
    console.error('\x1b[31m', `Film festival count should be zero`)
  }
}

async function createModelInstances(models) {
  await models.Film.sync({force: true});
  await models.Festival.sync({force: true});
  await db.query('DELETE FROM film_festivals;');

  const filmInstance = await models.Film.create({name: 'Aviator'});
  const festivalInstance = await models.Festival.create({name: 'TIFF'});

  return {filmInstance, festivalInstance};
}

async function getCounts() {
  const filmCount = await db.query('SELECT COUNT(*) FROM films;');
  const festivalCount = await db.query('SELECT COUNT(*) FROM festivals;');
  const filmFestivalCount = await db.query('SELECT COUNT(*) FROM film_festivals;');

  return {
    film: parseInt(filmCount[0][0].count),
    festival: parseInt(festivalCount[0][0].count),
    filmFestival: parseInt(filmFestivalCount[0][0].count),
  }
}

function defineModels(db) {
  const Film = db.define('film', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    }
  }, {
    underscored: true
  });

  const Festival = db.define('festival', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    }
  }, {
    underscored: true
  });

  const FilmFestival = db.define('film_festivals', {}, {});

  Film.belongsToMany(Festival, {
    through: FilmFestival,
    foreignKey: {
      name: 'film_id',
      allowNull: false
    },
    onDelete: 'CASCADE'
  });

  Festival.belongsToMany(Film, {
    through: FilmFestival,
    foreignKey: {
      name: 'festival_id',
      allowNull: false
    },
    onDelete: 'CASCADE'
  });

  db.sync();

  return {Film, Festival};
}
