ligle engine
====================
[![Build Status](https://travis-ci.org/a-oak/ligle-engine.svg?branch=master)](https://travis-ci.org/a-oak/ligle-engine)
[![Build Status](https://travis-ci.org/a-oak/ligle-engine.svg?branch=develop)](https://travis-ci.org/a-oak/ligle-engine)
Copyright (c) 2015 [A-Oak](http://a-oak.com/) Co. Ltd. under MIT LICENSE.

## 简介
栎果引擎的全部的封装。all in one

## 安装

```shell
npm install ligle-engine --save
```

in app.js

```js 
var cfg = require('./config.js'); // your config about engine
var ligle = require('ligle-engine')(cfg);
var logger = ligle.util.logger('normal','TRACE');
```

install extended model, plugins and addons
```js
// engine plugins
require('ligle-plugin-globals')(ligle);

// engine addons
require('ligle-addon-captcha')(ligle);
require('ligle-addon-permission')(ligle);

// model extensions
require('ligle-model-member')(ligle);
```

```js
var init = require('./init.js'); // do some initial work

ligle.start(function(){
  // do some initialize works.  can force init by passing second argument
  init(ligle,argv.reset);

  var app = express();
  // .. normally express midware set up
  // ...


  // use ligle provided midware and routes
  app.use(ligle.midware.addRenderer);
  app.use(ligle.addon.captcha.route);

  // use custom modules
  var localService = require('./back')(ligle);
  for(var s  in localService){
    var router = localService[s];
    if(router instanceof Function){
      logger.debug('adding routes:',s);
      app.use(localService[s]);
    }
  }
});

```

in custom module folder, you can easily extend ligle-model
```js
var ligle = require('ligle-engine')(); // it would be the same module as in app.js
var logger = ligle.util.logger('basic.js');

module.exports = ligle.model.ModelBase.extend({
  __className:'basic',
  __upDir:'basic',
  init:function(obj){
    this._super(obj);
  },
  coll:{name:'basic',fields:{}},
  rest:{},
});
```

use the defined model in routes
```js
// ...
var Model = require('../model/basic.js');
var router = express.Router();

router
  .route('/list/basic')
  .get(function(req, res){
    var obj = new Model();
    obj.getList({}, function(err, objs){
      res.rd.renderEO('client/basic', err, {data: objs});
    });
  });

router
  .route('/detail/basic/:id')
  .get(function(req, res){
    var obj = new Model();
    var id = req.params.id;
    obj.get({_id: id}, function(err, obj){
      res.rd.renderEO('client/basic_detail', err, {data: obj});
    });
  });
module.exports = router;
```

## 设计规划
1. 对使用者更加的透明。
2. 定义一些事件。
3. 参照hexo的架构，提供更加容易使用的插件模式。引擎提供几种注册函数，
   供插件调用。插件注册后就起作用。
4. 插件的配置从引擎配置导入。
5. 每个插件类似rest api。可以配置路由地址，以及其他需要的参数。
6. 模型扩展只增加框架的模型库。

## ligle-engine结构设计

- ligle-util

  提供一些便捷使用的函数。日志等等。其他服务商api的封装。

- ligle-db

  提供数据库的抽象。目前基本为空。另外应该提供一些schema的机制。这块可
  以考虑整合mongoose

- ligle-midware

  提供兼容express的插件。数据库只用ligle-db提供的服务。

- ligle-model

  提供ODM/ORM。使用ligle-db提供的数据库服务。

- ligle-engine

  TODO：
  1. 提供事件的抽象。
  2. 提供对express app的挂载。
  3. 提供依赖模块管理机制。

