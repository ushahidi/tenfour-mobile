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

#### Remove Platforms
```
cordova clean
ionic cordova platform rm ios
ionic cordova platform rm android
```
#### Add Platforms
```
ionic cordova platform add ios --buildConfig=build.json
ionic cordova platform add android@6.4.0 --buildConfig=build.json
```
```
cordova plugin rm cordova-plugin-nativestorage
cordova plugin add cordova-plugin-nativestorage@2.2.2
```
#### Debug Apps
```
cordova run ios --list
ionic cordova emulate ios --livereload --consolelogs --emulator --debug --target "iPhone-SE"
ionic cordova emulate ios --livereload --consolelogs --emulator --debug --target "iPhone-8-Plus"
ionic cordova emulate ios --livereload --consolelogs --emulator --debug --target "iPad-Pro--12-9-inch---2nd-generation-, 11.3"
ionic cordova run ios --livereload --consolelogs --device --debug
```
```
cordova run android --list
ionic cordova emulate android --livereload --consolelogs --emulator --target Nexus_S_API_22
ionic cordova emulate android --livereload --consolelogs --emulator --target Nexus_S_API_23
ionic cordova emulate android --livereload --consolelogs --emulator --target Nexus_S_API_24
ionic cordova emulate android --livereload --consolelogs --emulator --target Nexus_S_API_25
ionic cordova emulate android --livereload --consolelogs --emulator --target Nexus_S_API_26
```
```
ionic serve --livereload --consolelogs
ionic serve --livereload --consolelogs --labs
```
#### Release Apps
```
rvm use system
ionic cordova prepare ios --debug --buildConfig=build.json
ionic cordova prepare ios --prod --release --buildConfig=build.json
```
```
ionic cordova build ios --debug --buildConfig=build.json
ionic cordova build ios --prod --release --buildConfig=build.json
```
```
ionic cordova prepare android --buildConfig=build.json
ionic cordova build android --device --prod --release --buildConfig=build.json
```
#### Deploy PWA
```
npm run ionic:build --prod --release
firebase deploy
```

#### Commit Branch

```
ISSUE_NAME="123 Fixed A Bug"
BRANCH_NAME=$(echo $ISSUE_NAME | tr '[:upper:]' '[:lower:]' | tr '/' '-' | tr ' ' '-')
git checkout -b $BRANCH_NAME
git add -a
git commit -m "Changes"
git push -u origin $BRANCH_NAME
```
