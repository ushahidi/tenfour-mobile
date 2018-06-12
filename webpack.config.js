var fs = require('fs');
var path = require('path');
var useDefaultConfig = require('@ionic/app-scripts/config/webpack.config.js');

module.exports = function () {
    var environment = process.env.ENV || process.env.IONIC_ENV || process.env.NODE_ENV || "dev";
    var filePath = environmentPath(environment);
    if (fs.existsSync(filePath)) {
      consoleLog(environment, filePath);
      useDefaultConfig.dev.resolve.alias = {
        "@app/env": path.resolve(filePath)
      };
      useDefaultConfig.prod.resolve.alias = {
        "@app/env": path.resolve(filePath)
      };
    }
    else {
      consoleError(environment, filePath);
    }
    return useDefaultConfig;
}

function environmentPath(env) {
  if (env == 'local' || env == 'sandbox') {
    return './src/environments/environment.sandbox.ts';
  }
  else if (env == 'dev' || env == 'develop' || env == 'development') {
    return './src/environments/environment.development.ts';
  }
  else if (env == 'stage' || env == 'staging') {
    return './src/environments/environment.staging.ts';
  }
  else if (env == 'test' || env == 'testing') {
    return './src/environments/environment.testing.ts';
  }
  else if (env == 'prod' || env == 'production') {
    return './src/environments/environment.production.ts';
  }
  return './src/environments/environment.ts';
}

function consoleLog(env, path) {
  console.log("=============== ENVIRONMENT ===============");
  console.log("                                           ");
  console.log("                 "+env+"                   ");
  console.log("                                           ");
  console.log("===========================================");
}

function consoleError(env, path) {
  console.error("=============== ENVIRONMENT ===============");
  console.error("                                           ");
  console.error("                 "+env+"                   ");
  console.error("                                           ");
  console.error("===========================================");
}
