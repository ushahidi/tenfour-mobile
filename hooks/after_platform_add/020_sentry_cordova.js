#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var root = process.argv[2];
var platform = process.env.CORDOVA_PLATFORMS;

function puts(error, stdout, stderr) {
  console.log(stdout);
}

function addSentryCordova() {
  process.stdout.write("addSentryCordova" + "\n");
  exec("cordova plugin add sentry-cordova", puts)
}

addSentryCordova();
