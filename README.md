# koa-minires

Koa middleware to help build restful microservices. It is based on koa-route and koa-compose.

## Idea
In RESET URLs, most endpoints have these patterns:

list:   GET /users
create: POST /users
fetch:  GET /user/:id
update: PUT /user/:id
remove: DELETE /user/:id

So, we make this our default rule for designing REST API.

## Model

Every Endpoint is a JS module, example for users:

```js
module.exports = {
  list(ctx) {
    ctx.body = 'user.list';
  },
  create(ctx) {
    ctx.body = 'user.create';
  },
  fetch(ctx, id) {
    ctx.body = `user.fetch ${id}`;
  },
  update(ctx, id) {
    ctx.body = `user.update ${id}`;
  },
  remove(ctx, id) {
    ctx.body = `user.remove ${id}`;
  },
};
```

Methods are optional, implement the ones needed.

## Middleware

By default, each model provides two url matches, one for list/create (plural), one singular form for others. Example for users:

```js
const app = require('koa')
const RR = require('koa-minires')
const User = require('./models/user')

/*
 resulting
 /user/:id
 /users
*/
const options = {
  /*handlers*/
  model: User,
  name: 'user',
}

/*if username is prefered*/
const options = {
  model: User,
  name: 'user',
  index: ':username(\\w+)',
}

/*for heroes
 /hero/:id
 /heroes
*/
const options = {
  model: User,
  name: ['hero', 'heroes'],
}

app.use(RR(options))
```

## Parameters:
```js
/*
 default
*/
const miniOptions = {
  model: User,
  name: 'user',
}

/*
 full
*/
const fullOptions = {
  /*The Model, REQUIRED*/
  model: User,
  /*Endpoint Path for building URL, optional*/
  /*Required without urls, ignored if urls specified''*/
  name: 'user',
  /*Index for Fetching Single Object, optional*/
  /*Default is ':id(\\d+)'*/
  /*Ignored if urls specified*/
  index: ':id(\\d+)',
  /*Routes, optional, default as folowing code*/
  urls: [{
      /*required in urls, NOTE: urls itself is optionsl*/
      /*Override default when exists.*/
      /*Default to be build by name+index*/
      path: '/user/:id(\\d+)',
      /*reqired in urls*/
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
    },
    {
      path: '/users',
      handlers: [
        {
          POST: 'create',
        },
        {
          GET: 'list',
        },
      ],
    },
  ],
}
```

## Customize. 

Example for auth(login/logout):

```js
/*model*/
module.exports = {
  login (ctx) {
    //get posted username & password
    //do login job
  }

  logout (ctx) {
    //do logout job
    //delete user session
  }
}

/*app*/
const app = require('koa')
const RR = require('minires')
const Auth = require('./models/auth')

/*
 resulting 
 /auth/login
 /auth/logout
*/
app.use(RR{
  model: Auth,
  urls: [{
    path: '/login',
    handlers: [{
      'POST': 'login',
    }],
  },
  {
    path: '/logout',
    handlers: [{
      'GET': 'logout',
    }],
  }],
})
```

## Suggested usage for microservices:

* Folow 1. and 2., use default config.
* Only one model is suggested in one app.
* Keep protocol as HTTP. If HTTPS is needed, use proxy/load balancer.
* Use koa middlewares as needed.
* We don't touch request/response, so if you want if for regular web APP, help yourself. Just no benifits seen here.

## License

  MIT
