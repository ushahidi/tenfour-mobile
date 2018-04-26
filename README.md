# TenFour
## Mobile App

---

## Quick Setup

Remove Platforms
```
cordova clean
ionic cordova platform rm ios
ionic cordova platform rm android
```
Add Platforms
```
ionic cordova platform add ios --buildConfig=build.json
ionic cordova platform add android@6.4.0 --buildConfig=build.json
```
```
cordova plugin rm cordova-plugin-nativestorage
cordova plugin add cordova-plugin-nativestorage@2.2.2
```
Debug Apps
```
ionic cordova emulate ios --livereload --consolelogs --emulator --debug --target "iPhone-SE"
en
ionic cordova emulate ios --livereload --consolelogs --emulator --debug --target "iPad-Pro"
ionic cordova run ios --livereload --consolelogs --device --debug
```
```
cordova run --list
ionic cordova emulate android --livereload --consolelogs --emulator --target Nexus_S_API_22
ionic cordova emulate android --livereload --consolelogs --emulator --target Nexus_S_API_23
ionic cordova emulate android --livereload --consolelogs --emulator --target Nexus_S_API_24
ionic cordova emulate android --livereload --consolelogs --emulator --target Nexus_S_API_25
ionic cordova emulate android --livereload --consolelogs --emulator --target Nexus_S_API_26
```
Release Apps
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

---

## GitHub
#### Clone the [Ushahidi](https://github.com/ushahidi/tenfour-mobile) repo

```
git clone git@github.com:ushahidi/tenfour-mobile.git TenFour_Mobile
cd TenFour_Mobile
```

---

## XCode
#### Ensure the latest [XCode](https://developer.apple.com/xcode/) is installed

Download and install XCode

```
https://developer.apple.com/xcode/
```

Once XCode is installed, install the command line tools

```
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcode-select --install
```

Check your version of GCC

```
gcc --version
```

---

## Homebrew
#### Ensure that [Homebrew](http://brew.sh) is installed

Install Homebrew, if its not already installed

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Add the Homebrew location `export PATH="/usr/local/bin:$PATH"` to your environment `$PATH`.

```
open -e ~/.bash_profile
```

Update the Homebrew recipes

```
brew update
```

If you have permission issues with `/usr/local/`, try running

```
sudo chown -R `whoami` /usr/local/
brew update
```

Check health of Homebrew recipes

```
brew doctor
```

---

## NPM
#### Ensure that [Node.js](https://nodejs.org) and [NPM](https://www.npmjs.com) is installed

Install Node via Homebrew

```
brew install node
```

Check the version of Node

```
node --version
```

Install some NPM utilities

```
npm install -g npm
```

Check the version of NPM

```
npm --version
```

---

## Cordova
#### Install the latest [Cordova](https://www.npmjs.com/package/cordova)

Install the latest Cordova

```
npm install -g cordova@latest
```

If you run into permission problems, try using `sudo`

```
sudo npm install -g cordova@latest
```

Check the version of Cordova

```
cordova -v
```

Clean up the Cordova build files

```
cordova clean
```

---

## Ionic
#### Install the latest [Ionic](http://ionicframework.com/docs/v2/) and necessary dependencies

Install the latest Ionic

```
npm install -g ionic@latest
```

If you run into permission problems, try using `sudo`

```
sudo npm install -g ionic@latest
```

Install some Ionic and Cordova utilities

```
npm install -g xcode@latest
npm install -g cordova-common@latest
npm install -g cordova-ios@latest
npm install -g cordova-android@latest
npm install -g cordova-browser@latest
sudo npm install -g ios-sim@latest
npm install -g ios-deploy@latest
npm install -g android-simulator@latest
```

Check the version of Ionic

```
ionic info
```

List the root level NPM packages

```
npm list --depth=0
```

Remove, Clean, Install
```
rm -rf node_modules/
npm install
```

---

