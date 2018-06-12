var fs = require('fs');
var path = require('path');
var useDefaultConfig = require('@ionic/app-scripts/config/webpack.config.js');

module.exports = function () {
    var environment = process.env.ENV || process.env.IONIC_ENV || "dev";
    var source = sourcePath(environment);
    var target = targetPath(environment);
    var data = fs.readFileSync(source, 'utf8');
    fs.writeFileSync(target, data, 'utf8');
    useDefaultConfig.dev.resolve.alias = {
      "@app/env": path.resolve(target)
    };
    useDefaultConfig.prod.resolve.alias = {
      "@app/env": path.resolve(target)
    };
    consoleLog(environment, source);
    return useDefaultConfig;
}

function sourcePath(env) {
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

function targetPath(env) {
  return './src/environments/environment.ts';
}

function consoleLog(env, path) {
  console.log("=============== ENVIRONMENT ===============");
  console.log("                                           ");
  console.log("                  "+env.toUpperCase()+"    ");
  console.log("                                           ");
  console.log("===========================================");
}
