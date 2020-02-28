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
  type: 'string' | 'any' | 'number',
  required: boolean,
  oneOf?: string[],
  minLength?: number,
  maxLength?: number,
  diapason?: undefined | [number, number],
  test?: any,
  pickOf?: string[] | number[]
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
            },
          }
        },
        get: <IMethod> {
          description: undefined,
          have_auth: false,
          middleware: [],
          params: <IParams> {
            request_key: {
              type: 'string',
              required: true,
              minLength: 1,
            },
            client_id: {
              type: 'number',
              required: false,
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
            },
          }
        },
      }
    },
    auth: <IModule> {
      versions: [1.1],
      methods: {
        get: <IMethod> {
          description: undefined,
          have_auth: false,
          middleware: [],
          params: <IParams> {
            login: {
              type: 'string',
              required: true,
              test: /^[a-zA-Z0-9]{3,15}$/,
              oneOf: ['login', 'phone', 'email']
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
            }
          }
        },
        sign_up: <IMethod> {
          description: undefined,
          have_auth: false,
          middleware: [],
          params: <IParams> {
            first_name: {
              type: 'string',
              required: true,
              test: /^[а-яеА-Яa-z 0-9]+$/iu,
            },
            gender: {
              type: 'string',
              required: true,
              pickOf: ['man', 'female', 2]
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