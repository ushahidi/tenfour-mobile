'use strict';
importScripts('./build/sw-toolbox.js');
importScripts('https://www.gstatic.com/firebasejs/5.5.9/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.5.9/firebase-messaging.js');
firebase.initializeApp({
  projectId: "tenfour-7322f",
  messagingSenderId: "804609537189",
  appId: "1:804609537189:web:2d7be5b938d60162",
  apiKey: "AIzaSyB2oFSjaXf-7dkwNPa_8QsHHn600apSMck"
});
if (firebase.messaging.isSupported()) {
  const firebaseMessaging = firebase.messaging();
  firebaseMessaging.setBackgroundMessageHandler((event) => {
    console.log('ServiceWorker setBackgroundMessageHandler', event);
    if (event.data) {
      console.log('ServiceWorker setBackgroundMessageHandler data', event.data.json());
      let json =  event.data.json();
      let title = json.notitication.title;
      const options = {
        body: json.notitication.body,
        icon: '/assets/images/logo-dots.png'
      };
      return event.waitUntil(self.registration.showNotification(title, options));
    }
  });
}
else {
  console.error("ServiceWorker Firebase not supported in your browser");
}
self.addEventListener('install', (event) => {
  console.log("ServiceWorker installed", event);
});
self.addEventListener('activate', (event) => {
  console.log("ServiceWorker activated", event);
});
self.addEventListener('push', (event) => {
  console.log('ServiceWorker push', event);
  if (event.data) {
    console.log('ServiceWorker push data', event.data.json());
    let json =  event.data.json();
    let title = json.notitication.title;
    const options = {
      body: json.notitication.body,
      icon: '/assets/images/logo-dots.png'
    };
    return event.waitUntil(self.registration.showNotification(title, options));
  }
});
self.addEventListener('notificationclick', (event) => {
  var origin = event.origin || event.srcElement.origin;
  console.log('ServiceWorker notificationclick Origin', origin);
  console.log('ServiceWorker notificationclick Notification', event.notification);
  var promise = clients.matchAll().then(function(clientList) {
    var client = null;
    for (var i = 0 ; i < clientList.length ; i++) {
      if (clientList[i].url.match(origin) != null) {
        console.log('ServiceWorker notificationclick Tab', clientList[i].url);
        client = clientList[i];
        break;
      }
    }
    if (client) {
      event.notification.close();
      client.focus();
    }
    else if (origin) {
      clients.openWindow(origin).then(function(windowClient) {
        event.notification.close();
        if (windowClient) {
          windowClient.focus();
        }
      });
    }
  });
  event.waitUntil(promise);
});
self.addEventListener('notificationclose', (event) => {
  console.log('ServiceWorker notificationclose', event);
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
