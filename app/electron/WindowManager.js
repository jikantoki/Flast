const { app, shell, ipcMain, protocol, session, BrowserWindow, BrowserView, Menu, nativeImage, clipboard, dialog, Notification, nativeTheme, systemPreferences } = require('electron');
const path = require('path');
const { parse, format } = require('url');
const os = require('os');
const https = require('https');
const http = require('http');

const Firebase = require('./Firebase');

const MainWindow = require('./Windows/MainWindow');

const pkg = require(`${app.getAppPath()}/package.json`);
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const { download } = require('electron-dl');
const platform = require('electron-platform');
const localShortcut = require('electron-localshortcut');
const isOnline = require('is-online');

const Config = require('electron-store');
const config = new Config();
const userConfig = new Config({
    cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

const lang = require(`${app.getAppPath()}/langs/${userConfig.get('language') != undefined ? userConfig.get('language') : 'ja'}.js`);
const { loadFilters } = require('./AdBlocker');

const Datastore = require('nedb');

let floatingWindows = [];

module.exports = class WindowManager {

    constructor(defualtConfig) {
        this.windows = new Map();

        this.defualtConfig = defualtConfig;
        this.firebase = new Firebase(defualtConfig);

        this.db = {};
        this.db.pageSettings = new Datastore({
            filename: path.join(app.getPath('userData'), 'Users', config.get('currentUser'), 'PageSettings.db'),
            autoload: true,
            timestampData: true
        });
        this.db.favicons = new Datastore({
            filename: path.join(app.getPath('userData'), 'Files', 'Favicons.db'),
            autoload: true,
            timestampData: true
        });

        this.db.historys = new Datastore({
            filename: path.join(app.getPath('userData'), 'Users', config.get('currentUser'), 'History.db'),
            autoload: true,
            timestampData: true
        });
        this.db.downloads = new Datastore({
            filename: path.join(app.getPath('userData'), 'Users', config.get('currentUser'), 'Download.db'),
            autoload: true,
            timestampData: true
        });
        this.db.bookmarks = new Datastore({
            filename: path.join(app.getPath('userData'), 'Users', config.get('currentUser'), 'Bookmarks.db'),
            autoload: true,
            timestampData: true
        });

        this.db.apps = new Datastore({
            filename: path.join(app.getPath('userData'), 'Users', config.get('currentUser'), 'Apps.db'),
            autoload: true,
            timestampData: true
        });

        if (userConfig.get('design.theme') === -1)
            nativeTheme.themeSource = 'system';
        else if (userConfig.get('design.theme') === 0)
            nativeTheme.themeSource = 'light';
        else if (userConfig.get('design.theme') === 1)
            nativeTheme.themeSource = 'dark';

        this.currentWindow = null;

        ipcMain.on('window-add', (e, args) => {
            this.addWindow(args.isPrivate);
        });

        ipcMain.on('feedbackWindow-open', (e, args) => {
            this.addAppWindow(`${protocolStr}://feedback/`, 550, 430, false);
        });

        ipcMain.on('appWindow-add', (e, args) => {
            this.addAppWindow(args.url);
        });

        ipcMain.on('window-fixBounds', (e, args) => {
            this.windows.forEach((value, key) => value.window.fixBounds());
        });

        ipcMain.on('window-change-settings', (e, args) => {
            this.windows.forEach((value, key) => {
                value.window.webContents.send('window-change-settings', {});
                value.window.fixBounds();
            })
        });

        ipcMain.on('update-filters', (e, args) => {
            loadFilters(true);
        });

        /*
         * ブックマーク・履歴・ダウンロード
         */
        ipcMain.on(`data-bookmark-add`, (e, args) => {
            const { title, url, isFolder, isPrivate } = args;

            isFolder ? this.firebase.addBookmark(title, url, null, isFolder, isPrivate) : this.getFavicon().then((favicon) => this.firebase.addBookmark(title, url, favicon, isFolder, isPrivate));
        });

        ipcMain.on(`data-bookmark-remove`, (e, args) => {
            this.firebase.removeBookmark(args.url, args.isPrivate);
        });

        ipcMain.on('data-bookmarks-get', (e, args) => {
            isOnline().then((result) => {
                if (result) {
                    this.firebase.getBookmarks(args.isPrivate)
                        .then((items) => {
                            let datas = [];
                            items.forEach((item, i) => datas.push({ id: item.id, title: item.data().title, url: item.data().url, favicon: item.data().favicon, isFolder: item.data().isFolder, createdAt: item.data().date.toDate() }));
                            e.sender.send('data-bookmarks-get', { bookmarks: datas });
                        })
                        .catch((err) => {
                            console.log(`Test: ${err}`);
                            this.db.bookmarks.find({ isPrivate: args.isPrivate }).sort({ createdAt: -1 }).exec((err, docs) => {
                                e.sender.send('data-bookmarks-get', { bookmarks: docs });
                            });
                        });
                } else {
                    console.log(`Offline Mode`);
                    this.db.bookmarks.find({ isPrivate: args.isPrivate }).sort({ createdAt: -1 }).exec((err, docs) => {
                        e.sender.send('data-bookmarks-get', { bookmarks: docs });
                    });
                }
            });
        });

        ipcMain.on('data-bookmarks-clear', (e, args) => {
            this.db.bookmarks.remove({}, { multi: true });
        });

        ipcMain.on('data-history-get', (e, args) => {
            isOnline().then((result) => {
                if (result) {
                    this.firebase.getHistorys()
                        .then((items) => {
                            let datas = [];
                            items.forEach((item, i) => datas.push({ title: item.data().title, url: item.data().url, favicon: item.data().favicon, createdAt: item.data().date.toDate() }));
                            e.sender.send('data-history-get', { historys: datas });
                        })
                        .catch((err) => {
                            console.log(`Test: ${err}`);
                            this.db.historys.find({}).sort({ createdAt: -1 }).exec((err, docs) => {
                                e.sender.send('data-history-get', { historys: docs });
                            });
                        });
                } else {
                    console.log(`Offline Mode`);
                    this.db.historys.find({}).sort({ createdAt: -1 }).exec((err, docs) => {
                        e.sender.send('data-history-get', { historys: docs });
                    });
                }
            });
        });

        ipcMain.on('data-history-clear', (e, args) => {
            this.firebase.clearHistorys();
            this.db.historys.remove({}, { multi: true });
        });

        ipcMain.on('data-downloads-get', (e, args) => {
            this.db.downloads.find({}).sort({ createdAt: -1 }).exec((err, docs) => {
                e.sender.send('data-downloads-get', { downloads: docs });
            });
        });

        ipcMain.on('data-downloads-clear', (e, args) => {
            this.db.downloads.remove({}, { multi: true });
        });

        /*
         * アプリ
         */
        ipcMain.on('data-apps-add', (e, args) => {
            this.db.apps.update({ id: args.id }, { id: args.id, name: args.name, description: args.description, url: args.url }, { upsert: true });

            this.db.apps.find({}).sort({ createdAt: -1 }).exec();
        });

        ipcMain.on('data-apps-remove', (e, args) => {
            this.db.apps.remove({ id: args.id }, {});
        });

        ipcMain.on('data-apps-get', (e, args) => {
            this.db.apps.find({}).sort({ createdAt: -1 }).exec((err, docs) => {
                e.sender.send('data-apps-get', { apps: docs });
            });
        });

        ipcMain.on('data-apps-is', (e, args) => {
            this.db.apps.find({ id: args.id }).exec((err, docs) => {
                e.sender.send('data-apps-is', { id: args.id, isInstalled: (docs.length > 0 ? true : false) });
            });
        });

        ipcMain.on('data-apps-clear', (e, args) => {
            this.db.apps.remove({}, { multi: true });
        });

        ipcMain.on('clear-browsing-data', () => {
            const ses = session.defaultSession;

            ses.clearCache();
            ses.clearStorageData({
                storages: [
                    'appcache',
                    'cookies',
                    'filesystem',
                    'indexdb',
                    'localstorage',
                    'shadercache',
                    'websql',
                    'serviceworkers',
                    'cachestorage',
                ]
            });

            config.clear();
            userConfig.clear();
            this.db.favicons.remove({}, { multi: true });
            this.db.pageSettings.remove({}, { multi: true });

            this.db.bookmarks.remove({}, { multi: true });
            this.db.historys.remove({}, { multi: true });
            this.db.downloads.remove({}, { multi: true });
            this.db.apps.remove({}, { multi: true });
        });

        this.updateDatabases();
    }

    getWindows = () => {
        return this.windows;
    }

    getCurrentWindow = () => {
        return this.currentWindow;
    }

    addWindow = (isPrivate = false, urls = (userConfig.get('startUp.isDefaultHomePage') ? [`${protocolStr}://home/`] : userConfig.get('startUp.defaultPages'))) => {
        const window = new MainWindow(this, this.defualtConfig, isPrivate, this.db, urls);
        const id = window.id;

        !isPrivate ? this.loadSessionAndProtocol() : this.loadSessionAndProtocolWithPrivateMode(window.getWindowId());

        this.windows.set(id, { window, isPrivate });
        window.on('closed', () => this.windows.delete(id));

        return window;
    }

    addAppWindow = (url = userConfig.get('homePage.defaultPage'), width = userConfig.get('window.bounds').width, height = userConfig.get('window.bounds').height, resizable = true) => {
        this.loadSessionAndProtocol();

        const { x, y } = userConfig.get('window.bounds');
        const window = this.getBaseWindow(resizable && userConfig.get('window.isMaximized') ? 1110 : width, resizable && userConfig.get('window.isMaximized') ? 680 : height, 500, 360, x, y, !userConfig.get('design.isCustomTitlebar'), resizable, resizable, resizable);
        const id = window.id;

        resizable && userConfig.get('window.isMaximized') && window.maximize();

        const startUrl = format({
            pathname: path.join(__dirname, '/../build/index.html'),
            protocol: 'file:',
            slashes: true,
            hash: `/app/${id}/${encodeURIComponent(url)}`,
        });

        window.loadURL(startUrl);

        window.once('ready-to-show', () => window.show());
        window.on('focus', () => window.webContents.send(`window-focus-${id}`, {}));
        window.on('blur', () => window.webContents.send(`window-blur-${id}`, {}));
    }

    getFavicon = (url) => {
        return new Promise((resolve, reject) => {
            this.db.favicons.findOne({ url }, async (err, doc) => {
                const parsed = parse(url);
                resolve(url.startsWith(`${protocolStr}://`) || url.startsWith(`${fileProtocolStr}://`) ? undefined : (doc != undefined ? doc.favicon : `https://www.google.com/s2/favicons?domain=${parsed.protocol}//${parsed.hostname}`));
            });
        });
    }

    updateDatabases = () => {
        isOnline().then((result) => {
            if (!result) return;

            this.db.bookmarks.remove({}, { multi: true });
            this.db.historys.remove({}, { multi: true });

            this.firebase.getBookmarks(true)
                .then((items) => {

                    let datas = [];
                    items.forEach((item, i) => datas.push({ url: item.data().url, title: item.data().title, createdAt: item.data().date.toDate() }));
                    console.log(datas);

                    this.db.bookmarks.insert(datas, (err, newDocs) => { });
                })
                .catch((err) => console.log(err));
            this.firebase.getBookmarks(false)
                .then((items) => {
                    let datas = [];
                    items.forEach((item, i) => datas.push({ url: item.data().url, title: item.data().title, createdAt: item.data().date.toDate() }));

                    this.db.bookmarks.insert(datas, (err, newDocs) => { });
                })
                .catch((err) => console.log(err));
            this.firebase.getHistorys()
                .then((items) => {
                    let datas = [];
                    items.forEach((item, i) => datas.push({ url: item.data().url, title: item.data().title, createdAt: item.data().date.toDate() }));

                    this.db.historys.insert(datas, (err, newDocs) => { });
                })
                .catch((err) => console.log(err));
        });
    }

    fixBounds = (window) => {
        if (window.getBrowserViews()[0] == undefined) return;
        const view = window.getBrowserViews()[0];

        const { width, height } = window.getContentBounds();

        view.setAutoResize({ width: true, height: true });
        if (window.getFloatingWindow()) {
            window.setMinimizable(false);
            window.setMaximizable(false);
            window.setAlwaysOnTop(true);
            window.setVisibleOnAllWorkspaces(true);
            view.setBounds({
                x: 1,
                y: 1,
                width: width - 2,
                height: height - 2,
            });
        } else {
            window.setMinimizable(true);
            window.setMaximizable(true);
            window.setAlwaysOnTop(false);
            window.setVisibleOnAllWorkspaces(false);

            if (window.isFullScreen()) {
                view.setBounds({
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                });
            } else {
                view.setBounds({
                    x: window.isMaximized() ? 0 : userConfig.get('design.isCustomTitlebar') ? 1 : 0,
                    y: window.isMaximized() ? this.getHeight(true, height) : userConfig.get('design.isCustomTitlebar') ? this.getHeight(true, height) + 1 : this.getHeight(true, height),
                    width: window.isMaximized() ? width : userConfig.get('design.isCustomTitlebar') ? width - 2 : width,
                    height: window.isMaximized() ? this.getHeight(false, height) : (userConfig.get('design.isCustomTitlebar') ? (this.getHeight(false, height)) - 2 : (this.getHeight(false, height)) - 1),
                });
            }
        }
        view.setAutoResize({ width: true, height: true });
    }

    getHeight = (b, height) => {
        const titleBarHeight = 33;
        const toolBarHeight = 40;

        const baseBarHeight = titleBarHeight + toolBarHeight;
        const bookMarkBarHeight = 28;

        return b ? (userConfig.get('design.isBookmarkBar') ? (baseBarHeight + bookMarkBarHeight) : baseBarHeight) : (height - (userConfig.get('design.isBookmarkBar') ? (baseBarHeight + bookMarkBarHeight) : baseBarHeight));
    }



    getBaseWindow = (width = 1100, height = 680, minWidth = 500, minHeight = 360, x, y, frame = false, resizable = true, minimizable = true, maximizable = true) => {
        return new BrowserWindow({
            width, height, minWidth, minHeight, x, y,
            titleBarStyle: 'hidden',
            frame,
            resizable,
            minimizable,
            maximizable,
            icon: `${__dirname}/static/app/icon.png`,
            fullscreenable: true,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                webviewTag: true,
                plugins: true,
                experimentalFeatures: true,
                contextIsolation: false,
            }
        });
    }

    loadSessionAndProtocol = () => {
        if (!protocol.isProtocolRegistered(protocolStr)) {
            protocol.registerFileProtocol(protocolStr, (request, callback) => {
                const parsed = parse(request.url);

                return callback({
                    path: path.join(app.getAppPath(), 'pages', parsed.pathname === '/' || !parsed.pathname.match(/(.*)\.([A-z0-9])\w+/g) ? `${parsed.hostname}.html` : `${parsed.hostname}${parsed.pathname}`),
                });
            }, (error) => {
                if (error) console.error(`[Error] Failed to register protocol: ${error}`);
            });
        }

        if (!protocol.isProtocolRegistered(fileProtocolStr)) {
            protocol.registerFileProtocol(fileProtocolStr, (request, callback) => {
                const parsed = parse(request.url);

                return callback({
                    path: path.join(app.getPath('userData'), 'Users', config.get('currentUser'), parsed.pathname),
                });
            }, (error) => {
                if (error) console.error(`[Error] Failed to register protocol: ${error}`);
            });
        }
    }

    loadSessionAndProtocolWithPrivateMode = (windowId) => {
        const ses = session.fromPartition(windowId);
        ses.setUserAgent(ses.getUserAgent().replace(/ Electron\/[0-9\.]*/g, '') + ' PrivMode');

        if (!ses.protocol.isProtocolRegistered(protocolStr)) {
            ses.protocol.registerFileProtocol(protocolStr, (request, callback) => {
                const parsed = parse(request.url);

                return callback({
                    path: path.join(app.getAppPath(), 'pages', parsed.pathname === '/' || !parsed.pathname.match(/(.*)\.([A-z0-9])\w+/g) ? `${parsed.hostname}.html` : `${parsed.hostname}${parsed.pathname}`),
                });
            }, (error) => {
                if (error) console.error(`[Error] Failed to register protocol: ${error}`);
            });
        }

        if (!ses.protocol.isProtocolRegistered(fileProtocolStr)) {
            ses.protocol.registerFileProtocol(fileProtocolStr, (request, callback) => {
                const parsed = parse(request.url);

                return callback({
                    path: path.join(app.getPath('userData'), 'Users', config.get('currentUser'), parsed.pathname),
                });
            }, (error) => {
                if (error) console.error(`[Error] Failed to register protocol: ${error}`);
            });
        }
    }
}