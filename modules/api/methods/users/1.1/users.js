class Users extends (require('../../BaseMethod').BaseMethod) {
  constructor(props) {
    super(props);
  }

  execute() {
    const usersStorage = this.storage(this);
    switch (this.method) {
      case 'get':
        return this.getAuth(({owner_id}) => {
          return usersStorage.get({
            ...this.$_GET(),
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
      /* Получение пользовательской информации */
      get: (params, callback) => {
        const get_fields = params.fields;

        get_fields.unshift('last_name');
        get_fields.unshift('first_name');
        get_fields.unshift('id');

        const queryParams = [];
        const Users_getQuery = this.db.selectObject(['count(id)'], ['users'], '', false);

        let search = "";
        if (!params.hasOwnProperty('user_ids')) {
          if (params.hasOwnProperty('query')) {
            search = "((LOWER(full_name) like LOWER(?) || LOWER(Concat(last_name,?, first_name)) like LOWER(?)))";
            queryParams.push('%' + params.query + '%');
            queryParams.push(' ');
            queryParams.push('%' + params.query + '%');
          }
        } else {
          search = "id IN(?)";
          const user_ids = params.user_ids.map(item => {
            if (Math.sign(item) === 1) {
              return parseInt(item);
            } else {
              return 0
            }
          });
          queryParams.push(user_ids);
        }

        Users_getQuery.where.push(search);

        if (params.hasOwnProperty('online')) {
          if (params.online === 1) {
            Users_getQuery.where.push("&& last_seen > "+ ((Math.round((+new Date())/1000)) - parseInt(CONFIG.onlineTime)));
          }
        }

        _this.query(this.db.selectString(Users_getQuery), queryParams, (howManyUsersQueryError, howManyUsersQueryResponse) => {
          const responseObjectType = {
            countAll: 0,
            hasNext: {},
            rows: [],
          };

          if (howManyUsersQueryError) return this.error(
            ERRORS.UNKNOWN.code,
            ERRORS.UNKNOWN.message + 'SQL: Get user count error'
          );

          responseObjectType.countAll = howManyUsersQueryResponse.rows[0]['count(id)'];
          responseObjectType.hasNext = this.hasNextTreatment(responseObjectType.countAll, params);

          if (responseObjectType.countAll < 1) {
            return callback(responseObjectType);
          }

          Users_getQuery.fields = get_fields;
          Users_getQuery.limit = true;

          queryParams.push(responseObjectType.hasNext.cursor);
          queryParams.push(responseObjectType.hasNext.count);

          _this.query(this.db.selectString(Users_getQuery), queryParams, (getUserError, getUserResponse) => {
            if (getUserError) return this.error(
              ERRORS.UNKNOWN.code,
              ERRORS.UNKNOWN.message + 'SQL: Get user error'
            );

            if (
              params.hasOwnProperty('name_case')
            ) {
              const gcases = {
                'nom': 'gcaseNom', 'gen': 'gcaseGen',
                'dat': 'gcaseDat', 'acc': 'gcaseAcc',
                'ins': 'gcaseIns', 'abl': 'gcasePred'
              };
              getUserResponse.rows = getUserResponse.rows.map(user => {
                if (params.hasOwnProperty('name_case')) {
                  const {gCaseName} = require('../../../../../services/name');
                  let rn = new gCaseName(user.last_name, user.first_name, '');
                  user.last_name = rn.lastName(rn[gcases[params.name_case]]);
                  user.first_name = rn.firstName(rn[gcases[params.name_case]]);
                  if (user.hasOwnProperty('full_name')) {
                    user.full_name = rn.fullName(rn[gcases[params.name_case]]);
                  }
                }
                if (get_fields.indexOf('last_seen') > -1) {
                  user.online = (parseInt(user.last_seen) + parseInt(CONFIG.onlineTime)) > (Math.round((+new Date())/1000));
                }
                return user;
              });
            }

            responseObjectType.rows = getUserResponse.rows;
            return callback(responseObjectType);
          });
        });
      }
    }
  };
}

module.exports = {Users};