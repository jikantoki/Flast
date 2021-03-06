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

const Config = require('electron-store');
const config = new Config();

const lang = require(`${app.getAppPath()}/langs/${config.get('language') != undefined ? config.get('language') : 'ja'}.js`);
const { loadFilters } = require('./AdBlocker');

const Datastore = require('nedb');
let db = {};
db.pageSettings = new Datastore({
    filename: path.join(app.getPath('userData'), 'Files', 'PageSettings.db'),
    autoload: true,
    timestampData: true
});
db.favicons = new Datastore({
    filename: path.join(app.getPath('userData'), 'Files', 'Favicons.db'),
    autoload: true,
    timestampData: true
});

db.historys = new Datastore({
    filename: path.join(app.getPath('userData'), 'Files', 'History.db'),
    autoload: true,
    timestampData: true
});
db.downloads = new Datastore({
    filename: path.join(app.getPath('userData'), 'Files', 'Download.db'),
    autoload: true,
    timestampData: true
});
db.bookmarks = new Datastore({
    filename: path.join(app.getPath('userData'), 'Files', 'Bookmarks.db'),
    autoload: true,
    timestampData: true
});

db.apps = new Datastore({
    filename: path.join(app.getPath('userData'), 'Files', 'Apps.db'),
    autoload: true,
    timestampData: true
});

let floatingWindows = [];

