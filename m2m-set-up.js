const Sequelize = require('sequelize');

const sequelize = new Sequelize('dummy_db', 'postgres', '', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

const User = sequelize.define('users', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: Sequelize.STRING,
}, {
  tableName: 'users',
  timestamps: true
});

const Role = sequelize.define('roles', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  roleName: {
    type: Sequelize.STRING,
    unique: true
  }
}, {
  tableName: 'roles',
  timestamps: true
});

const UserRole = sequelize.define('users_role', {
  role_id: {
    type: Sequelize.INTEGER,
    unique: 'user_role_roleable'
  },
  user_id: {
    type: Sequelize.INTEGER
  }
}, {
  tableName: 'users_roles',
  timestamps: true
});

User.belongsToMany(Role, {
  as: 'roles',
  through: 'users_roles',
  constraints: false,
  foreignKey: 'role_id'
});

Role.belongsToMany(User, {
  as: 'users',
  through: 'users_roles',
  constraints: false,
  foreignKey: 'user_id'
});

start();

async function start() {
  await sequelize.sync({force: true});
  const user = await User.create({name: 'John'});
  const role = await Role.create({roleName: 'superuser'});

  console.log(' user.setRoles ', !!user.setRoles)

  await user.setRoles([role]);

  const users = await User.findAll({
    include: [{
      model: Role,
      as: 'roles'
    }]
  });

  console.log('users ', users);
}

