/*
  Sequelize using Postgres is not deleting records in the "through" table.
  Steps to recreate

  1. create "films" table
  2. create "festivals" table
  3. set m2m between the two
  4. set association between one film and one festival
  5. confirm "film" has one row
  6. confirm "festival" has one row
  7. confirm "film_festivals" has one row
  8. delete "film" and "festival"
  9. expect "film_festivals" to have been deleted
*/

const process = require('process');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const log = console.log;
const logError = msg => {
  console.error('\x1b[31m', msg);
  process.exit();
};

// grant ALL on database m2m_not_deleting to group postgres;

const db = new Sequelize('m2m_not_deleting', 'postgres', '', {
  host: 'localhost',
  logging: true,
  dialect: 'postgres'
});


const selectQuery = {type: db.QueryTypes.SELECT};
let models = {};
let instances = {};

run();

const tableName = 'film_festivals';

async function run() {
  await db.query(`DROP TABLE IF EXISTS films CASCADE;`);
  await db.query(`DROP TABLE IF EXISTS festivals CASCADE;`);
  await db.query(`DROP TABLE IF EXISTS film_festivals CASCADE;`);

  await db.sync({force: true});

  const models = defineModels(db);
  const instances = await createModelInstances(models);
  await instances.filmInstance.setFestivals([instances.festivalInstance]);

  const countsBefore = await getCounts();
  log('countsBefore', countsBefore);

  await instances.filmInstance.destroy({
    truncate: {cascade: true}
  });
  await instances.festivalInstance.destroy({
    truncate: {cascade: true}
  });

  const countsAfter = await getCounts();

  log('countsAfter', countsAfter);
  if (countsAfter.film !== 0) {
    logError(`Film count should be zero`)
  }

  if (countsAfter.festival !== 0) {
    logError(`Festival count should be zero`)
  }

  if (countsAfter.filmFestival !== 0) {
    logError(`Film festival count should be zero`)
  }
}

async function createModelInstances(models) {
  await models.Film.sync({force: true});
  await models.Festival.sync({force: true});
  // await db.query(`DELETE FROM ${tableName};`);

  const filmInstance = await models.Film.create({name: 'Aviator'});
  const festivalInstance = await models.Festival.create({name: 'TIFF'});

  return {filmInstance, festivalInstance};
}

async function getCounts() {
  const filmCount = await db.query('SELECT COUNT(*) as count FROM films;', selectQuery);
  const festivalCount = await db.query('SELECT COUNT(*) as count FROM festivals;', selectQuery);
  const filmFestivalCount = await db.query(`SELECT COUNT(*) as count FROM film_festivals;`, selectQuery);

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

  const FilmFestival = db.define('film_festivals', {}, {
    onDelete: 'cascade'
  });

  Film.belongsToMany(Festival, {
    through: FilmFestival
  });

  Festival.belongsToMany(Film, {
    through: FilmFestival
  });

  db.sync();

  return {Film, Festival};
}
