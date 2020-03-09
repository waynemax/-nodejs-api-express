class Callback extends (require('../../BaseMethod').BaseMethod) {
  constructor(props) {
    super(props);
  }

  messageHandler({vk_id, message, event, msg}) {
    let Storage = this.middleware.Storage;
    Storage = new Storage({...this.getDefaultProps()});

    if (message.indexOf('===') > -1) {
      const split = message.split('===');
      if (split[0] === "" || split[1] === "") {
        msg.send('Не ломай. Что-то делаешь не так. Попробуй еще раз.');
        return;
      }

      return Storage.addByKey(split[0], split[1], vk_id, 1, response => {
        if (!response.status) {
          msg.send('Что-то пошло не так, попробуй еще раз...');
          return;
        }

        msg.send('Спасибо, я запомнил.');
      });
    } else {
      return Storage.getByKey(message, (response) => {
        if (!response.status) {
          return msg.send(`Я еще не знаю, как ответить на это сообщение. Научи меня? Напиши мне: ${message}===а здесь как я должен был ответить на это`);
        }

        msg.send(response.response.response_value);
      });
    }
  }

  messages(_this) {
    const ERRORS = require('../../../../../services/errors').ERRORS;
    const CONFIG = require('../../../../../config.json');
    let vk = this.vkCallbackInit();
    return {
      send: (params = {vk_id: 1, message}, callback) => {
        const checkVkUserAllow = this.db.selectObject(['vk_id', 'disabled'], ['vk_users'], '', false);
          checkVkUserAllow.where.push("`vk_id` = ? && `disabled` = 0");

        const queryParams = [];
          queryParams.push(params.vk_id);

        const query = this.db.selectString(checkVkUserAllow);
        this.query(query, queryParams, (queryError, response) => {
          const responseObjectType = {
            status: false
          };


          if (queryError || (1 > response.rows.length)) {
            return callback(responseObjectType);
          }

          return vk.messages.send({
            user_id: params.vk_id,
            message: params.message
          }).then(() => {
            vk = null;
            responseObjectType.status = true;
            return callback(responseObjectType);
          }).catch(() => {
            vk = null;
            responseObjectType.status = false;
            return callback(responseObjectType);
          });
        });
      }
    }
  }

  execute() {
    const vk = this.vkCallbackInit();
    const _this = this;
    this.res.end('OK');
    vk.on('message', function onMessage(event, msg) {
      vk.users.get({
        user_id: msg.user_id
      }).then(res => {
        const vk_id = res[0].id;
        _this.messageHandler({
          vk_id,
          message: msg.body,
          event,
          msg
        });
      }).catch(function onError(error) {
        console.error('Ошибка', error);
      });
      event.ok();
    });

    function messageAllowTreatment(event, msg) {
        const vk_user_object = {};
        const queryParams = [];

        vk_user_object.vk_id = event.data.object.user_id;
        queryParams.push(vk_user_object.vk_id);
        vk_user_object.group_id = event.data.group_id;
        queryParams.push(vk_user_object.group_id);
        vk_user_object.app_id = 1;
        queryParams.push(vk_user_object.app_id);
        vk_user_object.create_time = parseInt(( +new Date/1000 ).toFixed(0));
        queryParams.push(vk_user_object.create_time);
        vk_user_object.disabled = event.data.type === 'message_deny';
        queryParams.push(vk_user_object.disabled);

        this.query("delete from `vk_users` where `vk_id` = ?",
          [vk_user_object.vk_id],(queryErrorDelete, queryResponseDelete) => {
            if (queryErrorDelete) console.error('#23342');
            this.query("insert into `vk_users` (`id`, `vk_id`, `group_id`, `app_id`, `create_time`, `disabled`) VALUES (NULL, ?, ?, ?, ?, ?);",
              queryParams, (queryError, queryResponse) => {
                if (queryError) console.error('#334124');
              }
            );
          }
        );


      event.ok();
    }

    vk.on('message_allow', messageAllowTreatment.bind(this));
    vk.on('message_deny', messageAllowTreatment.bind(this));
  }
}

module.exports = {Callback};