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

const firebase = require('firebase/app');

require('firebase/auth');
require('firebase/firestore');

module.exports = class Firebase {
    constructor() {
        if (firebase.apps.length < 1) {
            firebase.initializeApp(cfg.firebaseConfig);
        }
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
            config.set('users.currentUser', { 'isAnonymously': false, 'id': user.uid });
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
            config.set('users.currentUser', { 'isAnonymously': false, 'id': user.uid });
        });
    }

    loginGuest = () => {
        if (config.get('users.currentUser.id') === '') {
            firebase.auth().signInAnonymously()
                .then(() => this.initDatabase())
                .catch((error) => {
                    console.log(`[Error] Can not signin anonymouse (${error.code}: ${error.message})`);
                });
            firebase.auth().onAuthStateChanged((user) => {
                if (!user) return;
                config.set('users.currentUser', { 'isAnonymously': true, 'id': user.uid });
            });
        } else {
            this.initDatabase();
        }
    }

    getUser = () => {
        return new Promise((resolve, reject) => {
            firebase.auth().onAuthStateChanged(user => resolve(user))
        });
    }

    getUserId = () => {
        return !this.isAnonymously() ? new Promise((resolve, reject) => this.getUser().then(async (user) => resolve(user.uid))) : new Promise((resolve, reject) => resolve(config.get('users.currentUser.id')));
    }

    isAnonymously = () => {
        return config.get('users.currentUser.isAnonymously');
    }

    getUserTypeToString = () => {
        return !this.isAnonymously() ? 'users' : 'guests';
    }

    initDatabase = () => {
        this.getUserId().then(async (user) => {
            const firestore = firebase.firestore();

            await firestore.doc(`${this.getUserTypeToString()}/${user}`).collection('bookmarks').get()
                .then(async (querySnapshot) => {
                    if (querySnapshot.docs.length < 1)
                        await firestore.doc(`${this.getUserTypeToString()}/${user}`).collection('bookmarks').doc().set({ title: 'Demo Data', url: 'flast://welcome', date: firebase.firestore.Timestamp.now() });
                });
            await firestore.doc(`${this.getUserTypeToString()}/${user}`).collection('historys').get()
                .then(async (querySnapshot) => {
                    if (querySnapshot.docs.length < 1)
                        await firestore.doc(`${this.getUserTypeToString()}/${user}`).collection('historys').doc().set({ title: 'Demo Data', url: 'flast://welcome', date: firebase.firestore.Timestamp.now() });
                });
            await firestore.doc(`${this.getUserTypeToString()}/${user}`).collection('downloads').get()
                .then(async (querySnapshot) => {
                    if (querySnapshot.docs.length < 1)
                        await firestore.doc(`${this.getUserTypeToString()}/${user}`).collection('downloads').doc().set({ title: 'Demo Data', url: 'flast://welcome', date: firebase.firestore.Timestamp.now() });
                });
        });
    }





    getBookmarks = (isPrivate = false) => {
        return new Promise((resolve, reject) => {
            this.getUserId().then(async (user) => {
                await firebase.firestore().doc(`${this.getUserTypeToString()}/${user}`).collection('bookmarks').where('isPrivate', '==', isPrivate).orderBy('date', 'desc').get().then((querySnapshot) => resolve(querySnapshot)).catch((error) => console.log(`Error: ${error} (getBookmarks)`))
            });
        });
    }

    addBookmark = (title, url, isPrivate = false) => {
        this.getUserId().then(async (user) => {
            await firebase.firestore().doc(`${this.getUserTypeToString()}/${user}`).collection('bookmarks').doc().set({ title, url, isPrivate, date: firebase.firestore.Timestamp.now() }).catch((error) => console.log(`Error: ${error} (addBookmark)`))
        });
    }

    removeBookmark = (url, isPrivate = false) => {
        this.getUserId().then(async (user) => {
            await firebase.firestore().doc(`${this.getUserTypeToString()}/${user}`).collection('bookmarks').where('url', '==', url).where('isPrivate', '==', isPrivate).get()
                .then((items) => {
                    if (items.size > 0) {
                        items.forEach((item) => {
                            if (url === item.data().url)
                                firebase.firestore().doc(`${this.getUserTypeToString()}/${user}`).collection('bookmarks').doc(item.id).delete().catch((error) => console.log(`Error: ${error} (removeBookmark)`));
                        });
                    }
                })
                .catch((error) => console.log(`Error: ${error} (removeBookmark)`));
        });
    }

    isBookmarked = (url, isPrivate = false) => {
        return new Promise((resolve, reject) => {
            this.getUserId().then(async (user) => {
                await firebase.firestore().doc(`${this.getUserTypeToString()}/${user}`).collection('bookmarks').where('url', '==', url).where('isPrivate', '==', isPrivate).get()
                    .then((items) => resolve(items.size > 0))
                    .catch((error) => console.log(`Error: ${error} (isBookmarked)`));
            });
        })
    }


    getHistorys = () => {
        return new Promise((resolve, reject) => {
            this.getUserId().then(async (user) => {
                await firebase.firestore().doc(`${this.getUserTypeToString()}/${user}`).collection('historys').orderBy('date', 'desc').get().then((querySnapshot) => resolve(querySnapshot)).catch((error) => console.log(`Error: ${error} (getHistorys)`))
            });
        });
    }

    addHistory = (title, url) => {
        this.getUserId().then(async (user) => {
            await firebase.firestore().doc(`${this.getUserTypeToString()}/${user}`).collection('historys').where('url', '==', url).get()
                .then((items) => {
                    if (items.size > 0) {
                        items.forEach((item) => {
                            if (url === item.data().url)
                                firebase.firestore().doc(`${this.getUserTypeToString()}/${user}`).collection('historys').doc(item.id).update({ title, url, date: firebase.firestore.Timestamp.now() }).catch((error) => console.log(`Error: ${error} (addHistory)`))
                        });
                    } else {
                        firebase.firestore().doc(`${this.getUserTypeToString()}/${user}`).collection('historys').doc().set({ title, url, date: firebase.firestore.Timestamp.now() }).catch((error) => console.log(`Error: ${error} (addHistory)`));
                        return;
                    }
                })
                .catch((error) => console.log(`Error: ${error} (addHistory)`));
        });
    }

    clearHistorys = () => {
        return new Promise((resolve, reject) => {
            this.getUserId().then(async (user) => {
                await firebase.firestore().doc(`${this.getUserTypeToString()}/${user}`).collection('historys').get()
                    .then((items) => {
                        items.forEach((item) => {
                            firebase.firestore().doc(`${this.getUserTypeToString()}/${user}`).collection('historys').doc(item.id).delete().catch((error) => console.log(`Error: ${error} (clearHistorys)`))
                        });
                    })
                    .catch((error) => console.log(`Error: ${error} (clearHistorys)`))
            });
        });
    }

    getDownloads = () => {
        return new Promise((resolve, reject) => {
            this.getUserId().then(async (user) => {
                await firebase.firestore().doc(`${this.getUserTypeToString()}/${user}`).collection('downloads').get().then((querySnapshot) => resolve(querySnapshot)).catch((error) => console.log(`Error: ${error} (getDownloads)`))
            });
        });
    }
}