getBaseWindow = (width = 1100, height = 680, minWidth = 500, minHeight = 360, x, y, frame = false) => {
    return new BrowserWindow({
        width, height, minWidth, minHeight, x, y, titleBarStyle: 'hidden', frame, fullscreenable: true,
        icon: `${__dirname}/static/app/icon.png`,
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

module.exports = class WindowManager {
    constructor() {
        this.windows = new Map();

        this.firebase = new Firebase();

        if (config.get('design.theme') === -1)
            nativeTheme.themeSource = 'system';
        else if (config.get('design.theme') === 0)
            nativeTheme.themeSource = 'light';
        else if (config.get('design.theme') === 1)
            nativeTheme.themeSource = 'dark';

        this.currentWindow = null;

        ipcMain.on('window-add', (e, args) => {
            this.addWindow(args.isPrivate);
        });

        ipcMain.on('appWindow-add', (e, args) => {
            this.addAppWindow(args.url);
        });

        ipcMain.on('window-fixBounds', (e, args) => {
            this.windows.forEach((value, key) => {
                value.window.fixBounds();
            });
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

        ipcMain.on('data-history-get', (e, args) => {
            this.firebase.getHistorys().then((items) => {
                let datas = [];
                items.forEach((item, i) => {
                    datas.push({ url: item.data().url, title: item.data().title, createdAt: item.data().date.toDate() });
                });
                e.sender.send('data-history-get', { historys: datas });
            });
            /*
            db.historys.find({}).sort({ createdAt: -1 }).exec((err, docs) => {
                e.sender.send('data-history-get', { historys: docs });
            });
            */
        });

        ipcMain.on('data-history-clear', (e, args) => {
            this.firebase.clearHistorys();
            // db.historys.remove({}, { multi: true });
        });

        ipcMain.on('data-downloads-get', (e, args) => {
            db.downloads.find({}).sort({ createdAt: -1 }).exec((err, docs) => {
                e.sender.send('data-downloads-get', { downloads: docs });
            });
        });

        ipcMain.on('data-downloads-clear', (e, args) => {
            db.downloads.remove({}, { multi: true });
        });

        ipcMain.on('data-bookmarks-get', (e, args) => {
            this.firebase.getBookmarks(args.isPrivate).then((items) => {
                let datas = [];
                items.forEach((item, i) => {
                    datas.push({ url: item.data().url, title: item.data().title, createdAt: item.data().date.toDate() });
                });
                e.sender.send('data-bookmarks-get', { bookmarks: datas });
            });

            /*
            db.bookmarks.find({ isPrivate: args.isPrivate }).sort({ createdAt: -1 }).exec((err, docs) => {
                e.sender.send('data-bookmarks-get', { bookmarks: docs });
            });
            */
        });

        ipcMain.on('data-bookmarks-clear', (e, args) => {
            db.bookmarks.remove({}, { multi: true });
        });

        ipcMain.on('data-apps-add', (e, args) => {
            db.apps.update({ id: args.id }, { id: args.id, name: args.name, description: args.description, url: args.url }, { upsert: true });

            db.apps.find({}).sort({ createdAt: -1 }).exec();
        });

        ipcMain.on('data-apps-remove', (e, args) => {
            db.apps.remove({ id: args.id }, {});
        });

        ipcMain.on('data-apps-get', (e, args) => {
            db.apps.find({}).sort({ createdAt: -1 }).exec((err, docs) => {
                e.sender.send('data-apps-get', { apps: docs });
            });
        });

        ipcMain.on('data-apps-is', (e, args) => {
            db.apps.find({ id: args.id }).exec((err, docs) => {
                e.sender.send('data-apps-is', { id: args.id, isInstalled: (docs.length > 0 ? true : false) });
            });
        });

        ipcMain.on('data-apps-clear', (e, args) => {
            db.apps.remove({}, { multi: true });
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
                ],
            });

            config.clear();
            db.pageSettings.remove({}, { multi: true });

            db.historys.remove({}, { multi: true });
            db.downloads.remove({}, { multi: true });
            db.bookmarks.remove({}, { multi: true });
            db.apps.remove({}, { multi: true });
        });
    }

    getWindows = () => {
        return this.windows;
    }

    getCurrentWindow = () => {
        return this.currentWindow;
    }

    addWindow = (isPrivate = false, urls = (config.get('startUp.isDefaultHomePage') ? [`${protocolStr}://home/`] : config.get('startUp.defaultPages'))) => {
        const window = new MainWindow(this, isPrivate, db, urls);
        const id = window.id;

        !isPrivate ? this.loadSessionAndProtocol() : this.loadSessionAndProtocolWithPrivateMode(window.getWindowId());

        this.windows.set(id, { window, isPrivate });
        window.on('closed', () => { this.windows.delete(id); });

        return window;
    }

    addAppWindow = (url = config.get('homePage.defaultPage')) => {
        this.loadSessionAndProtocol();

        const { width, height, x, y } = config.get('window.bounds');
        const window = getBaseWindow(config.get('window.isMaximized') ? 1110 : width, config.get('window.isMaximized') ? 680 : height, 500, 360, x, y, !config.get('design.isCustomTitlebar'));
        const id = window.id;

        config.get('window.isMaximized') && window.maximize();

        const startUrl = process.env.ELECTRON_START_URL || format({
            pathname: path.join(__dirname, '/../build/index.html'), // 警告：このファイルを移動する場合ここの相対パスの指定に注意してください
            protocol: 'file:',
            slashes: true,
            hash: `/app/${id}/${encodeURIComponent(url)}`,
        });

        window.loadURL(startUrl);

        window.once('ready-to-show', () => { window.show(); });

        window.on('focus', () => { window.webContents.send(`window-focus-${id}`, {}); });
        window.on('blur', () => { window.webContents.send(`window-blur-${id}`, {}); });
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
                    x: window.isMaximized() ? 0 : config.get('design.isCustomTitlebar') ? 1 : 0,
                    y: window.isMaximized() ? this.getHeight(true, height) : config.get('design.isCustomTitlebar') ? this.getHeight(true, height) + 1 : this.getHeight(true, height),
                    width: window.isMaximized() ? width : config.get('design.isCustomTitlebar') ? width - 2 : width,
                    height: window.isMaximized() ? this.getHeight(false, height) : (config.get('design.isCustomTitlebar') ? (this.getHeight(false, height)) - 2 : (this.getHeight(false, height)) - 1),
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

        return b ? (config.get('design.isBookmarkBar') ? (baseBarHeight + bookMarkBarHeight) : baseBarHeight) : (height - (config.get('design.isBookmarkBar') ? (baseBarHeight + bookMarkBarHeight) : baseBarHeight));
    }
    

    loadSessionAndProtocol = () => {
        protocol.isProtocolHandled(protocolStr).then((handled) => {
            if (!handled) {
                protocol.registerFileProtocol(protocolStr, (request, callback) => {
                    const parsed = parse(request.url);
    
                    return callback({
                        path: path.join(app.getAppPath(), 'pages', parsed.pathname === '/' || !parsed.pathname.match(/(.*)\.([A-z0-9])\w+/g) ? `${parsed.hostname}.html` : `${parsed.hostname}${parsed.pathname}`),
                    });
                }, (error) => {
                    if (error) console.error(`[Error] Failed to register protocol: ${error}`);
                });
            }
        });
    
        protocol.isProtocolHandled(fileProtocolStr).then((handled) => {
            if (!handled) {
                protocol.registerFileProtocol(fileProtocolStr, (request, callback) => {
                    const parsed = parse(request.url);
    
                    return callback({
                        path: path.join(app.getPath('userData'), 'Files', 'Users', parsed.pathname),
                    });
                }, (error) => {
                    if (error) console.error(`[Error] Failed to register protocol: ${error}`);
                });
            }
        });
    }
    
    loadSessionAndProtocolWithPrivateMode = (windowId) => {
        const ses = session.fromPartition(windowId);
        ses.setUserAgent(ses.getUserAgent().replace(/ Electron\/[0-9\.]*/g, '') + ' PrivMode');
    
        ses.protocol.isProtocolHandled(fileProtocolStr).then((handled) => {
            if (!handled) {
                ses.protocol.registerFileProtocol(protocolStr, (request, callback) => {
                    const parsed = parse(request.url);
    
                    return callback({
                        path: path.join(app.getAppPath(), 'pages', parsed.pathname === '/' || !parsed.pathname.match(/(.*)\.([A-z0-9])\w+/g) ? `${parsed.hostname}.html` : `${parsed.hostname}${parsed.pathname}`),
                    });
                }, (error) => {
                    if (error) console.error(`[Error] Failed to register protocol: ${error}`);
                });
            }
        });
    
        ses.protocol.isProtocolHandled(fileProtocolStr).then((handled) => {
            if (!handled) {
                ses.protocol.registerFileProtocol(fileProtocolStr, (request, callback) => {
                    const parsed = parse(request.url);
    
                    return callback({
                        path: path.join(app.getPath('userData'), 'Files', 'Users', parsed.pathname),
                    });
                }, (error) => {
                    if (error) console.error(`[Error] Failed to register protocol: ${error}`);
                });
            }
        });
    }
}