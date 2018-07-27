'use strict';
importScripts('./build/sw-toolbox.js');
importScripts('https://www.gstatic.com/firebasejs/4.9.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.9.1/firebase-messaging.js');
firebase.initializeApp({
  projectId: "tenfour-7322f",
  apiKey: "AIzaSyBVrazg_PbRPVWpnoalUGZHfaIhwfYm8DI",
  authDomain: "tenfour-7322f.firebaseapp.com",
  databaseURL: "https://tenfour-7322f.firebaseio.com",
  storageBucket: "tenfour-7322f.appspot.com",
  messagingSenderId: '240600431570'
});
const firebaseMessaging = firebase.messaging();
firebaseMessaging.setBackgroundMessageHandler(function(payload) {
  console.log('Firebase Background Message Handler', payload);
  let notificationTitle = "Notification Received";
  const notificationOptions = {
    icon: '/assets/images/logo-dots.png'
  };
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.toolbox.options.cache = {
  name: 'ionic-cache'
};
self.toolbox.precache(
  [
    'index.html',
    'manifest.json'
  ]
);
self.toolbox.router.any('/*', self.toolbox.cacheFirst);
self.toolbox.router.default = self.toolbox.networkFirst;
