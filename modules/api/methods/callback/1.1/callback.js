class Callback extends (require('../../BaseMethod').BaseMethod) {
  constructor(props) {
    super(props);
  }

  execute() {
    const vk = this.vkCallbackInit();
    const database = this.db;
    this.res.end('OK');

    vk.on('message', function onMessage(event, msg) {
      vk.users.get({
        user_id: msg.user_id
      }).then(res => {
        const name = res[0].first_name + ' ' + res[0].last_name;
        database.query('select version_app from config limit 0,1', (q_error, q_response) => {
          if (q_error) {
            msg.send('Что-то не удалось подключиться к базе(((');
            return;
          }

          msg.send(name + ' говорит: ' + msg.body + ' + (db):' + JSON.stringify(q_response));
        });
      }).catch(function onError(error) {
        console.log('Ошибка', error);
      });
      event.ok();
    });
  }
}

module.exports = {Callback};