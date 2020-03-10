const fs = require('fs');

const json = JSON.stringify({
    googleAPIKey: String(process.env.GOOGLE_API_KEY),
    firebaseConfig: {
        apiKey: String(process.FIREBASE_API_KEY),
        appId: String(process.env.FIREBASE_APP_ID),
        authDomain: String(process.env.FIREBASE_AUTH_DOMAIN),
        databaseURL: String(process.env.FIREBASE_DB_URL),
        measurementId: String(process.env.FIREBASE_MEASUREMENT_ID),
        messagingSenderId: String(process.env.FIREBASE_MESSAGING_SENDER_ID),
        projectId: String(process.env.FIREBASE_PROJECT_ID),
        storageBucket: String(process.env.FIREBASE_STORAGE_BUCKET)
    }
});
console.log(process.env);
console.log(process);
console.log(json);
fs.writeFile('electron/Config.json', json, (err) => { });