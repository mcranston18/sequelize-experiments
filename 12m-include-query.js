const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const log = console.log;


const sequelize = new Sequelize('dummy_db', 'postgres', '', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
}, {
  underscored: true
});

console.log('Op', Op);

const Article = sequelize.define('articles', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  name: Sequelize.STRING
}, {
  underscored: true
});

const Tag = sequelize.define('tags', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  name: Sequelize.STRING
});

Article.hasMany(Tag);

start();

async function start() {
  await sequelize.sync({force: true});

  const article = await Article.create({name: 'My article'});
  const tag1 = await Tag.create({name: 'tag1'});
  const tag2 = await Tag.create({name: 'tag2'});
  const tag3 = await Tag.create({name: 'tag3'});

  await article.setTags([tag1, tag2]);

  const articles = await Article.findAll({
    include: [
      {
        model: Tag,
        where: {
          $and: [
            {name: 'tag1'},
            {name: 'tag2'},
          ]
        }
      }
    ]
  }).catch(log);

  console.log('articles', articles);
  // console.log('articles.tags', articles[0].tags);
  // console.log('name ', articles[0].name);
  // const tags = articles[0].tags.map(x => x.dataValues.name);
  // console.log('tags ', tags);
}

