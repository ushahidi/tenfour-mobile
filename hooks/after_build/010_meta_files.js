#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var root = process.argv[2];
var platform = process.env.CORDOVA_PLATFORMS;

function puts(error, stdout, stderr) {
  console.log(stdout);
}

function removeMetaFiles(apk) {
  if (fs.existsSync(root + "/" + apk)) {
    process.stdout.write("removeMetaFiles APK " + apk + " cleaning..." + '\n');
    var command = "zip -d " + apk + " META-INF/\*";
    process.stdout.write(command);
    exec(command, puts);
    process.stdout.write("removeMetaFiles APK " + apk + " cleaned" + '\n');
  }
  else {
    process.stdout.write("removeMetaFiles APK " + apk + " not found" + '\n');
  }
}

if (platform === 'android') {
  removeMetaFiles("platforms/android/build/outputs/apk/release/android-release.apk");
  removeMetaFiles("platforms/android/app/build/outputs/apk/release/app-release.apk");
}
