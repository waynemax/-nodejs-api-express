const config = require('../config.json');
const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit : 20,
  host     		: config.db.host,
  user     		: config.db.user,
  password 		: config.db.password,
  database 		: config.db.dbname,
  debug    		: false,
  charset			: "utf8mb4"
});

module.exports.query = function(query, params, callback) {
  pool.getConnection(function(err, connection) {
    if (err) {
      console.error('errdb:', connection);
      //connection.release();
      throw err;
    }
    connection.query(query, params, function(err, rows) {
      connection.release();
      if (!err) {
        callback(null, {rows});
      }
    });
    connection.on('error', function(err) {
      throw err;
    });
  });
};

module.exports.selectObject = (fields, from, order, limit = false) => {
  return {
    fields: fields,
    from: from,
    where: [],
    order: order || "",
    limit: limit
  };
};

module.exports.selectString = (queryObject) => {
  return 'select '+ queryObject.fields.join(',') +' from ' + queryObject.from.join(',')
    + ' where ' + queryObject.where.join(' ') + ' ' + queryObject.order + (queryObject.limit ? "limit ?, ?" : "");
};


module.exports.pool = pool;
