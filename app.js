const Sequelize = require('sequelize');

const db = new Sequelize('sequelize', 'postgres', '', {
  host: 'localhost',
  dialect: 'postgres'
});

const models = {};

db.authenticate()
  .then(() => db.sync({force: true}))
  .then(() => {
    console.log('great!');
    const {User, Task} = initModels(db);
    models.User = User;
    models.Task = Task;

    return createUserAndTask(User, Task)
  })
  .then(instances => {
    return instances.userInstance.destroy();
  })
  .then(() => {
    return models.Task.findAll()
  })
  .then(tasks => {
    console.log('tasks', tasks.length);
  })

function initModels(db) {
  const User = db.define('user', {
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

  const Task = db.define('task', {
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

  User.hasMany(Task, {
    foreignKey: {
      allowNull: false
    }
  });
  Task.belongsTo(User);

  return {User, Task};
}

function createUserAndTask(User, Task) {
  return new Promise(resolve => {
    User
      .sync({force: true})
      .then(() => User.create({name: 'Jane'}))
      .then(userInstance => {
        Task
          .sync({force: true})
          .then(() => Task.create({
            name: 'some task',
            user_id: userInstance.id
          }))
          .then(taskInstance => resolve({
            userInstance,
            taskInstance
          }))
      })
  })
}
