interface IRoutes {
  allVersions: number[],
  modules: IModules
}

interface IModules {
  [key: string]: IModule,
}

interface IModule {
  versions: number[],
  methods: {
    [key: string]: IMethod,
  }
}

interface IMethod {
  description: string | undefined,
  params: IParams,
  have_auth: boolean,
  only?: 'GET' | 'POST',
  middleware: string[],
}

type pickOf = any[];

interface IParam {
  type: 'string' | 'any' | 'number' | 'stringArray',
  required: boolean,
  oneOf?: string[],
  minLength?: number,
  maxLength?: number,
  diapason?: undefined | [number, number],
  test?: any,
  pickOf?: string[] | number[],
  wcrypted?: boolean,
  md5?: boolean,
  fields?: string[],
  positive?: boolean
}

interface IParams {
  [key: string]: IParam
}

module.exports = { routes: <IRoutes> {
  allVersions: [1.1, 1.2],
  modules: <IModules> {
    storage: <IModule> {
      versions: [1.1],
      methods: {
        add: <IMethod> {
          description: undefined,
          have_auth: false,
          middleware: [],
          params: <IParams> {
            request_key: {
              type: 'string',
              required: true,
              minLength: 1,
            },
            response_value: {
              type: 'string',
              required: true,
            },
            client_id: {
              type: 'number',
              required: false,
              positive: true,
            },
          }
        },
        get: <IMethod> {
          description: undefined,
          have_auth: false,
          middleware: [],
          params: <IParams> {
            request_key: {
              type: 'stringArray',
              required: true,
              minLength: 1,
            },
            client_id: {
              type: 'number',
              required: false,
              positive: true,
            },
          }
        },
        remove: <IMethod> {
          description: undefined,
          have_auth: false,
          middleware: [],
          params: <IParams> {
            request_key: {
              type: 'string',
              required: true,
            },
            response_value: {
              type: 'string',
              required: true,
            },
            client_id: {
              type: 'number',
              required: false,
              positive: true,
            },
          }
        },
      }
    },
    users: <IModule> {
      versions: [1.1],
      methods: {
        get: <IMethod> {
          description: undefined,
          have_auth: true,
          middleware: [],
          params: <IParams> {
            user_ids: {
              type: 'stringArray',
              required: true,
              oneOf: ['query', 'user_ids'],
            },
            query: {
              type: 'string',
              required: true,
              oneOf: ['query', 'user_ids'],
            },
            name_case: {
              type: 'string',
              required: false,
              pickOf: ['nom', 'gen', 'dat', 'acc', 'ins', 'abl']
            },
            online: {
              type: 'number',
              required: false,
              diapason: [0, 1]
            },
            fields: {
              type: 'stringArray',
              required: true,
              fields: ['first_name', 'last_name', 'patronymic', 'deactivated', 'last_seen', 'verified', 'full_name', 'photo', 'gender'],
            },
            cursor: {
              type: 'number',
              required: false,
              positive: true,
            },
            count: {
              type: 'number',
              required: false,
              positive: true,
              diapason: [1, 100]
            }
          }
        },
      }
    },
    account: <IModule> {
      versions: [1.1],
      methods: {
        setOnline: <IMethod> {
          description: undefined,
          have_auth: true,
          middleware: [],
          params: <IParams> {}
        },
        setProfileIsClosed: <IMethod> {
          description: undefined,
          have_auth: true,
          middleware: [],
          params: <IParams> {
            status: {
              type: 'number',
              required: true,
              diapason: [0, 1]
            },
          }
        },
        changePassword: <IMethod> {
          description: undefined,
          have_auth: true,
          middleware: [],
          params: <IParams> {
            new_password: {
              type: 'string',
              required: true,
              wcrypted: true,
              md5: true,
            },
            secret_phrase: {
              type: 'string',
              required: true,
              wcrypted: true,
              md5: true,
              minLength: 2
            },
          }
        }
      }
    },
    auth: <IModule> {
      versions: [1.1],
      methods: {
        sign_up: <IMethod> {
          description: undefined,
          have_auth: false,
          middleware: [],
          params: <IParams> {
            client_id: {
              type: 'number',
              required: true,
              positive: true,
            },
            client_secret: {
              type: 'string',
              required: true,
              wcrypted: true
            },
            first_name: {
              type: 'string',
              required: false,
              test: /^[а-яеА-Яa-z 0-9]+$/iu,
            },
            last_name: {
              type: 'string',
              required: false,
              test: /^[а-яеА-Яa-z 0-9]+$/iu,
            },
            login: {
              type: 'string',
              required: true,
              test: /^[a-zA-Z0-9]{3,25}$/,
              oneOf: ['login', 'phone', 'email'],
              maxLength: 25,
              minLength: 3
            },
            phone: {
              type: 'string',
              required: true,
              test: /^\d+$/,
              oneOf: ['login', 'phone', 'email'],
              minLength: 6,
            },
            email: {
              type: 'string',
              required: true,
              test: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              oneOf: ['login', 'phone', 'email']
            },
            password: {
              type: 'string',
              required: true,
              wcrypted: true,
              md5: true,
            },
            secret_phrase: {
              type: 'string',
              required: true,
              wcrypted: true,
              md5: true,
              minLength: 2
            },
            gender: {
              type: 'number',
              required: false,
              diapason: [0, 2],
            },
            patronymic: {
              type: 'string',
              required: false
            }
          }
        },
        get: <IMethod> {
          description: undefined,
          have_auth: false,
          middleware: [],
          params: <IParams> {
            login: {
              type: 'string',
              required: true,
              test: /^[a-zA-Z0-9]{3,25}$/,
              oneOf: ['login'],//['login', 'phone', 'email'],
              maxLength: 25,
              minLength: 3
            },
            phone: {
              type: 'string',
              required: true,
              test: /^\d+$/,
              oneOf: ['login'], //['login', 'phone', 'email'],
              minLength: 6,
            },
            email: {
              type: 'string',
              required: true,
              test: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              oneOf: ['login'] //['login', 'phone', 'email'],
            },
            client_secret: {
              type: 'string',
              required: true,
              wcrypted: true
            },
            type: {
              type: 'string',
              required: true,
              pickOf: ['remote_login'],
            },
            password: {
              type: 'string',
              required: true,
              wcrypted: true,
              md5: true,
            },
          }
        },
        relevance: <IMethod> {
          description: undefined,
          have_auth: false,
          middleware: [],
          params: <IParams> {
            access_token: {
              type: 'string',
              required: true,
            }
          }
        },
        refresh: <IMethod> {
          description: undefined,
          have_auth: false,
          middleware: [],
          params: <IParams> {
            access_token: {
              type: 'string',
              required: true,
            },
            refresh_token: {
              type: 'string',
              required: true,
            }
          }
        },
        remove: <IMethod> {
          description: undefined,
          have_auth: false,
          middleware: [],
          params: <IParams> {
            access_token: {
              type: 'string',
              required: true,
            }
          }
        },
        removeAll: <IMethod> {
          description: undefined,
          have_auth: false,
          middleware: [],
          params: <IParams> {
            access_token: {
              type: 'string',
              required: true,
            }
          }
        },
      }
    },
    callback: <IModule> {
      versions: [1.1],
      methods: {
        aibot: <IMethod> {
          description: undefined,
          have_auth: false,
          middleware: ['storage/1.1'],
          only: 'POST',
          params: <IParams> {}
        },
      }
    }
  }
}};