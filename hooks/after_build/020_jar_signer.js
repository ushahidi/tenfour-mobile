#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var root = process.argv[2];
var platform = process.env.CORDOVA_PLATFORMS;

function puts(error, stdout, stderr) {
  console.log(stdout);
}

function runJarSigner(apk) {
  if (fs.existsSync(root + "/" + apk)) {
    process.stdout.write("runJarSigner APK " + apk + " signing..." + '\n');
    var json = root + "/build.json";
    if (fs.existsSync(json)) {
      var build = require(json);
      var keystore = root + "/rollcall.keystore";
      var alias = build['android']['release']['alias'];
      var password = build['android']['release']['password'];
      var storePassword = build['android']['release']['storePassword'];
      var command = "jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore " + keystore + " -storepass " + storePassword + " -keypass " + password + " " + apk + " " + alias;
      process.stdout.write(command);
      exec(command, puts);
      process.stdout.write("runJarSigner APK " + apk + " signed" + '\n');
    }
    else {
      process.stdout.write("runJarSigner File " + json + " not found" + '\n');
    }
  }
  else {
    process.stdout.write("runJarSigner APK " + apk + " not found" + '\n');
  }
}

if (platform === 'android') {
  runJarSigner("platforms/android/app/build/outputs/apk/release/app-release.apk");
  runJarSigner("platforms/android/build/outputs/apk/release/android-release.apk");
}
