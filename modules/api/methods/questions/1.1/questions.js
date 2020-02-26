class Questions extends (require('../../BaseMethod').BaseMethod) {
  constructor(props) {
    super(props);
  }

  execute() {
    let Auth = this.middleware.Auth;
    Auth = new Auth({...this.getDefaultProps()});

    return Auth.getVersion(cb => {
      if (!cb.status) {
        return this.error('test', 'test');
      }

      this.db.query('select version_app from config limit 0,1', (q_error, q_response) => {
        if (q_error) {
          return this.res.send('fail');
        }

        Auth.getVersion(cb2 => {
          if (!cb2.status) {
            return this.error('xz2', 'xz2');
          }

          return this.response({
            rows: q_response.rows,
            auth: cb.response,
            auth2: cb2.response
          });
        });
      });
    });
  };
}

module.exports = {Questions};