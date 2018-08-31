const Koa = require('koa');
const RE = require('../index.js');

module.exports = (opts) => {
  const app = new Koa();

  app.use(RE(opts));

  return app.listen();
};
