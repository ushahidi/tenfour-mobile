# TenFour
## Help

---

#### Page Flow
Visit [PAGES.md](/docs/PAGES.md) to see the hierarchy of pages in the app.

---

#### Project Setup
Visit [SETUP.md](/docs/SETUP.md) for getting your Ionic environment setup.

---

#### Design Theme
Visit [THEME.md](/docs/THEME.md) for information on changing colors and styling.

---

#### Helpful Resources
* [Ionic Documentation](https://ionicframework.com/docs/)
* [Ionic Installation](https://ionicframework.com/docs/intro/installation/)
* [Ionic Components](https://ionicframework.com/docs/components/)
* [Ionic Native Plugins](https://ionicframework.com/docs/native/)
* [Ionic Command Line](https://ionicframework.com/docs/cli/commands.html)
* [Ionic Community Forum](https://forum.ionicframework.com/)

---
#### Setup Environment
```
sudo npm install -g cordova@7.1.0
sudo npm install -g ionic@latest
npm install -g xcode@latest
npm install -g cordova-common@latest
npm install -g cordova-ios@latest
npm install -g cordova-android@latest
npm install -g cordova-browser@latest
sudo npm install -g ios-sim@latest
npm install -g ios-deploy@latest
npm install -g android-simulator@latest
```
#### Clean Modules
```
rm -r node_modules
rm -f package-lock.json
npm install
```
#### Remove Platforms
```
cordova clean
ionic cordova platform rm ios
ionic cordova platform rm android
ionic cordova platform rm browser
```
#### Add Platforms
```
ionic cordova platform add ios --buildConfig=build.json
ionic cordova platform add android@6.4.0 --buildConfig=build.json
ionic cordova platform add browser
```
#### Debug iOS
```
cordova run ios --list
ENV=dev ionic cordova run ios --livereload --consolelogs --device --buildConfig=build.json
ENV=dev ionic cordova emulate ios --livereload --consolelogs --emulator --debug --target "iPhone-SE, 12.1" -- --buildFlag="-UseModernBuildSystem=0"
ENV=dev ionic cordova emulate ios --livereload --consolelogs --emulator --debug --target "iPhone-8-Plus, 12.1" -- --buildFlag="-UseModernBuildSystem=0"
ENV=dev ionic cordova emulate ios --livereload --consolelogs --emulator --debug --target "iPad-Pro--12-9-inch---2nd-generation-, 12.1" -- --buildFlag="-UseModernBuildSystem=0"
```
#### Debug Android
```
cordova run android --list
ENV=dev ionic cordova run android --livereload --consolelogs --device --debug
ENV=dev ionic cordova emulate android --livereload --consolelogs --emulator --target Nexus_S_API_26
```
#### Debug PWA
```
ENV=local ionic serve --livereload --consolelogs
ENV=dev ionic serve --livereload --consolelogs
ENV=staging ionic serve --livereload --consolelogs
ENV=prod ionic serve --livereload --consolelogs
```
#### Release iOS
```
rvm use system
export NODE_OPTIONS=--max_old_space_size=4096
ENV=prod ionic cordova prepare ios --prod --release --buildConfig=build.json
ENV=prod ionic cordova build ios --prod --release --buildConfig=build.json
```
#### Release Android
```
sdkmanager --update
export NODE_OPTIONS=--max_old_space_size=4096
ENV=prod ionic cordova prepare android --prod --release --buildConfig=build.json
ENV=prod ionic cordova build android --device --prod --release --buildConfig=build.json
```
#### Release PWA
```
ENV=develop npm run ionic:build --prod --release
ENV=staging npm run ionic:build --prod --release
ENV=prod npm run ionic:build --prod --release
```
#### Commit Branch
```
git checkout develop
git reset --hard
git pull
```
```
ISSUE_NAME="123 Fixed A Bug"
BRANCH_NAME=$(echo $ISSUE_NAME | tr '[:upper:]' '[:lower:]' | tr '/' '-' | tr ' ' '-')
git checkout -b $BRANCH_NAME
git add .
git add -u
git commit -m "Fixed a bug for #123"
git push -u origin $BRANCH_NAME
```
