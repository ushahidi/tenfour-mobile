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
    if (event && event.data) {
      let json = event.data.json();
      let title = json.data != null ? json.data.title : json.notification.title;
      let body = json.data != null ? `${json.data.sender_name}, ${json.data.msg}` : json.notification.body;
      return event.waitUntil(self.registration.showNotification(title, {
        body: body,
        icon: '/assets/images/logo-dots.png'
      }));
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
  if (event && event.data) {
    let json = event.data.json();
    console.log('ServiceWorker push data', json);
    let title = json.data != null ? json.data.title : json.notification.title;
    let body = json.data != null ? `${json.data.sender_name}, ${json.data.msg}` : json.notification.body;
    return event.waitUntil(self.registration.showNotification(title, {
      body: body,
      icon: '/assets/images/logo-dots.png'
    }));
  }
});
self.addEventListener('notificationclick', (event) => {
  console.log('ServiceWorker notificationclick', event);
  var origin = event.srcElement ? event.srcElement.origin : event.origin;
  console.log('ServiceWorker notificationclick origin', origin);
  var promise = clients.matchAll().then(function(clientList) {
    var client = null;
    for (var i = 0 ; i < clientList.length ; i++) {
      if (clientList[i].url.match(origin) != null) {
        console.log('ServiceWorker notificationclick tab', clientList[i].url);
        client = clientList[i];
        break;
      }
    }
    if (client != null) {
      console.log('ServiceWorker notificationclick client', client);
      if (event.notification != null) {
        event.notification.close();
      }
      if ('focus' in client) {
        try {
          client.focus();  
        }
        catch(){}
      }
    }
    else if (origin != null) {
      console.log('ServiceWorker notificationclick window', origin);
      if (event.notification != null) {
        event.notification.close();
      }
      clients.openWindow(origin).then(function(windowClient) {
        if ('focus' in windowClient) {
          try {
            windowClient.focus();
          } catch(){}
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
