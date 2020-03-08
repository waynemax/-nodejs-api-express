require('events').EventEmitter.defaultMaxListeners = 100;
require(__dirname + '/services/mc.js');

const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config.json');
const app = express();
const db = require('./services/db');
const fs = require('fs');
const Fingerprint = require('express-fingerprint');
const routes = require(__dirname + '/routes').routes;
const {_err} = require(__dirname + '/services/functions');
const {ERRORS} = require(__dirname + '/services/errors');
const OK = 200;
const FAIL = 500;
const PATH_SEPARATOR = '/';
const ROUTE_SEPARATOR = '.';


app.use(Fingerprint({
  parameters:[
    Fingerprint.useragent,
    Fingerprint.acceptHeaders,
    Fingerprint.geoip
  ]
}));

app.disable('x-powered-by');

app.use((req, res, next) => {
  console.log(req.method + ' ' + req.url);
  next();
});

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//   extended: true
// }));

app.all(PATH_SEPARATOR, (req, res) => {
  res.status(200).end('OK');
});

const treatment = (req, res) => {
  if (routes.allVersions.indexOf(parseFloat(req.params.v)) < 0) {
    return res.status(OK).send(
      _err(ERRORS.VERSION_NOT_EXIST.code, ERRORS.VERSION_NOT_EXIST.message)
    );
  }

  if (req.params.methodName.indexOf(ROUTE_SEPARATOR) < 0) {
    res.status(FAIL).send(ERRORS.FAIL.code, ERRORS.FAIL.message);
  }

  const [module, method] = req.params.methodName.split(ROUTE_SEPARATOR);

  if (Object.keys(routes.modules).indexOf(module) < 0) {
    return res.status(OK).send(
      _err(ERRORS.MODULE_NOT_EXIST.code, ERRORS.MODULE_NOT_EXIST.message)
    );
  }

  const routesModule = routes.modules[module];

  if (Object.keys(routesModule.methods).indexOf(method) < 0) {
    return res.status(OK).send(
      _err(ERRORS.METHOD_NOT_EXIST.code, ERRORS.MODULE_NOT_EXIST.message)
    );
  }

  if (routesModule.versions.indexOf(parseFloat(req.params.v)) < 0) {
    return res.status(OK).send(
      _err(ERRORS.VERSION_NOT_EXIST.code, ERRORS.VERSION_NOT_EXIST.message)
    );
  }

  const PATH = __dirname + config.PATH_TO_METHODS + module + PATH_SEPARATOR;
  const moduleExist = fs.statSync(PATH + req.params.v);
  if (!moduleExist) {
    return res.status(OK).send(
      _err(ERRORS.VERSION_NOT_EXIST.code, ERRORS.VERSION_NOT_EXIST.message)
    );
  }

  const docParams = routesModule.methods[method].params;
  if (routesModule.methods[method].hasOwnProperty('only')) {
    if (routesModule.methods[method].only !== req.method) {
      return res.status(OK).send(
        _err(
          ERRORS.ONLY_METHOD.code,
          `Only ${routesModule.methods[method].only} requests are supported`
        )
      );
    }
  }


  const inParams = req.query;
  const have_auth = routesModule.methods[method].have_auth;
  let access_token = '';
  if (have_auth) {
    if (!(req.headers.hasOwnProperty('authorization') || inParams.hasOwnProperty('access_token'))) {
      return res.status(401).send(_err(
        ERRORS.NEED_AUTH.code,
        ERRORS.NEED_AUTH.message
      ));
    }

    if (req.headers.hasOwnProperty('authorization')) {
      access_token = req.headers.authorization.split(' ')[1];
      if (typeof access_token !== 'string') {
        return res.status(401).send(_err(
          ERRORS.PERMISSION_DENIED.code,
          ERRORS.PERMISSION_DENIED.message
        ));
      }
    } else if (inParams.hasOwnProperty('access_token')) {
      access_token = inParams.access_token;
    }

    if (access_token.length !== 64) {
      return res.status(401).send(_err(
        ERRORS.PERMISSION_DENIED.code,
        ERRORS.PERMISSION_DENIED.message
      ));
    }
  }


  for (let param in docParams) {
    // treatment required params //
    let oneOfStatus = false;
    if (docParams[param].required === true) {
      if (!docParams[param].hasOwnProperty('oneOf')) {
        if (!inParams.hasOwnProperty(param)) {
          return res.status(OK).send(
            _err(ERRORS.REQUIRED_PARAM_NOT_FOUND.code, 'Required param not found: ' + param)
          );
        }
      }
      if (docParams[param].hasOwnProperty('oneOf')) {
        if (typeof docParams[param].oneOf !== "object") {
          return res.status(FAIL).send(ERRORS.FAIL.code, ERRORS.FAIL.message);
        }
        docParams[param].oneOf.forEach(oneOfItem => {
          if (inParams.hasOwnProperty(oneOfItem)) oneOfStatus = true;
        });
        if (!inParams.hasOwnProperty(param) && !oneOfStatus) {
          return res.status(OK).send(
            _err(ERRORS.REQUIRED_PARAM_NOT_FOUND.code, 'Required param not found: [oneOf] ' + param + '...')
          );
        }
      }
    } else if (!inParams.hasOwnProperty(param)) { continue; }
    if (!inParams.hasOwnProperty(param) && oneOfStatus === true) { continue; }
    // end ..required //

    if (docParams[param].type === typeof 1) {
      if (isFinite(inParams[param])) {
        inParams[param] = Number(inParams[param]);
        if (docParams[param].hasOwnProperty('positive')) {
          if (docParams[param].positive === true) {
            if (inParams[param] < 0) {
              return res.status(OK).send(_err(
                ERRORS.IS_NOT_POSITIVE_NUMBER.code,
                ERRORS.IS_NOT_POSITIVE_NUMBER.message,
              ));
            }
          }
        }
      }
    }

    if (['stringArray', 'any'].indexOf(docParams[param].type) === -1 && docParams[param].type !== typeof inParams[param]) {
      return res.status(OK).send(_err(
        ERRORS.PARAM_WRONG_TYPE.code,
        `param ${param + '(' + typeof inParams[param]}) !== need type ${docParams[param].type} #3`
      ));
    }

    if (docParams[param].type === 'stringArray') {
      inParams[param] = safe_tags_replace(inParams[param]);
      const explode = inParams[param].split(',');
      if (explode.length > 99) return res.status(OK).send(_err(
        ERRORS.PARAM_WRONG_TYPE.code,
        ERRORS.PARAM_WRONG_TYPE.message + '#1',
      ));
      let fields = [];
      if (docParams[param].hasOwnProperty('fields')) {
        fields = docParams[param].fields;
      }
      explode.forEach((item, key) => {
        if (explode[key].length < 1) {
          return res.status(OK).send(_err(
            ERRORS.PARAM_WRONG_TYPE.code,
            ERRORS.PARAM_WRONG_TYPE.message + '#2',
          ));
        }
        if (fields.length > 0 && fields.indexOf(explode[key]) === -1) {
          return res.status(OK).send(_err(
            ERRORS.PARAM_PICK_OF_TEST_FAIL.code,
            `parameter failed selection test; pick of fields: ` + JSON.stringify(docParams[param].fields)
          ));
        }
      });

      inParams[param] = explode;
    }

    if (docParams[param].type === typeof 1 && docParams[param].hasOwnProperty('diapason')) {
      const diapason = docParams[param].diapason;
      if ((inParams[param] < diapason[0]) || (inParams[param] > diapason[1])) {
        return res.status(OK).send(_err(
          ERRORS.OUT_OF_DIAPASON.code,
          `param ${param} out of diapason`
        ));
      }
    }

    if (docParams[param].type === typeof '') {
      inParams[param] = safe_tags_replace(inParams[param]);
      if (docParams[param].hasOwnProperty('minLength')) {
        if (inParams[param].length < docParams[param].minLength) {
          return res.status(OK).send(_err(
            ERRORS.PARAM_TOO_SHORT.code,
            `param ${param} must be longer than ${docParams[param].minLength} characters`
          ));
        }
      }
      if (docParams[param].hasOwnProperty('maxLength')) {
        if (inParams[param].length > docParams[param].maxLength) {
          return res.status(OK).send(_err(
            ERRORS.PARAM_TOO_LONG.code,
            `param ${param} must be shorter than ${docParams[param].maxLength} characters`
          ));
        }
      }
      if (docParams[param].hasOwnProperty('wcrypted')) {
        if (inParams.hasOwnProperty(param)) {
          const {wcrypt_decode} = require('./services/wcrypt');
          inParams[param] = wcrypt_decode(inParams[param]);
        }
      }
      if (docParams[param].hasOwnProperty('test')) {
        if (!docParams[param].test.test(inParams[param])) {
          return res.status(OK).send(_err(
            ERRORS.REG_EXP_ERROR.code,
            `param ${param} failed test`
          ));
        }
      }

      if (docParams[param].hasOwnProperty('md5')) {
        if (inParams.hasOwnProperty(param)) {
          if (inParams[param].length !== 32) {
            return res.status(OK).send(_err(
              ERRORS.NOT_MD5.code,
              ERRORS.NOT_MD5.message + ' param: '  + param
            ));
          }
        }
      }
    }

    if (docParams[param].hasOwnProperty('pickOf')) {
      if (inParams.hasOwnProperty(param)) {
        if (typeof inParams[param] === 'string') {
          if (isFinite(inParams[param])) {
            inParams[param] = Number(inParams[param]);
          }
        }
        if (docParams[param].type !== 'stringArray' && docParams[param].pickOf.indexOf(inParams[param]) < 0) {
          return res.status(OK).send(_err(
            ERRORS.PARAM_PICK_OF_TEST_FAIL.code,
            `parameter failed selection test; pick of: ` + JSON.stringify(docParams[param].pickOf)
          ));
        }
      }
    }
  }

  const Module = require(PATH + PATH_SEPARATOR + (req.params.v) + PATH_SEPARATOR + module)[
    module[0].toUpperCase() + module.slice(1)
  ];

  let middleware = {};
  if (access_token !== '') {
    if (routesModule.methods[method].hasOwnProperty('middleware')) {
      routesModule.methods[method].middleware.push('auth/1.1');
    } else {
      routesModule.methods[method]['middleware'] = ['auth/1.1'];
    }
  }
  if (routesModule.methods[method].hasOwnProperty('middleware')) {
    const mdw = routesModule.methods[method].middleware;
    if (typeof mdw === typeof []) {
      mdw.forEach(item => {
        item = item.split(PATH_SEPARATOR);
        const mdwCheck = getMiddlewareItem(item[0], item[1]);
        if (!mdwCheck.status) {
          return res.status(FAIL).send(_err(
            ERRORS.MIDDLEWARE_ERROR.code,
            ERRORS.MIDDLEWARE_ERROR.message
          ));
        }
        middleware[item[0][0].toUpperCase() + item[0].slice(1)] = mdwCheck.response;
      });
    }
  }

  return new Module(
    {req, res, db, middleware, method, route: routesModule.methods[method]}
  ).execute();
};

const getMiddlewareItem = (module, ver) => {
  if (Object.keys(routes.modules).indexOf(module) < 0) {
    return { status: false };
  }
  if (routes.modules[module].versions.indexOf(parseFloat(ver)) < 0) {
    return { status: false };
  }
  const PATH = __dirname + config.PATH_TO_METHODS + module + PATH_SEPARATOR + ver;
  try {
    if (!fs.statSync(PATH)) {
      return {
        status: false
      }
    }
  } catch(e) {
    return {
      status: false
    }
  }
  return {
    status: true,
    response: require(PATH + PATH_SEPARATOR + module)[
      module[0].toUpperCase() + module.slice(1)
    ]
  }
};

app.route('/api/:v/:methodName?').all(treatment);

app.route('/schema').get((req, res) => {
  res.send(routes);
});

process.on('uncaughtException', function (e) {
  console.error('uncaughtException', e);
});

const tagsToReplace = {'&': '&amp;', '<': '&lt;', '>': '&gt;'};

function replaceTag(tag) {
  return tagsToReplace[tag] || tag;
}

function safe_tags_replace(str) {
  return str.replace(/[&<>]/g, replaceTag);
}

const server = app.listen(config.serverPort, () => {
  console.log('listening on port ' + config.serverPort)
});