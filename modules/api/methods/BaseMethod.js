const {_err, _response} = require('../../../services/functions');
const config = require('../../../config');

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
}

module.exports = {BaseMethod};