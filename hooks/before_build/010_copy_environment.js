#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var root = process.argv[2];
var platform = process.env.CORDOVA_PLATFORMS;

function copyEnvironmentFile() {
  process.stdout.write(`copyEnvironmentFile`);
  var environment = process.env.ENV || process.env.IONIC_ENV || "dev";
  var sourcePath = getSourcePath(environment);
  var targetPath = getTargetPath(environment);
  var sourceFile = fs.readFileSync(sourcePath, 'utf8');
  fs.writeFileSync(targetPath, sourceFile, 'utf8');
  process.stdout.write(`copyEnvironmentFile ${environment} ${sourcePath} to ${targetPath}` + "\n");
}

function getSourcePath(env) {
  if (env == 'local' || env == 'sandbox') {
    return path.join(root, 'src', 'environments', 'environment.sandbox.ts');
  }
  else if (env == 'dev' || env == 'develop' || env == 'development') {
    return path.join(root, 'src', 'environments', 'environment.development.ts');
  }
  else if (env == 'stage' || env == 'staging') {
    return path.join(root, 'src', 'environments', 'environment.staging.ts');
  }
  else if (env == 'test' || env == 'testing') {
    return path.join(root, 'src', 'environments', 'environment.testing.ts');
  }
  else if (env == 'prod' || env == 'production') {
    return path.join(root, 'src', 'environments', 'environment.production.ts');
  }
  return path.join(root, 'src', 'environments', 'environment.sandbox.ts');
}

function getTargetPath(env) {
  return path.join(root, 'src', 'environments', 'environment.ts');
}

copyEnvironmentFile();
