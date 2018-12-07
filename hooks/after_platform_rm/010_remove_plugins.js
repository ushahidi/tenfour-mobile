#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var root = process.argv[2];
var platform = process.env.CORDOVA_PLATFORMS;

function removeDirectory(dirPath) {
  var files = [];
  try {
    files = fs.readdirSync(dirPath);
  }
  catch (err) {
    console.log('removeDirectory ' + dirPath + ' does not exist');
    return;
  }
  if (files.length > 0) {
    for (var i = 0; i < files.length; i++) {
      var filePath = dirPath + '/' + files[i];
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
      else {
        removeDirectory(filePath);
      }
    }
  }
  fs.rmdirSync(dirPath);
  console.log('removeDirectory ' + dirPath);
}

function removePluginsDirectory(srcFile, destFile) {
  process.stdout.write('removePluginsDirectory' + "\n");
  var pluginsFolder = path.join(root, 'plugins');
  removeDirectory(pluginsFolder);
}

removePluginsDirectory();
