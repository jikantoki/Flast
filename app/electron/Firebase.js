const { app, shell, ipcMain, protocol, session, BrowserWindow, BrowserView, Menu, nativeImage, clipboard, dialog, Notification } = require('electron');
const path = require('path');
const { parse, format } = require('url');
const os = require('os');
const https = require('https');
const http = require('http');

const pkg = require(`${app.getAppPath()}/package.json`);
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const cfg = require('./Config');

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

    constructor() {
        if (firebase.apps.length < 1)
            firebase.initializeApp(cfg.firebaseConfig);
    }

    getInstance = () => {
        return firebase;
    }

    createAccount = (email, password) => {
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(() => this.initDatabase())
            .catch((error) => {
                console.log(`[Error] ${error.code}: ${error.message}`);
            });
        firebase.auth().onAuthStateChanged((user) => {
            if (!user) return;
            config.set('profile', { id: user.uid, name: user.displayName, address: user.email, token: this.encodeBase64(password) });
        });
    }

    loginAccount = (email, password) => {
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => this.initDatabase())
            .catch((error) => {
                console.log(`[Error] ${error.code}: ${error.message}`);
            });
        firebase.auth().onAuthStateChanged((user) => {
            if (!user) return;
            config.set('profile', { id: user.uid, name: user.displayName, address: user.email, token: this.encodeBase64(password) });
        });
    }

    login = () => {
        if (this.getToken() !== undefined && this.getToken() !== '') {
            const email = config.get('profile.address');
            const password = this.decodeBase64(this.getToken());

            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(() => this.initDatabase())
                .catch((error) => {
                    console.log(`[Error] ${error.code}: ${error.message}`);
                });
            firebase.auth().onAuthStateChanged((user) => {
                if (!user) return;
                config.set('profile', { id: user.uid, name: user.displayName, address: user.email, token: this.encodeBase64(password) });
            });
        } else {
            this.createAccount(`${this.getRandString(12)}@flast.com`, this.getRandString(16));
        }
    }

    getUser = () => {
        return new Promise((resolve, reject) => {
            firebase.auth().onAuthStateChanged(user => resolve(user))
        });
    }

    getId = () => {
        return config.get('profile.id');
    }

    getToken = () => {
        return config.get('profile.token');
    }

    initDatabase = () => {
        const id = this.getId();
        const firestore = firebase.firestore();

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
    }

    getBookmarks = (isPrivate = false) => {
        return new Promise((resolve, reject) => {
            const id = this.getId();
            firebase.firestore().collection('users').doc(id).collection('bookmarks').where('isPrivate', '==', isPrivate).orderBy('date', 'desc').get().then((querySnapshot) => resolve(querySnapshot)).catch((error) => console.log(`Error: ${error} (getBookmarks)`));
        });
    }

    addBookmark = (title, url, isPrivate = false) => {
        const id = this.getId();
        firebase.firestore().collection('users').doc(id).collection('bookmarks').doc().set({ title, url, isPrivate, date: firebase.firestore.Timestamp.now() }).catch((error) => console.log(`Error: ${error} (addBookmark)`))
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
                .catch((error) => console.log(`Error: ${error} (isBookmarked)`));
        });
    }

    getHistorys = () => {
        return new Promise((resolve, reject) => {
            const id = this.getId();
            firebase.firestore().collection('users').doc(id).collection('historys').orderBy('date', 'desc').get().then((querySnapshot) => resolve(querySnapshot)).catch((error) => console.log(`Error: ${error} (getHistorys)`))
        });
    }

    addHistory = (title, url) => {
        const id = this.getId();
        firebase.firestore().collection('users').doc(id).collection('historys').where('url', '==', url).get()
            .then((items) => {
                if (items.size > 0) {
                    items.forEach((item) => {
                        if (url === item.data().url)
                            firebase.firestore().collection('users').doc(id).collection('historys').doc(item.id).update({ title, url, date: firebase.firestore.Timestamp.now() }).catch((error) => console.log(`Error: ${error} (addHistory)`))
                    });
                } else {
                    firebase.firestore().collection('users').doc(id).collection('historys').doc().set({ title, url, date: firebase.firestore.Timestamp.now() }).catch((error) => console.log(`Error: ${error} (addHistory)`));
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