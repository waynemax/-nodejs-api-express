const {_err, _response, ts} = require('../../../services/functions');
const config = require('../../../config');
const {ERRORS} = require('../../../services/errors');

class BaseMethod {
  constructor(props) {
    if (props) {
      this.req = props.req;
      this.res = props.res;
      this.middleware = props.middleware;
      this.db = props.db;
      this.method = props.method;
      this.route = props.route;
    }
  }

  ts() {
    return ts();
  };

  getDefaultProps() {
    return {
      req: this.req,
      res: this.res,
      db: this.db,
      middleware: {},
      route: this.route,
      method: this.method,
    };
  }

  $_GET(key) {
    if (key) {
      return this.req.query[key];
    }
    return this.req.query;
  }

  hasNextTreatment(countAll = 0, params) {
    const cursor = params.cursor || 0,
      count = params.count || 20;

    return {
      hasNext: (cursor + count) < countAll,
      cursor,
      count
    }
  }

  error(code = '', message = '', status = 200) {
    return this.res.status(status).send(
      _err(code, message)
    );
  };

  query(query = '', params, callback = (err, res) => {}) {
    this.db.query(query, params, callback);
  };

  response(data = {}) {
    this.res.send(
      _response(data)
    );
  };

  execute() {}

  vkCallbackInit() {
    const vk = new require('VK-Promise')(config.tokens.aibot);
    vk.init_callback_api(
      config.tokens.callback_string,
      config.tokens.aibot_secret, {group: config.vk_group_id
      })(this.req, this.res);
    vk.init_execute_cart(50);
    return vk;
  }

  getAuth(callback) {
    let access_token = '';
    if (this.req.headers.hasOwnProperty('authorization')) {
      access_token = this.req.headers.authorization.split(' ')[1];
    } else if (this.req.query.hasOwnProperty('access_token')) {
      access_token = this.req.query.access_token;
    }

    let AuthController = this.middleware.Auth;
      AuthController = new AuthController({...this.getDefaultProps()});
      AuthController.storage(AuthController).relevance({access_token}, authResponse => {
        if (!authResponse.status) return this.error(
          ERRORS.PERMISSION_DENIED.code,
          ERRORS.PERMISSION_DENIED.message,
          401
        );

        callback(authResponse.response);
      });
  }
}

module.exports = {BaseMethod};