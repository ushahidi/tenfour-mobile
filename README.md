# TenFour
## Help

---

#### Build Guide
Visit [BUILD.md](/BUILD.md) to create a release build.

---

#### Style Guide
Visit [STYLE.md](/STYLE.md) to see the development style guide.

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
#### Setup Permissions
```
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib
sudo chown -R $(whoami) /usr/local/bin
```
#### Setup Environments
```
nvm install 9
npm install -g cordova@8.1.2
npm install -g ionic@3.20.1
```
```
npm install -g cordova-res@latest
npm install -g cordova-common@latest
npm install -g cordova-ios@latest
npm install -g cordova-android@latest
npm install -g cordova-browser@latest
npm install -g xcode@latest
npm install -g ios-sim@latest
npm install -g ios-deploy@latest
npm install -g android-simulator@latest
```
#### Upgrade Gradle
```
brew upgrade gradle
```
#### Setup CocoaPods
```
gem update --system
gem cleanup --system
gem install cocoapods -n /usr/local/bin
pod setup
```
#### Clean Modules
```
rm -r www
rm -r node_modules
rm -f package-lock.json
npm cache clean --force
npm cache clear --force
npm install --force
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
ionic cordova platform add ios@4.5.5 --buildConfig=build.json
ionic cordova platform add android@6.4.0 --buildConfig=build.json
ionic cordova platform add android@7.1.4 --buildConfig=build.json
ionic cordova platform add android@8.0.0 --buildConfig=build.json
ionic cordova platform add browser
```
#### Add Plugins
```
cordova plugin add sentry-cordova
```
#### Debug iOS
```
cordova run ios --list
xcrun simctl list devicetypes
ENV=dev ionic cordova run ios --livereload --consolelogs --device --buildConfig=build.json
ENV=dev ionic cordova run ios --livereload --consolelogs --debug --target "iPhone-SE,com.apple.CoreSimulator.SimRuntime.iOS-12-2" -- --buildFlag="-UseModernBuildSystem=0"
ENV=dev ionic cordova run ios --livereload --consolelogs --debug --target "iPhone-8-Plus,com.apple.CoreSimulator.SimRuntime.iOS-12-2" -- --buildFlag="-UseModernBuildSystem=0"
ENV=dev ionic cordova run ios --livereload --consolelogs --debug --target "iPad-Pro--12-9-inch---3rd-generation-,com.apple.CoreSimulator.SimRuntime.iOS-12-2" -- --buildFlag="-UseModernBuildSystem=0"
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
#### Code Audit
```
npm run lint
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
