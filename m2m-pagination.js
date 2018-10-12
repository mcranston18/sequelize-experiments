/*
  Sequelize using Postgres is not deleting records in the "through" table.
  Steps to recreate

  1. create "rebates" table
  2. create "zip_codes" table
  3. set m2m between the two
  4. set association between one rebate and one zip_code
  5. confirm "rebate" has one row
  6. confirm "zip_code" has one row
  7. confirm "rebate_zip_codes" has one row
  8. delete "rebate" and "zip_code"
  9. expect "rebate_zip_codes" to have been deleted
*/

const process = require('process');
const Sequelize = require('sequelize');

const log = console.log;

const logError = msg => {
  console.error('\x1b[31m', msg);
  process.exit();
};

const db = new Sequelize('sequelize', 'postgres', '', {
  host: 'localhost',
  logging: false,
  dialect: 'postgres'
});


const selectQuery = {type: db.QueryTypes.SELECT};
let models = {};
let instances = {};

run();

async function run() {
  await db.sync({force: true});

  const models = defineModels(db);
  const instances = await createModelInstances(models);
  await associateInstances(instances);

  const countsBefore = await getCounts();
  // console.log('countsBefore', countsBefore);
  // const finalRebate = await models.Rebate.create({name: '11', active: true});
  // const finalZip = await models.ZipCode.create({name: '11'});
  // await finalRebate.setZip_codes([finalZip]);

  // const zipCodes = await models.ZipCode.findAll({
  //   limit: 3,
  //   include: [{
  //     model: models.Rebate,
  //     where: {
  //       active: {
  //         $eq: true
  //       }
  //     }
  //   }]
  // });

  const zipCodeCount = await models.ZipCode.count();

  console.log( zipCodeCount )
  const hm = await db.query(`
    SELECT *
    FROM rebates
    WHERE id IN (
      SELECT rebate_id FROM (
        SELECT rebate_id, COUNT(*) AS counter
        FROM rebate_zip_codes
        GROUP BY rebate_id
      ) AS tbl
      WHERE counter = (SELECT count(*) as COUNT from zip_codes)
    )
  `, {type: db.QueryTypes.SELECT})

  console.log( hm )

  // const rebates = await models.Rebate.findAll({
  //   where: {
  //     id: {
  //       $in: hm.map(x => x.rebate_id)
  //     }
  //   },
  //   raw: true
  // });


  // console.log( rebates )
}

async function createModelInstances(models) {
  await models.Rebate.sync({force: true});
  await models.ZipCode.sync({force: true});
  await db.query('DELETE FROM rebate_zip_codes;');

  const rebates = await createInstances(models.Rebate);
  const zipCodes = await createInstances(models.ZipCode);

  return {rebates, zipCodes};
}

async function createInstances(model) {
  const items = getObjects();
  const instances = [];
  for (let item of items) {
    const instance = await model.create(item);
    instances.push(instance);
  }

  return instances;
}

async function associateInstances(instances) {
  var i = 0;
  for (let instance of instances.rebates) {
    let blah = i < 2 ? instances.zipCodes : instances.zipCodes.slice(0,2);
    await instance.setZip_codes(blah);
    i++;
  }
}

function getObjects() {
  var arr = [];

  for (let i = 1; i <= 10; i++) {
    arr.push({name: i, active: false});
  }

  return arr;
}

async function getCounts() {
  const rebateCount = await db.query('SELECT COUNT(*) as count FROM rebates;', selectQuery);
  const zip_codeCount = await db.query('SELECT COUNT(*) as count FROM zip_codes;', selectQuery);
  const rebateZipCodeCount = await db.query('SELECT COUNT(*) as count FROM rebate_zip_codes;', selectQuery);

  return {
    rebate: parseInt(rebateCount[0].count),
    zip_code: parseInt(zip_codeCount[0].count),
    rebateZipCode: parseInt(rebateZipCodeCount[0].count),
  }
}

function defineModels(db) {
  const Rebate = db.define('rebate', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    },
    active: {
      type: Sequelize.BOOLEAN
    }
  }, {
    underscored: true
  });

  const ZipCode = db.define('zip_code', {
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

  const RebateZipCode = db.define('rebate_zip_codes', {}, {});

  Rebate.belongsToMany(ZipCode, {
    through: RebateZipCode,
    foreignKey: {
      name: 'rebate_id'
    }
  });

  ZipCode.belongsToMany(Rebate, {
    through: RebateZipCode,
    foreignKey: {
      name: 'zip_code_id'
    }
  });

  db.sync();

  return {Rebate, ZipCode};
}
