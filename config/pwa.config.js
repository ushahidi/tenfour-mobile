var fs = require("fs-extra");

if (process.env.IONIC_TARGET === 'cordova') {
  fs.remove("www/cordova.js");
}
else {
  fs.copy("src/pwa.js", "www/cordova.js");
  fs.copy("src/browserconfig.xml", "www/browserconfig.xml");
  fs.copy("src/assets/icon/apple-touch-icon.png", "www/apple-touch-icon.png");
  fs.copy("src/assets/icon/apple-touch-icon-precomposed.png", "www/apple-touch-icon-precomposed.png");
}
