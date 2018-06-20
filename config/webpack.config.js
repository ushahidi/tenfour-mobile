var fs = require('fs');
var path = require('path');
var useDefaultConfig = require('@ionic/app-scripts/config/webpack.config.js');

module.exports = function () {
    var environment = process.env.ENV || process.env.IONIC_ENV || "dev";
    var sourcePath = getSourcePath(environment);
    var targetPath = getTargetPath(environment);
    var sourceFile = fs.readFileSync(sourcePath, 'utf8');
    fs.writeFileSync(targetPath, sourceFile, 'utf8');
    var targetFile = fs.readFileSync(targetPath, 'utf8');
    consoleLog(environment, sourcePath, sourceFile, targetPath, targetFile);
    return useDefaultConfig;
}

function getRootPath() {
  return __dirname.replace("config", "");
}

function getSourcePath(env) {
  let rootPath = getRootPath();
  if (env == 'local' || env == 'sandbox') {
    return rootPath + 'src/environments/environment.sandbox.ts';
  }
  else if (env == 'dev' || env == 'develop' || env == 'development') {
    return rootPath + 'src/environments/environment.development.ts';
  }
  else if (env == 'stage' || env == 'staging') {
    return rootPath + 'src/environments/environment.staging.ts';
  }
  else if (env == 'test' || env == 'testing') {
    return rootPath + 'src/environments/environment.testing.ts';
  }
  else if (env == 'prod' || env == 'production') {
    return rootPath + 'src/environments/environment.production.ts';
  }
  return rootPath + 'src/environments/environment.sandbox.ts';
}

function getTargetPath(env) {
  let rootPath = getRootPath();
  return rootPath + 'src/environments/environment.ts';
}

function consoleLog(env, sourcePath, sourceFile, targetPath, targetFile) {
  console.log("=============== ENVIRONMENT ===============");
  console.log("                                           ");
  console.log("                  "+env.toUpperCase()+"    ");
  console.log("                                           ");
  console.log("===========================================");
  if (fs.existsSync(targetPath)) {
    console.log(`Environment ${targetPath} Exists`);
    console.log(targetFile);
  }
  else {
    console.error(`Environment ${targetPath} Does Not Exist`);
  }
}
