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

module.exports.query = function(query, callback) {
  pool.getConnection(function(err, connection) {
    if (err) {
      console.log('err', connection)
      //connection.release();
      throw err;
    }
    connection.query(query, function(err, rows) {
      connection.release();
      if(!err) {
        callback(null, {rows});
      }
    });
    connection.on('error', function(err) {
      throw err;
      return;
    });
  });
};

module.exports.pool = pool;
