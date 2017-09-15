const Koa = require('koa');
const RR = require('./index');

const app = new Koa();

const model = {
  list(ctx) {
    ctx.body = 'user.list';
  },
  create(ctx) {
    ctx.body = 'user.create';
  },
  fetch(ctx, username) {
    ctx.body = `user.fetch ${username}`;
  },
  update(ctx, username) {
    ctx.body = `user.update ${username}`;
  },
  remove(ctx, username) {
    ctx.body = `user.remove ${username}`;
  },
};

app.use(RR({
  model,
  name: 'user',
  index: ':username(\\w+)',
}));

app.listen(3000);
