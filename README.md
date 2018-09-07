# Yet Another Restful api Middleware for Koa

Koa middleware to help build restful microservices. It is based on koa-route and koa-compose.

## Idea
In RESET URLs, most endpoints have these patterns:

* list:   GET /user
* create: POST /user
* fetch:  GET /user/:id
* update: PATCH /user/:id
* remove: DELETE /user/:id
* action: PUT /user/:id

So, we make this our default rule for designing REST API.

## Controller

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
  action(ctx, id) {
    ctx.body = `user.action ${id}`;
  }
};
```

Methods are optional, implement the ones needed.

## this

This in function is the object containing the function, if the function is not ES6 arrow function.

```js
// Controller
module.exports = {
  msg: 'Hello',

  list(ctx) {
    ctx.body = `${this.msg}, World!`
    // Hello, World!
  }

  fetch: (ctx, id) => {
    console.log(this.msg);
    // undefined, because fetch is an ES6 arrow function
  }
}
```

## Middleware

By default, each controller provides two url matches, one for list/create (plural), one singular form for others. Example for users:

```js
const Koa = require('koa')
const RE = require('yarmk')
const User = require('./controllers/user')

const app = new Koa()

/*
 resulting
 /user/:id
 /user
*/
const options = {
  /*handlers*/
  controller: User,
  path: '/user',
}

/*if username is prefered*/
/*the generated url is /user/:username(\\w+)*/
const options = {
  controller: User,
  name: '/user',
  index: ':username(\\w+)',
}

app.use(RE(options))

app.listen(3000)
```

## Parameters:
```js
/*
 default
*/
const miniOptions = {
  controller: User,
  path: '/user',
}

/*
 full
*/
const fullOptions = {
  /*The Controller, REQUIRED*/
  controller: User,
  /*Endpoint Path for building URL, optional*/
  /*Required if controller is not es6 class and urls not set*/
  /*If set, common urls are generated.*/
  path: '/user',
  /*Index for Fetching Single Object, optional*/
  /*Default is ':id(\\d+)'*/
  /*Ignored if urls set*/
  index: ':id(\\d+)',
  /*Routes, optional, default as folowing code*/
  /*This section is merged with auto generated urls.*/
  urls: [{
      /*required in urls, NOTE: urls itself is optionsl*/
      /*Override default when exists.*/
      /*Default to be build by name+index*/
      path: '/user/:id(\\d+)',
      /*reqired in urls*/
      handlers: {
        GET: 'fetch',
        PATCH: 'update',
        DELETE: 'remove'
      },
    },
    {
      path: '/user',
      handlers: {
        POST: 'create',
        GET: 'list'
      },
    },
  ],
}
```

## Customize. 

Example for auth(login/logout):

```js
/*controller*/
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
const Koa = require('koa')
const RE = require('yarmk')
const Auth = require('./controllers/auth')

const app = new Koa()

/*
 resulting 
 /auth/login
 /auth/logout
*/
app.use(RE{
  controller: Auth,
  urls: [{
    path: '/auth/login',
    handlers: {
      POST: 'login',
    },
  },
  {
    path: '/auth/logout',
    handlers: {
      GET: 'logout',
    },
  }],
})
```

## Remarks

* If path exists in both url item and upper scope, an implicit route list is generated, and merged with custom urls.

## License

  MIT
