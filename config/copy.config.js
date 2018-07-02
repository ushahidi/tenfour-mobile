var fs = require("fs-extra");

function copyCordovaScript() {
  if (process.env.IONIC_TARGET === 'cordova') {
    fs.removeSync("www/cordova.js");
  }
  else {
    fs.copySync("src/pwa.js", "www/cordova.js");
    fs.copySync("src/browserconfig.xml", "www/browserconfig.xml");
    fs.copySync("src/assets/icon/apple-touch-icon.png", "www/apple-touch-icon.png");
    fs.copySync("src/assets/icon/apple-touch-icon-precomposed.png", "www/apple-touch-icon-precomposed.png");
  }
  fs.copySync("src/assets/fonts", "www/assets/fonts");
}

copyCordovaScript();
