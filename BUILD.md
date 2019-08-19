# TenFour
## Release Build Steps

#### 1) Checkout Tag
- `git checkout TAG_NAME`

#### 2) Clean Modules
- `rm -r www`
- `rm -r node_modules`
- `rm -f package-lock.json`
- `npm install`

#### 3) Remove Platforms
- `cordova clean`
- `ionic cordova platform rm ios`
- `ionic cordova platform rm android`
- `ionic cordova platform rm browser`

#### 4) Add Platforms
- `ionic cordova platform add ios@4.5.5 --buildConfig=build.json`
- `ionic cordova platform add android@7.1.4 --buildConfig=build.json`
- `ionic cordova platform add browser`

#### 5) Add Plugins
- `cordova plugin add sentry-cordova`

#### 6) Release iOS
- Open `platforms/ios/TenFour.xcworkspace` in Xcode
- Under `TenFour` > `General` uncheck `Automatically managing signing`
- Choose `Signing (Debug)` provisioning profile
- Choose `Signing (Release)` provisioning profile
- Under `TenFour` > `Build` search for `Swift`
- Change `Swift Language Version` to `Swift 4`
- Select `View` > `Navigators` > `Show Issue Navigator`
- Under TenFour project, click `Update to recommended settings` then `Perform Changes`
- Under CordovaLib project, click `Update to recommended settings` then `Perform Changes`
- Run `rvm use system`
- Run `export NODE_OPTIONS=--max_old_space_size=4096`
- Run `ENV=prod ionic cordova build ios --prod --release --buildConfig=build.json`
- Change active schema to `Generic iOS Device`
- Select `Project` > `Archive`
- From popup click `Distribute App` > `iOS App Store` > `Export` > save to your Desktop
- Open Application Loader, click `Choose` to select `TenFour.IPA` in generated folder on your Desktop

#### 7) Release Android
- Download the `rollcall.keystore` file into the project directory
- Open `platforms/android` folder in Android Studio
- Fix gradle error `Could not find method leftShift() for arguments`, in `platforms/android/app/build.gradle` replace `task cdvPrintProps << {` with `task cdvPrintProps {``
- Update gradle dependencies, example `Android Gradle plugin to version 3.4.2 and Gradle to version 5.1.1`
- Select the error `Move minSdkVersion to build files and sync project`, click `Do refactor`
- Select the error `Move targetSdkVersion to build file and sync project`, click `Do refactor`
- Upgrade `com.google.gms:google-services:4.2.0` to `com.google.gms:google-services:4.3.0`
- In `platforms/android/app/build.gradle` add `multiDexEnabled true` to `android { defaultConfig {`
- Run `sdkmanager --update`
- Run `export NODE_OPTIONS=--max_old_space_size=4096`
- Run `ENV=prod ionic cordova build android --device --prod --release --buildConfig=build.json`
- Upload the new `TenFour.apk` to the Google Play Store

#### 8) Release PWA
- `ENV=prod npm run ionic:build --prod --release`
