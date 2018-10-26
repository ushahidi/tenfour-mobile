var fs = require("fs-extra");

var package = fs.readFileSync("package.json");
var version = JSON.parse(package).version;

fs.writeFile("src/version.ts", "export let version:string = '" + version + "';", function(err) {
    if(err) {
        return console.log(err);
    }
});
