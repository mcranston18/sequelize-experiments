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


db.authenticate()
  .then(() => db.sync({force: true}))
  .then(() => {
    console.log('great!');
    const {Team, Player} = initModels(db);
    models.Team = Team;
    models.Player = Player;

    return createTeamAndPlayer(Team, Player)
  })
  .then(data => {
    instances = data;
    return instances.teamInstance.destroy();
  })
  .then(() => {
    return models.Player.findById(instances.playerInstance.id)
  })
  .then(player => {
    if (player) {
      throw Error('Should have deleted players');
    }
    console.log('player ', player);
  })

function initModels(db) {
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

function createTeamAndPlayer(Team, Player) {
  return new Promise(resolve => {
    Team
      .sync({force: true})
      .then(() => Team.create({name: 'Toronto Maple Leafs'}))
      .then(teamInstance => {
        Player
          .sync({force: true})
          .then(() => Player.create({
            name: 'Auston Matthews',
            team_id: teamInstance.id
          }))
          .then(playerInstance => resolve({
            teamInstance,
            playerInstance
          }))
      })
  })
}
