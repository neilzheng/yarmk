const Router = require('koa-route');
const Compose = require('koa-compose');

function mergeUrls(impUrls, expUrls) {
  if (!impUrls) return expUrls;
  if (!expUrls) return impUrls;

  const result = [...impUrls];
  for (let i = 0; i < expUrls.length; i++) {
    let j;
    for (j = 0; j < result.length; j++) {
      if (result[j].path === expUrls[i].path) {
        result[j].handlers = { ...result[j].handlers, ...expUrls[i].handlers };
        break;
      }
    }
    if (j === result.length) result.push(expUrls[i]);
  }

  return result;
}

function buildOptions(optsIn) {
  const result = JSON.parse(JSON.stringify(optsIn));
  result.controller = optsIn.controller;

  if (!result || typeof result !== 'object') {
    throw new TypeError('options must be an object');
  }
  if (!result.controller ||
    typeof result.controller !== 'object') {
    throw new TypeError('controller must be set as js object');
  }
  if (!result.urls && !result.path) throw new TypeError('path needed if urls not present');
  if ((result.path && (typeof result.path !== 'string')) ||
    (result.index && typeof result.index !== 'string')) {
    throw new TypeError('path must be a string & index must be string');
  }
  if (result.urls && (!Array.isArray(result.urls) || result.urls.length === 0)) {
    throw new TypeError('urls must be a non-empty array');
  }
  if (result.urls) {
    result.urls.forEach((data) => {
      if (!data.path || typeof data.path !== 'string' ||
        typeof data.handlers !== 'object') {
        throw new TypeError('path must be a string, handlers must be methods keyed object');
      } else if (data.path.endsWith('/')) {
        throw new TypeError('path should not ends with /');
      }
    });
  }

  const impUrls = [];

  if (result.path) {
    if (!result.index) result.index = ':id([\\w\\-\\_]+)';
    const paths = [`${result.path}/${result.index}`, `${result.path}/${result.index}/:action([\\w\\-\\_]+)`, `${result.path}`, `${result.path}/:action([\\w\\-\\_]+)`];
    const url1 = {
      path: paths[0],
      handlers: {
        GET: 'fetch',
        PATCH: 'update',
        DELETE: 'remove'
      }
    };
    const url2 = {
      path: paths[1],
      handlers: {
        PUT: 'singleAction'
      }
    };
    const url3 = {
      path: paths[2],
      handlers: {
        POST: 'create',
        GET: 'list'
      }
    };
    const url4 = {
      path: paths[3],
      handlers: {
        PUT: 'batchAction',
      }
    };

    impUrls.push(url1);
    impUrls.push(url2);
    impUrls.push(url3);
    impUrls.push(url4);
  }

  result.urls = mergeUrls(impUrls, result.urls);

  return result;
}

function buildRoutes(controller, urls) {
  let result = [];
  urls.forEach((element) => {
    const methods = Object.keys(element.handlers);
    result = result.concat(methods.map((method) => {
      const route = {};
      route.method = method.toLowerCase();
      route.handler = controller[element.handlers[method]];
      if (route.handler) route.handler = route.handler.bind(controller);
      if (route.method === 'delete') route.method = 'del';
      route.path = element.path;
      return route;
    }));
  });
  return result.filter(data => typeof data.handler === 'function');
}

module.exports = (opts) => {
  const routeOpts = buildOptions(opts);
  const routes = buildRoutes(routeOpts.controller, routeOpts.urls);
  const funcs = routes.map(data => Router[data.method](data.path, data.handler));
  return Compose(funcs);
};
