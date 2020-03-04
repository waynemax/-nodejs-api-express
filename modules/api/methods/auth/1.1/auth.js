class Auth extends (require('../../BaseMethod').BaseMethod) {
  constructor(props) {
    super(props);
  }

  // getVersion(callback) {
  //   this.query('select version_app from config limit 0,1', [], (q_error, q_response) => {
  //     if (q_error) {
  //       return callback({status:false})
  //     } else if (q_response.rows.length < 1) {
  //       return callback({status: false})
  //     }
  //
  //     callback({
  //       status: true,
  //       response: q_response.rows[0]
  //     });
  //   });
  // };

  execute() {
    const resp = this.req.query.login;
    this.response({
      x: resp
    });
  }
}

module.exports = {Auth};