const Router = require('koa-route');
const Compose = require('koa-compose');

function buildOptions(optsIn) {
  let result = optsIn;

  if (!result || (typeof result !== 'function' && typeof result !== 'object')) {
    throw new TypeError('options must be an object or es6 class');
  }
  if (typeof result === 'function') {
    result = {
      controller: result,
      name: result.name,
    };
  }
  if (!result.controller ||
    (typeof result.controller !== 'object' && typeof result.controller !== 'function')) {
    throw new TypeError('controller must be set as js object or es6 class');
  }
  if (!result.urls && !result.name) throw new TypeError('name needed if urls not present');
  if ((result.name && (typeof result.name !== 'string')) ||
    (result.index && typeof result.index !== 'string')) {
    throw new TypeError('name must be a string & index must be string');
  }
  if (result.urls && (!Array.isArray(result.urls) || result.urls.length === 0)) {
    throw new TypeError('urls must be a non-empty array');
  }
  if (result.urls) {
    result.urls.forEach((data) => {
      if (!data.path || typeof data.path !== 'string' ||
        typeof data.handlers !== 'object') {
        throw new TypeError('path must be a string, handlers must be methods keyed object');
      }
    });
  }

  if (!result.urls) {
    if (!result.index) result.index = ':id([\\w\\-\\_]+)';
    const names = [`/${result.name}/${result.index}`, `/${result.name}`];
    result.urls = [];
    const url1 = {
      path: names[0],
      handlers: {
        GET: 'fetch',
        PATCH: 'update',
        DELETE: 'remove',
      },
    };
    const url2 = {
      path: names[1],
      handlers: {
        POST: 'create',
        GET: 'list',
      },
    };

    result.urls.push(url1);
    result.urls.push(url2);
  }

  return result;
}

function buildRoutes(Controller, urls) {
  const makeHandler = (method) => {
    if (typeof Controller === 'function') {
      if (method === 'constructor') throw new TypeError('cannot use constructor as handler');
      const handlerMethod = Controller.prototype[method];
      return typeof handlerMethod === 'function' ? (ctx, ...args) => { // first argument is ctx
        const instance = new Controller();
        instance.ctx = ctx;
        // first argument needs to be this
        return Controller.prototype[method].apply(instance, args);
      } : undefined;
    }
    return Controller[method];
  };

  let result = [];
  urls.forEach((element) => {
    const methods = Object.keys(element.handlers);
    result = result.concat(methods.map((method) => {
      const route = {};
      route.method = method.toLowerCase();
      route.handler = makeHandler(element.handlers[method]);
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
