const { app, shell, ipcMain, protocol, session, BrowserWindow, BrowserView, Menu, nativeImage, clipboard, dialog, Notification } = require('electron');
const path = require('path');
const { parse, format } = require('url');
const os = require('os');
const https = require('https');
const http = require('http');

const pkg = require(`${app.getAppPath()}/package.json`);
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

// const cfg = require('./Config');

const Config = require('electron-store');
const config = new Config();

const crypto = require('crypto');

const firebase = require('firebase/app');

require('firebase/auth');
require('firebase/firestore');

const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from([
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff
]);

module.exports = class Firebase {

    constructor(defaultConfig) {
        this.defaultConfig = defaultConfig;
        if (!firebase.apps.length)
            firebase.initializeApp({
                apiKey: process.env.FIREBASE_API_KEY,
                appId: process.env.FIREBASE_APP_ID,
                authDomain: process.env.FIREBASE_AUTH_DOMAIN,
                databaseURL: process.env.FIREBASE_DB_URL,
                measurementId: process.env.FIREBASE_MEASUREMENT_ID,
                messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
                projectId: process.env.FIREBASE_PROJECT_ID,
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET
            });
    }

    getDefaultConfig = () => {
        return this.defaultConfig;
    }

    getInstance = () => {
        return firebase;
    }

    createAccount = (email, password) => {
        new Promise(async (resolve, reject) => {
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then((credential) => {
                    const user = credential.user;
                    if (!user) return;

                    const userConfig = new Config({
                        cwd: path.join(app.getPath('userData'), 'Users', user.uid),
                        defaults: this.defaultConfig
                    });
                    config.set('currentUser', user.uid);
                    userConfig.set('profile', { id: user.uid, name: user.displayName, address: user.email, token: this.encodeBase64(password) });

                    console.log(user.uid);
                    this.initDatabase(user.uid);
                    resolve({ result: true });
                })
                .catch((err) => {
                    console.log(`Error (createAccount): ${err.code} -> ${err.message}`);
                    reject({ result: false, error: err });
                });
        }).then((result) => {
            firebase.auth().onAuthStateChanged((user) => {
                if (!user) return;
                const userConfig = new Config({
                    cwd: path.join(app.getPath('userData'), 'Users', user.uid),
                    defaults: this.defaultConfig
                });
                config.set('currentUser', user.uid);
                userConfig.set('profile', { id: user.uid, name: user.displayName, address: user.email, token: this.encodeBase64(password) });
            });
            return result;
        });
    }

    loginAccount = (email, password) => {
        new Promise((resolve, reject) => {
            console.log('Login...2');
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(() => {
                    console.log('3-1');
                    this.initDatabase();
                    console.log('3-2');
                    resolve({ result: true });
                    console.log('3-3');
                })
                .catch((err) => {
                    console.log(`Error (loginAccount): ${err.code} -> ${err.message}`);
                    reject({ result: false, error: err });
                });
        }).then((result) => {
            firebase.auth().onAuthStateChanged(async (user) => {
                if (!user) return;
                console.log('5-1');
                user.getIdToken(true);
                const userConfig = new Config({
                    cwd: path.join(app.getPath('userData'), 'Users', user.uid),
                    defaults: this.defaultConfig
                });
                config.set('currentUser', user.uid);
                userConfig.set('profile', { id: user.uid, name: user.displayName, address: user.email, token: this.encodeBase64(password) });
                console.log('5-2');
            });
            console.log('6');
            return result;
        });
    }

    login = () => {
        return new Promise((resolve, reject) => {
            if (this.getToken() !== undefined && this.getToken() !== '') {
                console.log('Login...');
                const userConfig = new Config({
                    cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser')),
                    defaults: this.defaultConfig
                });

                const email = userConfig.get('profile.address');
                const password = this.decodeBase64(this.getToken());

                resolve(this.loginAccount(email, password));
            } else {
                console.log('Register...');
                resolve(this.createAccount(`${this.getRandString(12)}@flast.com`, this.getRandString(16)));
            }
        });
    }

    logout = () => {
        return new Promise((resolve, reject) => {
            if (firebase.auth().currentUser) {
                const id = firebase.auth().currentUser.uid;
                firebase.auth().signOut()
                    .then(() => {
                        const userConfig = new Config({
                            cwd: path.join(app.getPath('userData'), 'Users', id),
                            defaults: this.defaultConfig
                        });
                        userConfig.set('profile', { id: '', name: '', address: '', token: '' });
                        resolve({ result: true });
                    })
                    .catch((err) => {
                        console.log(err);
                        reject({ result: false, error: err });
                    });
            } else {
                resolve({ result: true });
            }
        });
    }

    updateAccount = (email, password, displayName = undefined) => {
        return new Promise((resolve, reject) => {
            if (firebase.auth().currentUser) {
                const userConfig = new Config({
                    cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser')),
                    defaults: this.defaultConfig
                });

                firebase.auth().currentUser.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(userConfig.get('profile.address'), this.decodeBase64(this.getToken())))
                    .then((credential) => {
                        const user = credential.user;

                        user.updateEmail(email)
                            .catch((err) => {
                                console.log(err);
                                reject({ result: false, error: err });
                            });
                        user.updatePassword(password)
                            .catch((err) => {
                                console.log(err);
                                reject({ result: false, error: err });
                            });

                        user.getIdToken(true);

                        if (displayName) {
                            user.updateProfile({ displayName })
                                .catch((err) => {
                                    console.log(err);
                                    reject({ result: false, error: err });
                                });
                        }

                        user.sendEmailVerification();

                        user.reload();
                        const userConfig = new Config({
                            cwd: path.join(app.getPath('userData'), 'Users', user.uid),
                            defaults: this.defaultConfig
                        });
                        userConfig.set('profile', { id: user.uid, name: displayName, address: email, token: this.encodeBase64(password) });
                        resolve({ result: true });
                    })
                    .catch((err) => {
                        console.log(err);
                        reject({ result: false, error: err });
                    });
            } else {
                this.createAccount(`${this.getRandString(12)}@flast.com`, this.getRandString(16));
                resolve({ result: true });
            }
        });
    };

    syncAccount = (id = undefined, email) => {
        const firestore = firebase.firestore();

        if (id) {
            firestore.collection('sync').doc(id).get().then((doc) => {
                if (doc.exists) {
                    const user = doc.data();

                    if (user.email !== String(email)) return null;

                    const userConfig = new Config({
                        cwd: path.join(app.getPath('userData'), 'Users', id),
                        defaults: this.defaultConfig
                    });
                    userConfig.set('profile', { id: user.id, name: user.displayName, address: user.email, token: user.token });

                    firestore.collection('sync').doc(id).delete().then(function () {
                        console.log('Document successfully deleted!');
                    }).catch((err) => {
                        console.log(`Error removing document: ${err}`);
                        return null;
                    });
                } else {
                    return null;
                }
            }).catch((err) => {
                console.log(`Error getting document: ${err}`);
                return null;
            });
        } else {
            const id = this.getId();
            const userConfig = new Config({
                cwd: path.join(app.getPath('userData'), 'Users', id),
                defaults: this.defaultConfig
            });
            const str = this.getRandString(8);
            firestore.collection('sync').doc(str).set({ id, displayName: userConfig.get('profile.name'), email: userConfig.get('profile.address'), token: this.getToken(), date: firebase.firestore.Timestamp.now() });
            return str;
        }
    }

    getCurrentUser = () => {
        return firebase.auth().currentUser;
    }

    getUser = () => {
        return new Promise((resolve, reject) => {
            firebase.auth().onAuthStateChanged(user => resolve(user))
        });
    }

    getId = () => {
        const userConfig = new Config({
            cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser')),
            defaults: this.defaultConfig
        });
        return userConfig.get('profile.id');
    }

    getToken = () => {
        const userConfig = new Config({
            cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser')),
            defaults: this.defaultConfig
        });
        return userConfig.get('profile.token');
    }

    initDatabase = (id = this.getId()) => {
        const firestore = firebase.firestore();

        console.log('4-1');
        firestore.collection('users').doc(id).collection('bookmarks').get()
            .then(async (querySnapshot) => {
                if (querySnapshot.docs.length < 1)
                    await firestore.collection('users').doc(id).collection('bookmarks').doc().set({ title: 'Demo Data', url: 'flast://welcome', date: firebase.firestore.Timestamp.now() });
            });
        firestore.collection('users').doc(id).collection('historys').get()
            .then(async (querySnapshot) => {
                if (querySnapshot.docs.length < 1)
                    await firestore.collection('users').doc(id).collection('historys').doc().set({ title: 'Demo Data', url: 'flast://welcome', date: firebase.firestore.Timestamp.now() });
            });
        firestore.collection('users').doc(id).collection('downloads').get()
            .then(async (querySnapshot) => {
                if (querySnapshot.docs.length < 1)
                    await firestore.collection('users').doc(id).collection('downloads').doc().set({ title: 'Demo Data', url: 'flast://welcome', date: firebase.firestore.Timestamp.now() });
            });
        console.log('4-2');
    }

    getBookmarks = (isPrivate = false) => {
        return new Promise((resolve, reject) => {
            const id = this.getId();
            firebase.firestore().collection('users').doc(id).collection('bookmarks').where('isPrivate', '==', isPrivate).orderBy('date', 'desc').get()
                .then((querySnapshot) => resolve(querySnapshot))
                .catch((err) => {
                    reject(err);
                    console.log(`Error: ${err} (getBookmarks)`)
                });
        });
    }

    addBookmark = (title, url, favicon, isFolder = false, isPrivate = false) => {
        const id = this.getId();
        firebase.firestore().collection('users').doc(id).collection('bookmarks').doc().set({ title, url, favicon, isFolder, isPrivate, date: firebase.firestore.Timestamp.now() }).catch((error) => console.log(`Error: ${error} (addBookmark)`))
    }

    removeBookmark = (url, isPrivate = false) => {
        const id = this.getId();
        firebase.firestore().collection('users').doc(id).collection('bookmarks').where('url', '==', url).where('isPrivate', '==', isPrivate).get()
            .then((items) => {
                if (items.size > 0) {
                    items.forEach((item) => {
                        if (url === item.data().url)
                            firebase.firestore().collection('users').doc(id).collection('bookmarks').doc(item.id).delete().catch((error) => console.log(`Error: ${error} (removeBookmark)`));
                    });
                }
            })
            .catch((error) => console.log(`Error: ${error} (removeBookmark)`));
    }

    isBookmarked = (url, isPrivate = false) => {
        return new Promise((resolve, reject) => {
            const id = this.getId();
            firebase.firestore().collection('users').doc(id).collection('bookmarks').where('url', '==', url).where('isPrivate', '==', isPrivate).get()
                .then((items) => resolve(items.size > 0))
                .catch((error) => {
                    reject(err);
                    console.log(`Error: ${error} (isBookmarked)`)
                });
        });
    }

    getHistorys = () => {
        return new Promise((resolve, reject) => {
            const id = this.getId();
            firebase.firestore().collection('users').doc(id).collection('historys').orderBy('date', 'desc').get()
                .then((querySnapshot) => resolve(querySnapshot))
                .catch((err) => {
                    reject(err);
                    console.log(`Error: ${err} (getHistorys)`)
                });
        });
    }

    addHistory = (title, url, favicon) => {
        const id = this.getId();
        firebase.firestore().collection('users').doc(id).collection('historys').where('url', '==', url).get()
            .then((items) => {
                if (items.size > 0) {
                    items.forEach((item) => {
                        if (url === item.data().url)
                            firebase.firestore().collection('users').doc(id).collection('historys').doc(item.id).update({ title, url, favicon, date: firebase.firestore.Timestamp.now() }).catch((error) => console.log(`Error: ${error} (addHistory)`))
                    });
                } else {
                    firebase.firestore().collection('users').doc(id).collection('historys').doc().set({ title, url, favicon, date: firebase.firestore.Timestamp.now() }).catch((error) => console.log(`Error: ${error} (addHistory)`));
                    return;
                }
            })
            .catch((error) => console.log(`Error: ${error} (addHistory)`));
    }

    clearHistorys = () => {
        return new Promise((resolve, reject) => {
            const id = this.getId();
            firebase.firestore().collection('users').doc(id).collection('historys').get()
                .then((items) => {
                    items.forEach((item) => {
                        firebase.firestore().collection('users').doc(id).collection('historys').doc(item.id).delete().catch((error) => console.log(`Error: ${error} (clearHistorys)`))
                    });
                })
                .catch((error) => console.log(`Error: ${error} (clearHistorys)`))
        });
    }

    getDownloads = () => {
        return new Promise((resolve, reject) => {
            const id = this.getId();
            firebase.firestore().collection('users').doc(id).collection('downloads').get().then((querySnapshot) => resolve(querySnapshot)).catch((error) => console.log(`Error: ${error} (getDownloads)`))
        });
    }

    encodeBase64 = (data) => {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
        const encData = cipher.update(Buffer.from(data));
        return Buffer.concat([iv, encData, cipher.final()]).toString('base64');
    }

    decodeBase64 = (data) => {
        const buff = Buffer.from(data, 'base64');
        const iv = buff.slice(0, 16);
        const encData = buff.slice(16);
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
        const decData = decipher.update(encData);
        return Buffer.concat([decData, decipher.final()]).toString('utf8');
    }


    getRandString = (length) => {
        const char = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const charLength = char.length;

        let str = '';
        for (var i = 0; i < length; i++)
            str += char[Math.floor(Math.random() * charLength)];

        return str;
    }
}