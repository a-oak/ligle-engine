
var ligle={};
ligle.util = require('ligle-util');
var logger = ligle.util.logger('ligle-engine','TRACE');
var configure = ligle.util.configure;

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
  exportObj.service = require('ligle-service');

  logger.trace('configuration:',cfg);
  return exportObj;
};


