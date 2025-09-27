// firebase.js
// Initializes Firebase app and exports Firestore `db` for app.js to use.
// Keep this file as a module (you already include it with type="module").

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

 const firebaseConfig = {
    apiKey: "AIzaSyDbV8pM7R1wk04rBKJ6Fggk_DmQoTRPT_Y",
    authDomain: "todoapp-758e5.firebaseapp.com",
    projectId: "todoapp-758e5",
    storageBucket: "todoapp-758e5.firebasestorage.app",
    messagingSenderId: "436445253719",
    appId: "1:436445253719:web:05b51b14f51fcfb2ffd312"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };