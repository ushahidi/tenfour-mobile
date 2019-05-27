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
// if (firebase.messaging.isSupported()) {
//   const firebaseMessaging = firebase.messaging();
//   firebaseMessaging.setBackgroundMessageHandler((event) => {
//     console.log('ServiceWorker setBackgroundMessageHandler', event);
//     if (event && event.data) {
//       let json = event.data.json();
//       let title = json.data != null ? json.data.title : json.notification.title;
//       let body = json.data != null ? `${json.data.sender_name}, ${json.data.msg}` : json.notification.body;
//       return event.waitUntil(self.registration.showNotification(title, {
//         body: body,
//         icon: '/assets/images/logo-dots.png'
//       }));
//     }
//   });
// }
// else {
//   console.error("ServiceWorker Firebase not supported in your browser");
// }
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
    event.stopImmediatePropagation();
    return event.waitUntil(self.registration.showNotification(title, {
      body: body,
      icon: '/assets/images/logo-dots.png',
      data: json.data
    }));
  }
});
self.addEventListener('notificationclick', (event) => {
  console.log('ServiceWorker notificationclick', event);
  var origin = event.srcElement ? event.srcElement.origin : event.origin;
  if (event.notification != null) {
    event.notification.close();
  }
  var promise = clients.matchAll().then(function(clientList) {
    for (var i = 0 ; i < clientList.length ; i++) {
      let client = clientList[i];
      if (client.url.match(origin) != null) {
        console.log('ServiceWorker notificationclick client', client.url);
        return Promise.resolve()
          .then(() => client.focus())
          .then(() => messageClient(client, event.notification.data))
          .catch((error) => {
            console.error('ServiceWorker notificationclick', error);
          });
      }
    }
    clients.openWindow(origin).then(function(windowClient) {
      console.log('ServiceWorker notificationclick window', origin);
      return Promise.resolve()
        .then(() => windowClient.focus())
        .then(() => messageClient(windowClient, event.notification.data))
        .catch((error) => {
          console.error('ServiceWorker notificationclick', error);
        });
    },
    function(error) {
      console.error("clients.openWindow", error);
    });
  },
  function(error) {
    console.error("clients.matchAll", error);
  });
  event.waitUntil(promise);
});
self.addEventListener('notificationclose', (event) => {
  console.log('ServiceWorker notificationclose', event);
});
function messageClient(client, data) {
  return new Promise(function(resolve, reject) {
    const channel = new MessageChannel();
    channel.port1.onmessage = function(event) {
      if (event.data.error) {
        resolve(event.data.error);
      }
      else {
        resolve(event.data);
      }
    };
    client.postMessage(data, [channel.port2]);
  });
}
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
