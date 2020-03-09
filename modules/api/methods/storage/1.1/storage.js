class Storage extends (require('../../BaseMethod').BaseMethod) {
  constructor(props) {
    super(props);
  }

  getByKey(request_key, callback) {
    console.log(5, request_key[0]);
    this.db.query("select * from storage where `request_key` = ? ORDER BY rand() limit 0,1",
      [request_key[0].toLowerCase()], (q_error, q_response) => {
        if (q_error) {
          return callback({ status: false })
        } else if (q_response.rows.length < 1) {
          return callback({ status: false })
        }

        return callback({
          status: true,
          response: q_response.rows[0]
        });
    });
  }

  addByKey(request_key, response_value, author_info = '', client_id = 1, callback) {
    this.hasBy(request_key, response_value, client_id, (has) => {
      if (has) {
        return callback({
          status: true
        });
      }

      this.query("INSERT INTO `storage` (`id`, `request_key`, `response_value`, `date_add`, `author_info`, `client_id`) VALUES (NULL, ?, ?, '"+(Math.round((+new Date())/1000))+"', ?, ?)",
        [(request_key).toLowerCase(), (response_value).toLowerCase(), author_info, client_id], (q_error, q_response) => {
          if (q_error) {
            return callback({ status: false })
          }

          return callback({
            status: true,
          });
      })
    });
  }

  hasBy(request_key, response_value, client_id = 1, callback) {
    this.db.query("select id from storage where `request_key` = ? && `response_value` = ? && `client_id` = ? limit 0,1",
      [request_key.toLowerCase(), response_value.toLowerCase(), client_id], (q_error, q_response) => {
        if (q_error) {
          return callback(false)
        } else if (q_response.rows.length < 1) {
          return callback(false)
        }

        return callback(true);
    });
  }

  removeByKey(request_key, response_value, client_id = 1, callback) {
    this.query("DELETE FROM `storage` WHERE `request_key` = ? && `response_value` = ? && `client_id` = ?",
      [request_key.toLowerCase(), response_value.toLowerCase(), client_id], (q_error, q_response) => {
        if (q_error) {
          return callback({ status: false })
        }

        return callback({
          status: true,
        });
    })
  }

  execute() {
    switch (this.method) {
      case 'get':
        return this.getByKey(this.$_GET('request_key'), (response) => {
          if (!response.status) {
            return this.response({
              response: `Я еще не знаю, как ответить на это сообщение. Научи меня? Напиши мне: ${this.$_GET('request_key')}===а здесь как я должен был ответить на это`
            })
          }

          return this.response({
            response: response.response.response_value
          })
        });
      case 'add':
        return this.addByKey(this.$_GET('request_key'), this.$_GET('response_value'), '', 1, (response) => {
          if (!response.status) {
            return this.response({
              response: `Что-то пошло не так, попробуй еще раз...`
            })
          }

          return this.response({
            response: 'Спасибо, я запомнил.'
          })
        });
      case 'remove':
        return this.removeByKey(this.$_GET('request_key'), this.$_GET('response_value'), 1, (response) => {
          if (!response.status) {
            return this.response({
              response: `Что-то пошло не так, попробуй еще раз...`
            })
          }

          return this.response({
            response: 'Удалил.'
          })
        });
    }

    this.error('unknownError');
  }
}

module.exports = {Storage};