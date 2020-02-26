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
  middleware: string[],
}

interface IParam {
  type: 'string' | 'any' | 'number',
  required: boolean,
  oneOf?: string[],
  minLength?: number,
  maxLength?: number,
  diapason?: undefined | [number, number],
  test?: any
}

interface IParams {
  [key: string]: IParam,
}

module.exports = { routes: <IRoutes> {
  allVersions: [1.1, 1.2],
  modules: <IModules> {
    questions: <IModule> {
      versions: [1.1],
      methods: {
        add: <IMethod> {
          description: undefined,
          have_auth: false,
          middleware: [
            'auth/1.1'
          ],
          params: <IParams> {
            text: {
              type: 'string',
              required: true,
              oneOf: ['from_id', 'else'],
              minLength: 6,
              maxLength: 50,
            },
            from_id: {
              type: 'number',
              required: true,
              oneOf: ['text', 'else'],
              diapason: [2, 80]
            },
            else: {
              type: 'number',
              required: false,
            }
          }
        }
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
            }
          }
        },
      }
    }
  }
}};