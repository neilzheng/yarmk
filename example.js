const Koa = require('koa');
const RE = require('./index');

const app = new Koa();

class User {
  /*
  list() {
    this.ctx.body = 'user.list';
  }
  */

  create() {
    this.ctx.body = 'user.create';
  }

  fetch(username) {
    this.ctx.body = `user.fetch ${username}`;
  }

  update(username) {
    this.ctx.body = `user.update ${username}`;
  }

  remove(username) {
    this.ctx.body = `user.remove ${username}`;
  }
}

app.use(RE(User));

app.listen(3000);
