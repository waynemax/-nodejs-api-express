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
        console.log('Ошибка', error);
      });
      event.ok();
    });
  }
}

module.exports = {Callback};