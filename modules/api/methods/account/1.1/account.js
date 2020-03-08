class Account extends (require('../../BaseMethod').BaseMethod) {
  constructor(props) {
    super(props);
  }

  execute() {
    const accountStorage = this.storage(this);
    switch (this.method) {
      case 'setOnline':
        return this.getAuth(({owner_id, access_token}) => {
          return accountStorage.setOnline({
            owner_id
          }, response => {
            return this.response(response)
          });
        });
      case 'setProfileIsClosed':
        return this.getAuth(({owner_id}) => {
          const {status} = this.$_GET();
          return accountStorage.setProfileIsClosed({
            status,
            owner_id
          }, response => {
            return this.response(response)
          });
        });
      case 'changePassword':
        return this.getAuth(({owner_id, access_token}) => {
          const {secret_phrase, new_password} = this.$_GET();
          return accountStorage.changePassword({
            secret_phrase,
            new_password,
            access_token,
            owner_id
          }, response => {
            return this.response(response)
          });
        });
    }

    this.error('unknownError');
  }

  storage(_this) {
    const ERRORS = require('../../../../../services/errors').ERRORS;
    const CONFIG = require('../../../../../config.json');

    return {
      setOnline: (params = {owner_id}, callback) => {
        const ts = Math.round((+new Date())/1000);
        _this.query("UPDATE `users` SET `last_seen` = ? WHERE `id` = ?;", [
          ts, params.owner_id], (queryError, response) => {
          const responseObjectType = {
            status: true,
            last_seen: ts
          };

          if (queryError) return this.error(
            ERRORS.UNKNOWN.code,
            ERRORS.UNKNOWN.message + 'SQL: error setOnline #4245'
          );

          return callback(responseObjectType)
        });
      },
      setProfileIsClosed: (params = {owner_id, status}, callback) => {
        _this.query("UPDATE `users` SET `is_closed` = ? WHERE `id` = ?;", [
          params.status, params.owner_id], (queryError, response) => {
          const responseObjectType = {
            status: true,
            is_closed: params.status
          };

          if (queryError) return this.error(
            ERRORS.UNKNOWN.code,
            ERRORS.UNKNOWN.message + 'SQL: error setProfileIsClosed #4921'
          );

          return callback(responseObjectType)
        });
      },
      checkSecretPhrase: (params = {owner_id, secret_phrase}, callback) => {
        const AccountCheckSecretPhraseQuery = this.db.selectObject(['secret_phrase'], ['users'], '', false);
          AccountCheckSecretPhraseQuery.where.push("`id` = ? && `secret_phrase` = ?");

        const queryParams = [];
          queryParams.push(params.owner_id);
          queryParams.push(params.secret_phrase);

        _this.query(this.db.selectString(AccountCheckSecretPhraseQuery), queryParams, (queryError, response) => {
          const responseObjectType = {
            status: false
          };

          if (queryError) return this.error(
            ERRORS.UNKNOWN.code,
            ERRORS.UNKNOWN.message + 'SQL: error #4235'
          );

          if (response.rows.length > 0) {
            responseObjectType.status = true;
          }

          return callback(responseObjectType)
        });
      },
      changePassword: (params, callback) => {
        this.storage(_this).checkSecretPhrase(params, response => {
          if (response.status !== true) {
            return this.error(
              ERRORS.PERMISSION_DENIED.code,
              ERRORS.PERMISSION_DENIED.message + 'unknown data'
            );
          }

          const {rand} = require('../../../../../services/functions');
          const md5 = require('md5');
          const new_salt = rand(6, ["A", "F"], ["0", "9"]);
          const new_password = md5(params.new_password + new_salt);

          const queryParams = [];
            queryParams.push(new_password);
            queryParams.push(new_salt);
            queryParams.push(params.owner_id);

          _this.query("UPDATE `users` SET `password` = ?, `salt` = ? where `id` = ?;",
            queryParams, (queryError, response) => {
              if (queryError) return this.error(
                ERRORS.UNKNOWN.code,
                ERRORS.UNKNOWN.message + 'SQL: error #4236'
              );

              if (response.rows.changedRows < 1) {
                return this.error(
                  ERRORS.UNKNOWN.code,
                  ERRORS.UNKNOWN.message + 'SQL: error #4236'
                );
              }

              let AuthController = _this.middleware.Auth;
              AuthController = new AuthController({..._this.getDefaultProps()});
              const access_token = params.access_token;
              AuthController.storage(AuthController).removeAll({access_token, exclusion: true}, authResponse => {
                if (!authResponse.status) return this.error(
                  ERRORS.UNKNOWN.code,
                  ERRORS.UNKNOWN.message,
                );

                return callback({
                  status: true
                })
              });
          });
        })
      }
    }
  };
}

module.exports = {Account};