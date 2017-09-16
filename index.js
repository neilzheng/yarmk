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
  if ((result.name && (typeof result.name !== 'string') && !Array.isArray(result.name)) ||
    (result.index && typeof result.index !== 'string')) {
    throw new TypeError('name must be string or array of strings & index must be string');
  }
  if (result.name && Array.isArray(result.name)) {
    if (result.name.length === 0) {
      throw new TypeError('name is empty array');
    }
    result.name.forEach((data) => {
      if (typeof data !== 'string') {
        throw new TypeError('name must be string or array of strings');
      }
    });
  }
  if (result.urls && (!Array.isArray(result.urls) || result.urls.length === 0)) {
    throw new TypeError('urls must be a non-empty array');
  }
  if (result.urls) {
    result.urls.forEach((data) => {
      if (!data.path || typeof data.path !== 'string' ||
        !Array.isArray(data.handlers) || data.handlers.length === 0) {
        throw new TypeError('path must be a string, handlers must be non-empty array');
      }
    });
  }

  if (!result.urls) {
    if (!result.index) result.index = ':id(\\d+)';
    let names = [];
    if (typeof result.name === 'string') {
      names = [`/${result.name}/${result.index}`, `/${result.name}s`];
    } else { // should be an array
      names = [`/${result.name[0]}/${result.index}`, `/${result.name[1]}`];
    }
    result.urls = [];
    const url1 = {
      path: names[0],
      handlers: [
        {
          GET: 'fetch',
        },
        {
          PUT: 'update',
        },
        {
          DELETE: 'remove',
        },
      ],
    };
    const url2 = {
      path: names[1],
      handlers: [
        {
          POST: 'create',
        },
        {
          GET: 'list',
        },
      ],
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
      return (ctx, ...args) => { // first argument is ctx
        const instance = new Controller();
        instance.ctx = ctx;
        // first argument needs to be this
        return Controller.prototype[method].apply(instance, args);
      };
    }
    return Controller[method];
  };

  let result = [];
  urls.forEach((element) => {
    result = result.concat(element.handlers.map((handler) => {
      const route = {};
      const keys = Object.keys(handler);
      let method = '';
      if (keys.length !== 1) throw new TypeError('multiple keys in route handler');
      [method] = keys;
      route.method = method.toLowerCase();
      route.handler = makeHandler(handler[method]);
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
