const fs = require('fs');

const json = JSON.stringify({
    googleAPIKey: String(process.argv[2]),
    firebaseConfig: {
        apiKey: String(process.argv[3]),
        appId: String(process.argv[4]),
        authDomain: String(process.argv[5]),
        databaseURL: String(process.argv[6]),
        measurementId: String(process.argv[7]),
        messagingSenderId: String(process.argv[8]),
        projectId: String(process.argv[9]),
        storageBucket: String(process.argv[10])
    }
});
console.log(json);
fs.writeFile('electron/Config.json', json, (err) => { });