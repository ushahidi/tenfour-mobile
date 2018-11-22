#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var root = process.argv[2];
var platform = process.env.CORDOVA_PLATFORMS;

function puts(error, stdout, stderr) {
  console.log(stdout);
}

function runZipAlign(input, output) {
  if (fs.existsSync(root + "/" + input)) {
    process.stdout.write("runZipAlign" + input + " aligning..." + '\n');
    var command = "./zipalign -f -v 4 " + input + " " + output;
    process.stdout.write(command);
    exec(command, puts);
    process.stdout.write("runZipAlign APK " + output + " aligned" + '\n');
  }
  else {
    process.stdout.write("runZipAlign APK " + input + " not found" + '\n');
  }
}

if (platform === 'android') {
  runZipAlign("platforms/android/build/outputs/apk/release/android-release.apk", "platforms/android/build/outputs/apk/release/TenFour.apk");
  runZipAlign("platforms/android/app/build/outputs/apk/release/app-release.apk", "platforms/android/app/build/outputs/apk/release/TenFour.apk");
}
