
var ligle={};
ligle.util = require('ligle-util');
var logger = ligle.util.logger('ligle-engine','TRACE');
var configure = ligle.util.configure;
var async = require('async');

var defaultCfg = {
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

var exportObj;
module.exports = function(config){
  if(exportObj) return exportObj;
  var cfg = configure(config,'',defaultCfg);

  exportObj={};
  exportObj.util = require('ligle-util');
  exportObj.base = require('ligle-base')(cfg);
  // hooks of engine
  exportObj.initHooks = [];
  exportObj.dbOpenedHooks = [];
  exportObj.exitHooks = [];
  exportObj.runHooks = function(hooks,done){
    async.parallel(hooks,function(err,result){
      done(err,result);
    });
  };

  var self = exportObj;
  function exitHandler(err) {
    self.runHooks(self.exitHooks,function(err,result){
      logger.info('exit hooks finished');
      if(err) console.log(err.stack);
      self.base.db.close(function(){
        process.nextTick(function(){
          logger.info('db closed');
          process.exit(0);
        });
      });
    });
  };
  var _afterhook = function(){
    //catches ctrl+c event
    process.on('SIGINT', exitHandler);
    //catches uncaught exceptions
    process.on('uncaughtException', exitHandler);
  };
  var _start = function(runApp){
    self.base.start(function(){// opendb
      self.runHooks(self.dbOpenedHooks,function(err,result){
        logger.info('dbOpened hooks finished');

        // run user logic
        runApp();
        
        // add exit hooks
        _afterhook();
      });
    });
  };

  exportObj.start = function(runApp){    
    this.runHooks(this.initHooks,function(err,result){
      logger.info('init hooks finished');
      _start(runApp);
    });

    // we now purge out service, and in future would add this module.
    //  exportObj.service = require('ligle-service');
  };

  logger.trace('configuration:',cfg);
  return exportObj;
};


