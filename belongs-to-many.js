const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const log = console.log;

const db = new Sequelize('test_db', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'db.sqlite'
});

// const db = new Sequelize('sequelize', 'postgres', '', {
//   host: 'localhost',
//   dialect: 'postgres'
// });


const selectQuery = {type: db.QueryTypes.SELECT};
let models = {};
let instances = {};

run();

async function run() {
  await db.authenticate();
  await db.sync({force: true});
  const models = defineModels(db);
  const instances = await createModelInstances(models);
  await instances.filmInstance.setFestivals([instances.festivalInstance]);

  const countsBefore = await getCounts();
  log('countsBefore', countsBefore);

  // await instances.filmInstance.destroy();
  await instances.festivalInstance.destroy();

  const countsAfter = await getCounts();

  log('countsAfter', countsAfter);
  if (countsAfter.film !== 0) {
    console.error('\x1b[31m', `Film count should be zero`)
  }

  if (countsAfter.festival !== 0) {
    console.error('\x1b[31m', `Festival count should be zero`)
  }

  if (countsAfter.filmFestival !== 0) {
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
  const filmCount = await db.query('SELECT COUNT(*) as count FROM films;', selectQuery);
  const festivalCount = await db.query('SELECT COUNT(*) as count FROM festivals;', selectQuery);
  const filmFestivalCount = await db.query('SELECT COUNT(*) as count FROM film_festivals;', selectQuery);

  return {
    film: parseInt(filmCount[0].count),
    festival: parseInt(festivalCount[0].count),
    filmFestival: parseInt(filmFestivalCount[0].count),
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

  const FilmFestival = db.define('film_festivals', {});

  Film.belongsToMany(Festival, {
    through: FilmFestival,
    foreignKey: {
      name: 'film_id'
    }
  });

  Festival.belongsToMany(Film, {
    through: FilmFestival,
    foreignKey: {
      name: 'festival_id'
    }
  });

  db.sync();

  return {Film, Festival};
}
