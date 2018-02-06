const Sequelize = require('sequelize');

const db = new Sequelize('test_db', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  storage: 'db.sqlite'
});

// const db = new Sequelize('sequelize', 'postgres', '', {
//   host: 'localhost',
//   dialect: 'postgres'
// });

let models = {};
let instances = {};

run();

async function run() {
  await db.authenticate();
  await db.sync({force: true});
  const models = defineModels(db);
  const instances = await createModelInstances(models);

  // destroy the team which should destro the associated players
  instances.teamInstance.destroy();

  // should return null
  const playerThatShouldBeDeleted = await models.Player.findById(instances.playerInstance.id);

  if (playerThatShouldBeDeleted) {
    throw new Error('Player not deleted');
  } else {
    console.log('success');
  }
}

async function createModelInstances(models) {
  await models.Team.sync({force: true});
  await models.Player.sync({force: true});

  const teamInstance = await models.Team.create({name: 'Toronto Maple Leafs'});
  const playerInstance = await models.Player.create({
    name: 'Auston Matthews',
    team_id: teamInstance.id
  });

  return {teamInstance, playerInstance};
}

function defineModels(db) {
  const Team = db.define('team', {
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

  const Player = db.define('player', {
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

  Team.hasMany(Player, {
    foreignKey: {
      allowNull: false
    }
  });

  Player.belongsTo(Team);

  return {Team, Player};
}
