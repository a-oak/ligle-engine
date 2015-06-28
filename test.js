var cfg = {
  'ligle-model':{
    upDir:'./',
    staticDir:'/'
  },
  'ligle-db': { 
    db: 'ligleEngine', 
    host: '127.0.0.1', 
    port: 27017
  },
  'ligle-routes': {
  }
};

var ligle = require('./index.js')(cfg);

// test util
// logger
var logger = ligle.util.logger('test','TRACE');
logger.trace('testing');
logger.debug('testing');
logger.info('testing');
logger.error('testing');
logger.fatal('testing');

// test model
var Basic = ligle.base.model.ModelBase;
var basic = new Basic({name:'hahaha',desp:'xxxxx',code:1});

// 这里测试多层嵌套
basic.save(function(err,d){
  logger.info('saved',basic);
  d.name='lixiang';
  delete d.code;
  d.save(function(e,d){
    d.save(function(e,d){
      d.save(function(e,d){
        d.save(function(e,d){
        });
      });
    });
  });
});
/*
basic.save(function(err,d){
  logger.info('saved',basic);
  d.name='lixiang';
  delete d.code;
  d.get(function(e,d){
    d.get(function(e,d){
      d.get(function(e,d){
      });
    });
  });
});
*/
