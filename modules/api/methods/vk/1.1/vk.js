class Vk extends (require('../../BaseMethod').BaseMethod) {
  constructor(props) {
    super(props);
  }

  execute() {
    const storage = this.storage(this);
    switch (this.method) {
      case 'send':
        return storage.send({
          ...this.$_GET()
        }, response => {
          return this.res.status(200).send(response);
        });
    }

    this.error('unknownError');
  }

  storage(_this) {
    const ERRORS = require('../../../../../services/errors').ERRORS;
    const CONFIG = require('../../../../../config.json');
    return {
      send: (params = {vk_id, message}, callback) => {
        if (params.secret_key !== CONFIG.tokens.aibot_secret) {
          return this.error(
            ERRORS.PERMISSION_DENIED.code,
            ERRORS.PERMISSION_DENIED.message
          )
        }

        let CallbackController = this.middleware.Callback;
          CallbackController = new CallbackController({..._this.getDefaultProps()});

        return CallbackController.messages(_this).send({
          vk_id: params.vk_id, message: params.message}, sendCallback => {
          return callback({
            x: 'test'
          });
        });
      }
    }
  };
}

module.exports = {Vk};