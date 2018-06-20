var path = require('path');
var useDefaultConfig = require('@ionic/app-scripts/config/webpack.config.js');

module.exports = function () {
    var environment = process.env.ENV || process.env.IONIC_ENV || "dev";
    var sourcePath = getSourcePath(environment);
    useDefaultConfig.dev.resolve.alias = {
      "@app/env": path.resolve(sourcePath)
    };
    useDefaultConfig.prod.resolve.alias = {
      "@app/env": path.resolve(sourcePath)
    };
    consoleLog(environment);
    return useDefaultConfig;
}

function getSourcePath(env) {
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
  return './src/environments/environment.sandbox.ts';
}

function consoleLog(env) {
  console.log("=============== ENVIRONMENT ===============");
  console.log("                                           ");
  console.log("                  "+env.toUpperCase()+"    ");
  console.log("                                           ");
  console.log("===========================================");
}
