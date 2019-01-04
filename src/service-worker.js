'use strict';
importScripts('./build/sw-toolbox.js');
importScripts('https://www.gstatic.com/firebasejs/4.9.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.9.1/firebase-messaging.js');
firebase.initializeApp({
  projectId: "tenfour-7322f",
  apiKey: "AIzaSyBVrazg_PbRPVWpnoalUGZHfaIhwfYm8DI",
  messagingSenderId: '804609537189'
});
const firebaseMessaging = firebase.messaging();
firebaseMessaging.setBackgroundMessageHandler(function(payload) {
  console.log('Firebase setBackgroundMessageHandler');
  console.log(payload);
  let notificationTitle = "Notification Received";
  const notificationOptions = {
    icon: '/assets/images/logo-dots.png',
    body: "Notification Body"
  };
  return self.registration.showNotification(notificationTitle, notificationOptions);
});
self.addEventListener('install', event => {
  console.log("ServiceWorker installed");
});
self.addEventListener('activate', event => {
  console.log("ServiceWorker activated");
});
self.addEventListener('notificationclick', function(e) {
  console.log('ServiceWorker notificationclick');
  // let notification = e.notification;
  // let primaryKey = notification.data.primaryKey;
  // let action = e.action;
  // if (action === 'close') {
  //   notification.close();
  // }
  // else {
  //   notification.close();
  // }
});
self.addEventListener('notificationclose', function(e) {
  console.log('ServiceWorker notificationclose');
  // let notification = e.notification;
  // let primaryKey = notification.data.primaryKey;
});
self.toolbox.options.cache = {
  name: 'ionic-cache'
};
self.toolbox.precache(
  [
    './build/main.js',
    './build/main.css',
    './build/polyfills.js',
    'index.html',
    'manifest.json'
  ]
);
self.toolbox.router.any('/*', self.toolbox.networkFirst);
self.toolbox.router.default = self.toolbox.networkFirst;
