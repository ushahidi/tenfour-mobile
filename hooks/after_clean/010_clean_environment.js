#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var root = process.argv[2];
var platform = process.env.CORDOVA_PLATFORMS;

function removeEnvironmentFile() {
  process.stdout.write("removeEnvironmentFile" + "\n");
  var filePath = path.join(root, 'src', 'environments', 'environment.ts');
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, function(err) {
      if (err) {
        process.stdout.write(`removeEnvironmentFile ${filePath} Failed` + "\n");
      }
      else {
        process.stdout.write(`removeEnvironmentFile ${filePath} Removed` + "\n");
      }
    });
  }
  else {
    process.stdout.write(`removeEnvironmentFile ${filePath} Already Removed` + "\n");
  }
}

removeEnvironmentFile();
