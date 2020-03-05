class Auth extends (require('../../BaseMethod').BaseMethod) {
  constructor(props) {
    super(props);
  }

  execute() {
    const authStorage = this.storage(this);
    switch (this.method) {
      // регистрация
      case 'sign_up':
        return authStorage.sign_up({
          ...this.$_GET()
        }, response => {
          if (!response.status) return this.error(
            'unknownError'
          );

          return this.response(response)
        });
      // авторизация
      case 'get':
        switch (this.$_GET('type')) {
          case 'remote_login':
            return authStorage.get({
              ...this.$_GET()
            }, response => {
              if (!response.status) {
                return this.error('unknownError');
              }

              return this.response(response)
            });
          default:
            this.error('reasonError', 'this auth type not supported');
            break;
        }
        break;
      // обновление токена
      case 'refresh':
        return authStorage.refresh({
          ...this.$_GET()
        }, response => {
          return this.response(response)
        });
      // проверка токена
      case 'relevance':
        return authStorage.relevance({
          ...this.$_GET()
        }, response => {
          return this.response(response)
        });
      // удаление токена
      case 'remove':
        return authStorage.remove({
          ...this.$_GET()
        }, response => {
          return this.response(response)
        });
      // удаление всех токенов пользователя
      case 'removeAll':
        return authStorage.removeAll({
          ...this.$_GET()
        }, response => {
          return this.response(response)
        });
    }

    this.error('unknownError');
  }

  storage(_this) {
    const ERRORS = require('../../../../../services/errors').ERRORS;
    const CONFIG = require('../../../../../config.json');

    return {
      /* Получение или замена рабочего токена */
      getValidToken: (params = {client_id: 0, owner_id: 0}, callback) => {
        this.storage(_this).getLastToken(params, getLastTokenResponse => {
          if (!getLastTokenResponse.status) {
            this.storage(_this).addToken(params, addTokenResponse => {
              if (!addTokenResponse.status) return this.error(
                ERRORS.UNKNOWN.code,
                ERRORS.UNKNOWN.message + 'SQL: Add token error'
              );
              return callback(addTokenResponse);
            });
          } else {
            return callback(getLastTokenResponse);
          }
        });
      },
      /* Получение последнего рабочего токена */
      getLastToken: (params = {client_id: 0, owner_id: 0}, callback) => {
        const ua_source = _this.req.headers['user-agent'],
          ip = _this.req.headers['x-forwarded-for'] || _this.req.connection.remoteAddress,
          expires_in = CONFIG.token_valid / 5,
          nowTime = (Math.round((+new Date())/1000));
        _this.query("select * from tokens where ip = ? && finger_hash = ? && client_id = ? && owner_id = ? && valid_until_time > ? order by valid_until_time desc limit 0,1;", [
            ip, _this.req.fingerprint.hash, params.client_id, params.owner_id, (nowTime + expires_in)
        ], (getLastTokenError, getLastTokenResponse) => {
          if (getLastTokenError) return this.error(
            ERRORS.UNKNOWN.code,
            ERRORS.UNKNOWN.message + 'SQL: get last token error'
          );

          if (getLastTokenResponse.rows.length < 1) {
            return callback({
              status: false
            });
          }

          const {
            access_token, refresh_token,
            valid_until_time, owner_id
          } = getLastTokenResponse.rows[0];

          return callback({
            status: true,
            response: {
              access_token,
              refresh_token,
              valid_until_time,
              owner_id,
            }
          });
        });
      },
      /* Проверка токена на валидность */
      relevance: (params = {access_token: '',}, callback) => {
        const ip = _this.req.headers['x-forwarded-for'] || _this.req.connection.remoteAddress,
          valid_until_time = (Math.round((+new Date())/1000)) + (CONFIG.token_valid / 5);
        _this.query("select * from tokens where ip = ? && finger_hash = ? && access_token = ? && valid_until_time > ? order by valid_until_time desc limit 0,1;", [
            ip, _this.req.fingerprint.hash, params.access_token, valid_until_time
        ], (relevanceTokenError, relevanceTokenResponse) => {
          if (relevanceTokenError) return this.error(
            ERRORS.UNKNOWN.code,
            ERRORS.UNKNOWN.message + 'SQL: relevance token error'
          );

          if (relevanceTokenResponse.rows.length < 1) {
            return callback({
              status: false
            });
          }

          const {
            access_token, refresh_token,
            valid_until_time, owner_id
          } = relevanceTokenResponse.rows[0];

          return callback({
            status: true,
            response: {
              access_token,
              refresh_token,
              valid_until_time,
              owner_id,
            }
          });
        });
      },
      removeAll: (params = {access_token: ''}, callback) => {
        const ip = _this.req.headers['x-forwarded-for'] || _this.req.connection.remoteAddress;
        const relevance = this.storage(_this).relevance(params, relevanceResponse => {
          if (!relevanceResponse.status) return this.error(
            ERRORS.PERMISSION_DENIED.code,
            ERRORS.PERMISSION_DENIED.message
          );

          const owner_id = relevanceResponse.response.owner_id;
          _this.query("delete from tokens where ip = ? && finger_hash = ? && owner_id = ?;", [
            ip, _this.req.fingerprint.hash, owner_id
          ], (removeAllTokensError, removeAllTokensResponse) => {
            if (removeAllTokensError) return this.error(
              ERRORS.UNKNOWN.code,
              ERRORS.UNKNOWN.message + 'SQL: remove token error'
            );

            return callback({
              status: true
            });
          });
        });
      },
      /* Удалить токен */
      remove: (params = {access_token: ''}, callback) => {
        const ip = _this.req.headers['x-forwarded-for'] || _this.req.connection.remoteAddress;
        _this.query("delete from tokens where ip = ? && finger_hash = ? && access_token = ?;", [
            ip, _this.req.fingerprint.hash, params.access_token
        ], (removeTokenError, removeTokenResponse) => {
          if (removeTokenError) return this.error(
            ERRORS.UNKNOWN.code,
            ERRORS.UNKNOWN.message + 'SQL: remove token error'
          );

          return callback({
            status: true
          });
        });
      },
      /* Обновление токена */
      refresh: (params = {access_token: '', refresh_token: ''}, callback) => {
        const ip = _this.req.headers['x-forwarded-for'] || _this.req.connection.remoteAddress;
        const {rand} = require('../../../../../services/functions');
        const new_access_token = rand(64, ["a", "f"], ["A", "Z"], ["0", "9"]),
          new_refresh_token = rand(64, ["a", "f"], ["A", "Z"], ["0", "9"]),
          valid_until_time = (Math.round((+new Date())/1000)) + (CONFIG.token_valid || 300);

        _this.query("UPDATE `tokens` SET `access_token` = ?, `refresh_token` = ?, `valid_until_time` = ? WHERE `ip` = ? && `finger_hash` = ? && `access_token` = ? && `refresh_token` = ?;", [
          new_access_token, new_refresh_token, valid_until_time, ip, _this.req.fingerprint.hash, params.access_token, params.refresh_token
        ], (refreshTokenError, refreshTokenResponse) => {
          if (refreshTokenError) return this.error(
            ERRORS.UNKNOWN.code,
            ERRORS.UNKNOWN.message + 'SQL: Refresh token error'
          );

          if (refreshTokenResponse.rows.affectedRows < 1) {
            return callback({
              status: false
            });
          }

          return callback({
            status: true,
            response: {
              access_token: new_access_token,
              refresh_token: new_refresh_token,
              valid_until_time
            }
          });
        });
      },
      /* Добавление нового токена */
      addToken: (params = {client_id: 0, owner_id: 0}, callback) => {
        /*  const useragent = require('express-useragent');
            const ua = useragent.parse(ua_source); */
        const ua_source = _this.req.headers['user-agent'];
        const ip = _this.req.headers['x-forwarded-for'] || _this.req.connection.remoteAddress;
        const {rand} = require('../../../../../services/functions');
        const new_access_token = rand(64, ["a", "f"], ["A", "Z"], ["0", "9"]),
          new_refresh_token = rand(64, ["a", "f"], ["A", "Z"], ["0", "9"]),
          expires_in = CONFIG.token_valid,
          reg_time = (Math.round((+new Date())/1000)),
          owner_id = params.owner_id;
        const valid_until_time = reg_time + (expires_in || 300);
        _this.query("INSERT INTO `tokens` (`id`, `client_id`, `valid_until_time`, `access_token`, `refresh_token`, `ip`, `ua`, `owner_id`, `finger_hash`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?);", [
          params.client_id, valid_until_time, new_access_token, new_refresh_token, ip, ua_source, owner_id, _this.req.fingerprint.hash
        ], (addTokenError, addTokenResponse) => {
          if (addTokenError) return this.error(
            ERRORS.UNKNOWN.code,
            ERRORS.UNKNOWN.message + 'SQL: Add token error'
          );

          return callback({
            status: true,
            response: {
              access_token: new_access_token,
              refresh_token: new_refresh_token,
              valid_until_time,
              owner_id
            }
          });
        });
      },
      /* Авторизация */
      get: (params, callback) => {
        const login = params.login.toLowerCase();

        this.storage(_this).checkAppClient({id: params.client_id, secret_key: params.client_secret}, checkAppClient_response => {
          if (!checkAppClient_response.status) return this.error(
            ERRORS.API_CONNECT_ERROR.code,
            ERRORS.API_CONNECT_ERROR.message
          );

          _this.query("select id, password, salt from users where login = ?", [login], (checkLoginError, checkLoginResponse) => {
            if (checkLoginError) return this.error(
              ERRORS.UNKNOWN.code,
              ERRORS.UNKNOWN.message + 'SQL: Check login'
            );

            if (checkLoginResponse.rows.length < 1) return this.error(
              ERRORS.PERMISSION_DENIED.code,
              ERRORS.PERMISSION_DENIED.message
            );

            const md5 = require('md5');
            const {id, salt, password} = checkLoginResponse.rows[0];
            const inDataPassword = md5(params.password + salt);

            if (inDataPassword !== password) return this.error(
              ERRORS.PERMISSION_DENIED.code,
              ERRORS.PERMISSION_DENIED.message
            );

            return this.storage(_this).getValidToken({
              owner_id: id,
              client_id: params.client_id
            }, getValidTokenResponse => {
              return callback(getValidTokenResponse);
            });
          });
        });
      },
      /* Регистрация */
      sign_up: (params, callback) => {
        const {rand} = require('../../../../../services/functions');
        const md5 = require('md5');

        const first_name = params.first_name ? params.first_name[0].toUpperCase() + params.first_name.slice(1) : 'Name',
          last_name = params.last_name ? params.last_name[0].toUpperCase() + params.last_name.slice(1) : 'Lastname',
          gender = params.gender || 0,
          patronymic = params.patronymic || '',
          salt = rand(6, ["A", "F"], ["0", "9"]),
          login = params.login.toLowerCase();

        if (isFinite(login[0])) return this.error(
          ERRORS.REG_EXP_ERROR.code,
          ERRORS.REG_EXP_ERROR.message + '\n' +
          'the first character cannot be a number (field: `login)'
        );

        const password = md5(params.password + salt);

        _this.query("select id from users where login = ?", [login], (checkLoginError, checkLoginResponse) => {
          if (checkLoginError) return this.error(
            ERRORS.UNKNOWN.code,
            ERRORS.UNKNOWN.message + 'SQL: Check login'
          );

          if (checkLoginResponse.rows.length > 0) return this.error(
            ERRORS.SAME_LOGIN.code,
            ERRORS.SAME_LOGIN.message
          );

          this.storage(_this).checkAppClient({id: params.client_id, secret_key: params.client_secret}, checkAppClient_response => {
            if (!checkAppClient_response.status) return this.error(
              ERRORS.API_CONNECT_ERROR.code,
              ERRORS.API_CONNECT_ERROR.message
            );

            _this.query("INSERT INTO `users` (`id`, `first_name`, `last_name`, `patronymic`, `login`, `phone`, `email`, `password`, `salt`, `hash`, `deactivated`, `last_seen`, `timezone`, `verified`, `balance`, `reg_date`, `full_name`, `photo`, `gender`) VALUES (NULL, ?, ?, ?, ?, '', '', ?, ?, ?, '0', '"+(Math.round((+new Date())/1000))+"', '0', '0', '0', '"+(Math.round((+new Date())/1000))+"', ?, '', ?);", [
              first_name, last_name, patronymic, login, password, salt, rand(6, ["A", "F"], ["0", "9"]), `${first_name + ' ' + last_name}`, gender,
            ], (q_error, q_response) => {
              if (q_error) return callback({
                status: false
              });

              return this.storage(_this).addToken({
                owner_id: q_response.rows.insertId,
                client_id: params.client_id
              }, addTokenResponse => {
                return callback(addTokenResponse);
              });
            });

          });
        });
      },
      /* Проверка достоверности клиента api */
      checkAppClient: (params = {id: 0, secret_key: ''}, callback) => {
        _this.query("select deactivated, secret_key from apps_clients where id = ?", [params.id],
          (q_client_err, q_client_response) => {
            if (q_client_err || !q_client_response) return callback({
              status: false,
            });

            if (q_client_response.rows.length < 1) return callback({
              status: false,
            });

            if (q_client_response.rows[0].deactivated !== 0) return callback({
              status: false,
            });

            if (q_client_response.rows[0].secret_key !== params.secret_key) return callback({
              status: false,
            });

            return callback({
              status: true,
            });
          });
      }
    }
  };
}

module.exports = {Auth};