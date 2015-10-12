
var ligle={};
ligle.util = require('ligle-util');
var allConfigure = ligle.util.allConfigure;
var configure = ligle.util.configure;

var async = require('async');

var exportObj;
module.exports = function(config){// jshint ignore:line
  if(exportObj) {
    return exportObj;
  }

  var logLevel;
  var defaultCfg = require('./config.js');
  var cfg = allConfigure(config,defaultCfg);
  module.exports.cfg = cfg;

  exportObj={};
  exportObj.cfg = cfg;

  // ligle-util
  logLevel = {loggerLevel:cfg.loggerLevel};
  var utilCfg = configure(logLevel,cfg.util);
  exportObj.util = require('ligle-util')(utilCfg);

  ligle.util = exportObj.util;
  var logger = ligle.util.logger(cfg.loggerName,cfg.loggerLevel);

  module.exports.logger = logger;
  logger.trace(cfg);

  // ligle-db
  logLevel = {loggerLevel:cfg.loggerLevel};
  var dbCfg = configure(logLevel,cfg.db);
  exportObj.db= require('ligle-db')(dbCfg);

  // ligle-model
  logLevel = {loggerLevel:cfg.loggerLevel};
  var modelCfg = configure(logLevel,cfg.model);
  modelCfg.db = exportObj.db;// model模块必须有db实例
  exportObj.model= require('ligle-model')(modelCfg);

  // ligle-midware
  logLevel = {loggerLevel:cfg.loggerLevel};
  var midwareCfg = configure(logLevel,cfg.midware);
  exportObj.midware= require('ligle-midware')(midwareCfg);

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
    if(err) {
      logger.error(err.stack);
    }
    self.runHooks(self.exitHooks,function(err,result){
      logger.info('exit hooks finished');
      if(err) {
        logger.error(err.stack);
      }
      process.nextTick(function(){
        logger.info('db closed');
        process.exit(0);
      });
    });
  }
  var _afterhook = function(){
    //catches ctrl+c event
    process.on('SIGINT', exitHandler);
    //catches uncaught exceptions
    process.on('uncaughtException', exitHandler);
  };
  var _start = function(runApp){
    self.db.start(function(){// opendb
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

  return exportObj;
};
