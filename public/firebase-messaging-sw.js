importScripts("https://www.gstatic.com/firebasejs/4.12.1/firebase-app.js")
importScripts("https://www.gstatic.com/firebasejs/4.12.1/firebase-messaging.js")

var config = {
  apiKey: "AIzaSyAEsKuezyGIQ_URe8xzc65rhePtU2Ezl7c",
  authDomain: "admin-notifications-7d944.firebaseapp.com",
  databaseURL: "https://admin-notifications-7d944.firebaseio.com",
  projectId: "admin-notifications-7d944",
  storageBucket: "",
  messagingSenderId: "865456359946"
};
firebase.initializeApp(config);
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  var notificationTitle = 'Background Message Title';
  var notificationOptions = {
    body: 'Background Message body.'
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);

})