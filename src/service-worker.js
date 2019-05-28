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
    let json = event.data != null ? event.data.json() : {};
    console.log('ServiceWorker setBackgroundMessageHandler', json);
    let title = json.data != null ? json.data.title : json.notification.title;
    let body = json.data != null ? `${json.data.sender_name}, ${json.data.msg}` : json.notification.body;
    return self.registration.showNotification(title, {
      body: body,
      data: json.data,
      icon: '/assets/images/logo-dots.png',
    });
  });
}
else {
  console.warn("ServiceWorker Firebase not supported in your browser");
}
self.addEventListener('install', (event) => {
  console.log("ServiceWorker installed", event);
});
self.addEventListener('activate', (event) => {
  console.log("ServiceWorker activated", event);
});
self.addEventListener('push', (event) => {
  let json = event.data != null ? event.data.json() : {};
  console.log('ServiceWorker push', json);
  let title = json.data != null ? json.data.title : json.notification.title;
  let body = json.data != null ? `${json.data.sender_name}, ${json.data.msg}` : json.notification.body;
  let promise = self.registration.showNotification(title, {
    body: body,
    data: json.data,
    icon: '/assets/images/logo-dots.png'
  });
  return event.waitUntil(promise);
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
        return Promise.resolve()
          .then(() => client.focus())
          .then(() => messageClient(client, event.notification.data))
          .catch((error) => {
            console.warn("ServiceWorker notificationclick", error);
          });
      }
    }
    clients.openWindow(origin).then(function(windowClient) {
      return Promise.resolve()
        .then(() => windowClient.focus())
        .then(() => messageClient(windowClient, event.notification.data))
        .catch((error) => {
          console.warn("ServiceWorker notificationclick", error);
        });
    },
    function(error) {
      console.warn("ServiceWorker clients.openWindow", error);
    });
  },
  function(error) {
    console.warn("ServiceWorker clients.matchAll", error);
  });
  return event.waitUntil(promise);
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