## Java
#### Ensure that [Java JDK](https://www.java.com/en) is installed on your machine

Download and install the latest Java JDK

```
https://support.apple.com/kb/dl1572?locale=en_US
```

Check your version of Java

```
java -version
```

---

## Android
#### Ensure the latest [Android](https://developer.android.com/index.html) is installed

Download and install the latest [Android Studio](https://developer.android.com/studio/index.html)

```
https://developer.android.com/studio/index.html
```

Once installed, find the location where the [Android SDK](https://developer.android.com/studio/command-line/index.html) is installed

```
Android Studio > Preferences > Appearance & Behaviour > System Settings > Android SDK > Android SDK Location
```

Open your `~/.bash_profile` to include the location of the [Android SDK](https://developer.android.com/studio/command-line/index.html)

```
open -e ~/.bash_profile
```

Add the lines to the bottom of your `~/.bash_profile`, pointing to your `Android SDK Location` (mine was `/Library/Android`)

```
export PATH=/Library/Android/tools:/Library/Android/platform-tools:$PATH
export ANDROID_HOME=/Library/Android
export ANDROID_SDK=/Library/Android
export ANDROID_SDK_ROOT=/Library/Android
```

Test running the [Android Command Line Tools](https://developer.android.com/studio/command-line/index.html)

```
android --help
```

Update the necessary SDKs

```
android list sdk --all --extended
android update sdk -u -a -t android-24
android update sdk -u -a -t extra-android-m2repository
android update sdk -u -a -t extra-google-google_play_services
android update sdk -u -a -t extra-google-analytics_sdk_v2
android update sdk -u -a -t extra-intel-Hardware_Accelerated_Execution_Manager
```

Run Android SDK Manager
```
android sdk
```

Run Android Virtual Device Manager
```
android avd
```

---

## iOS
#### Commands to [build](http://ionicframework.com/docs/v2/cli/build/) and [run](http://ionicframework.com/docs/v2/cli/run/) the iOS app

Check whether the Cordova requirements for iOS are installed

```
cordova requirements ios
```

Build the project for iOS

```
ionic cordova build ios
```

Run the app in the iOS Simulator or attached iOS device

```
ionic cordova run ios --livereload --consolelogs
```
```
ionic cordova run ios --livereload --consolelogs --target "iPhone-SE"
```

Build the app in release and production mode for archiving

```
ionic cordova build ios --prod --release
```

More information on Cordova's [iOS Platform Guide](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/)

```
https://cordova.apache.org/docs/en/latest/guide/platforms/ios/
```

---

## Android
#### Commands to [build](http://ionicframework.com/docs/v2/cli/build/) and [run](http://ionicframework.com/docs/v2/cli/run/) the Android app

Check whether the Cordova requirements for Android are installed

```
cordova requirements android
```

Build the project for Android

```
ionic cordova build android
```

Run the app in the Android Emulator or attached Android device

```
ionic cordova run android --livereload --consolelogs
```

Build the app in release and production mode for archiving

```
ionic cordova build android --prod --release
```

```
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore rollcall.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk rollcall
```

```
./zipalign -f -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk platforms/android/build/outputs/apk/Rollcall.apk
```

More information on Cordova's [Android Platform Guide](https://cordova.apache.org/docs/en/latest/guide/platforms/android/)

```
https://cordova.apache.org/docs/en/latest/guide/platforms/android/
```

---

## Git
#### Commands for [Git](https://git-scm.com) version control

Check local changes

```
git status
```

Revert local changes

```
git reset --hard
```

Commit local changes

```
git add .
git add -u
git commit -m "message about the changes"
git push
```

Create a tag

```
git tag 1.0
git push origin --tags
```

## NPM
#### Some handy NPM commands

Check outdated NPM dependencies
```
npm outdated
```

Update all dependencies to latest Ionic2
```
npm install ionic-angular@latest --save --save-exact
```
