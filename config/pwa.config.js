var fs = require("fs-extra");

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

function copyCordovaScript() {
  if (process.env.IONIC_TARGET === 'cordova') {
    console.log(`copyCordovaScript www/cordova.js Deleted`);
    fs.remove("www/cordova.js");
  }
  else {
    console.log(`copyCordovaScript www/cordova.js Copied`);
    fs.copy("src/pwa.js", "www/cordova.js");
    fs.copy("src/browserconfig.xml", "www/browserconfig.xml");
    fs.copy("src/assets/icon/apple-touch-icon.png", "www/apple-touch-icon.png");
    fs.copy("src/assets/icon/apple-touch-icon-precomposed.png", "www/apple-touch-icon-precomposed.png");
  }
}

function copyEnvironmentFile() {
  var environment = process.env.ENV || process.env.IONIC_ENV || "dev";
  var sourcePath = getSourcePath(environment);
  var targetPath = getTargetPath(environment);
  fs.copy(sourcePath, targetPath);
  consoleLog(environment);
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

copyCordovaScript();
copyEnvironmentFile();
