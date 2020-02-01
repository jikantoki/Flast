const { app, ipcMain, protocol, session, BrowserWindow, BrowserView, Menu, nativeImage, clipboard, dialog, Notification, systemPreferences } = require('electron');
const { isAbsolute, extname, resolve, join, dirname } = require('path');
const { existsSync, readdirSync } = require('fs');
const url = require('url');
const os = require('os');

const { isURL, prefixHttp } = require('./URL');

const pkg = require(`${app.getAppPath()}/package.json`);
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const { autoUpdater } = require('electron-updater');

const { ExtensibleSession } = require('electron-extensions/main');
const cfg = require('./Config');

const Config = require('electron-store');
const config = new Config({
    defaults: {
        profile: {
            id: '',
            name: '',
            address: '',
            token: '',
            refresh: ''
        },
        design: {
            isHomeButton: false,
            isBookmarkBar: false,
            theme: -1,
            tabAccentColor: '#0a84ff',
            isCustomTitlebar: true
        },
        homePage: {
            homeButton: {
                isDefaultHomePage: true,
                defaultPage: `${protocolStr}://home`
            },
            newTab: {
                isDefaultHomePage: true,
                defaultPage: `${protocolStr}://home`
            },
            homePage: {
                backgroundType: 0,
                backgroundImage: ''
            }
        },
        startUp: {
            isDefaultHomePage: true,
            defaultPages: ['flast://home']
        },
        searchEngine: {
            defaultEngine: 'Google',
            searchEngines: [
                {
                    name: 'Google',
                    url: 'https://www.google.com/search?q=%s'
                },
                {
                    name: 'Bing',
                    url: 'https://www.bing.com/search?q=%s'
                },
                {
                    name: 'Yahoo! Japan',
                    url: 'https://search.yahoo.co.jp/search?p=%s'
                },
                {
                    name: 'goo',
                    url: 'https://search.goo.ne.jp/web.jsp?MT=%s'
                },
                {
                    name: 'OCN',
                    url: 'https://search.goo.ne.jp/web.jsp?MT=%s'
                },
                {
                    name: 'Baidu',
                    url: 'https://www.baidu.com/s?wd=%s'
                },
                {
                    name: 'Google Translate',
                    url: 'https://translate.google.com/?text=%s'
                },
                {
                    name: 'Youtube',
                    url: 'https://www.youtube.com/results?search_query=%s'
                },
                {
                    name: 'NicoVideo',
                    url: 'https://www.nicovideo.jp/search/%s'
                },
                {
                    name: 'Twitter',
                    url: 'https://www.twitter.com/search?q=%s'
                },
                {
                    name: 'GitHub',
                    url: 'https://github.com/search?q=%s'
                },
                {
                    name: 'DuckDuckGo',
                    url: 'https://duckduckgo.com/?q=%s'
                },
                {
                    name: 'Yahoo',
                    url: 'https://search.yahoo.com/search?p=%s'
                },
                {
                    name: 'Amazon',
                    url: 'https://www.amazon.co.jp/s?k=%s'
                }
            ]
        },
        pageSettings: {
            defaultZoomSize: 1,
            media: {
                video: -1,
                audio: -1,
            },
            geolocation: -1,
            notifications: -1,
            midiSysex: -1,
            pointerLock: -1,
            fullscreen: 1,
            openExternal: -1,
            pages: {
                twitter: {
                    url: 'https://twitter.com/*',
                    oldDesign: false,
                    oldDesignIgnore: false
                }
            }
        },
        adBlock: {
            isAdBlock: true,
            disabledSites: []
        },
        language: 'ja',
        window: {
            isCloseConfirm: true,
            isMaximized: false,
            bounds: {
                width: 1100,
                height: 680
            }
        },
        meta: {
            version: '1.0.0'
        }
    },
});

const lang = require(`${app.getAppPath()}/langs/${config.get('language') != undefined ? config.get('language') : 'ja'}.js`);

const WindowManager = require('./WindowManager');
const windowManager = new WindowManager();

const Firebase = require('./Firebase');

const singleInstance = app.requestSingleInstanceLock();

let loginCallback;
let mainWindow;
let subWindow;

getBaseWindow = (width = 1100, height = 680, minWidth = 500, minHeight = 360, x, y, frame = false) => {
    return new BrowserWindow({
        width, height, minWidth, minHeight, x, y, 'titleBarStyle': 'hidden', frame, fullscreenable: true,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true,
            plugins: true,
            experimentalFeatures: true,
            contextIsolation: false,
        }
    });
}

module.exports = class Application {

    loadApplication = () => {
        protocol.registerSchemesAsPrivileged([
            { scheme: protocolStr, privileges: { standard: true, bypassCSP: true, secure: true } },
            { scheme: fileProtocolStr, privileges: { standard: false, bypassCSP: true, secure: true } }
        ]);

        this.updateStatus = 'not-available';

        autoUpdater.on('checking-for-update', () => {
            console.log('Checking for update...');

            this.updateStatus = 'checking';

            console.log(this.updateStatus);
        });
        autoUpdater.on('update-available', (info) => {
            console.log('Update available.');

            this.updateStatus = 'available';

            console.log(this.updateStatus);
        });
        autoUpdater.on('update-not-available', (info) => {
            console.log('Update not available.');

            this.updateStatus = 'not-available';

            console.log(this.updateStatus);
        });
        autoUpdater.on('error', (err) => {
            console.log('Error in auto-updater. ' + err);

            this.updateStatus = 'error';

            console.log(this.updateStatus);
        });
        autoUpdater.on('download-progress', (progressObj) => {
            console.log('Download speed: ' + progressObj.bytesPerSecond + ' - Downloaded ' + progressObj.percent + '% (' + progressObj.transferred + "/" + progressObj.total + ')');

            this.updateStatus = 'downloading';

            console.log(this.updateStatus);
        });
        autoUpdater.on('update-downloaded', (info) => {
            console.log('Update downloaded.');

            this.updateStatus = 'downloaded';

            console.log(this.updateStatus);
        });

        ipcMain.on('app-updateStatus', (e, args) => {
            console.log(this.updateStatus);
            e.sender.send('app-updateStatus', { result: this.updateStatus });
        });

        const firebase = new Firebase();
        firebase.login();

        ipcMain.on('sync-account', (e, args) => {
            const id = firebase.syncAccount(args.id);
            e.sender.send('sync-account', { id });
        });

        if (!singleInstance) {
            app.quit();
        } else {
            app.on('second-instance', async (e, argv) => {
                const path = argv[argv.length - 1];

                if (isAbsolute(path) && existsSync(path)) {
                    if (process.env.ENV !== 'dev') {
                        const ext = extname(path);

                        if (ext === '.html' || ext === '.htm') {
                            if (BrowserWindow.getAllWindows().length < 1 || windowManager.getCurrentWindow() == null) {
                                windowManager.addWindow(false, [`file:///${path}`]);
                            } else {
                                const window = windowManager.getWindows().get(windowManager.getCurrentWindow().id).window;
                                window.addView(`file:///${path}`, false);
                                window.show();
                            }
                        }
                    }
                    return;
                } else if (isURL(path)) {
                    if (BrowserWindow.getAllWindows().length < 1 || windowManager.getCurrentWindow() == null) {
                        windowManager.addWindow(false, [prefixHttp(path)]);
                    } else {
                        const window = windowManager.getWindows().get(windowManager.getCurrentWindow().id).window;
                        window.addView(prefixHttp(path), false);
                        window.show();
                    }
                    return;
                } else {
                    windowManager.addWindow();
                    return;
                }
            });

            app.on('ready', () => {
                process.env.GOOGLE_API_KEY = cfg.googleAPIKey;

                app.setAppUserModelId(pkg.flast_package_id);
                session.defaultSession.setUserAgent(session.defaultSession.getUserAgent().replace(/ Electron\/[A-z0-9-\.]*/g, ''));

                autoUpdater.checkForUpdatesAndNotify();
                Menu.setApplicationMenu(null);

                windowManager.addWindow();
            });

            app.on('window-all-closed', () => {
                if (process.platform !== 'darwin')
                    app.quit();
            });

            app.on('activate', () => {
            });

            /*
            app.on('login', (e, webContents, request, authInfo, callback) => {
                e.preventDefault();
    
                subWindow = getBaseWindow(320, 230, 320, 230);
                // subWindow.setParentWindow(mainWindow);
                subWindow.setMovable(false);
                subWindow.setResizable(false);
                subWindow.setMinimizable(false);
                subWindow.setMaximizable(false);
                const startUrl = process.env.ELECTRON_START_URL || url.format({
                    pathname: join(__dirname, '/../build/index.html'),
                    protocol: 'file:',
                    slashes: true,
                    hash: '/authentication',
                });
    
                subWindow.loadURL(startUrl);
                loginCallback = callback;
            });
    
            ipcMain.on('authorization', (event, arg) => {
                loginCallback(arg.username, arg.password);
                subWindow.close();
            });
            */
        }
    }

    getMainMenu = (windowManager) => {
        return Menu.buildFromTemplate([
            {
                label: lang.main.file.label,
                submenu: [
                    {
                        accelerator: 'CmdOrCtrl+T',
                        label: lang.main.file.newTab,
                        click() {
                            windowManager.getCurrentWindow().addView();
                        }
                    },
                    {
                        accelerator: 'CmdOrCtrl+N',
                        label: lang.main.file.newWindow,
                        click() {
                            windowManager.addWindow();
                        }
                    },
                    {
                        accelerator: 'CmdOrCtrl+Shift+N',
                        label: lang.main.file.openPrivateWindow,
                        click() {
                            windowManager.addWindow(true);
                        }
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.file.savePage,
                        accelerator: 'CmdOrCtrl+S',
                        click: () => {
                            if (windowManager.getCurrentWindow().getBrowserViews()[0] == undefined) return;
                            const view = windowManager.getCurrentWindow().getBrowserViews()[0];

                            dialog.showSaveDialog({
                                defaultPath: `${app.getPath('downloads')}/${view.webContents.getTitle()}.html`,
                                filters: [
                                    { name: 'HTML', extensions: ['htm', 'html'] },
                                    { name: 'All Files', extensions: ['*'] }
                                ]
                            }, (fileName) => {
                                if (fileName === undefined || fileName === null) return;
                                view.webContents.savePage(fileName, 'HTMLComplete', (err) => {
                                    if (!err) console.log('Page Save successfully');
                                });
                            });
                        }
                    },
                    {
                        label: lang.main.file.print,
                        accelerator: 'CmdOrCtrl+P',
                        click: () => {
                            if (windowManager.getCurrentWindow().getBrowserViews()[0] == undefined) return;
                            const view = windowManager.getCurrentWindow().getBrowserViews()[0];

                            view.webContents.print();
                        }
                    },
                    { type: 'separator' },
                    {
                        accelerator: 'CmdOrCtrl+W',
                        label: 'Close tab',
                        click() {
                            windowManager.getCurrentWindow().removeView();
                        }
                    },
                    {
                        accelerator: 'CmdOrCtrl+Shift+W',
                        label: 'Close current window',
                        click() {
                            windowManager.getCurrentWindow().close();
                        }
                    },
                    { type: 'separator' },
                    { role: 'quit' },
                ],
            },
            {
                label: lang.main.edit.label,
                submenu: [
                    {
                        label: lang.main.edit.undo,
                        role: 'undo'
                    },
                    {
                        label: lang.main.edit.redo,
                        role: 'redo'
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.edit.cut,
                        role: 'cut'
                    },
                    {
                        label: lang.main.edit.copy,
                        role: 'copy'
                    },
                    {
                        label: lang.main.edit.paste,
                        role: 'paste'
                    },
                    {
                        label: lang.main.edit.delete,
                        accelerator: 'Delete',
                        role: 'delete'
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.edit.selectAll,
                        role: 'selectAll'
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.edit.find,
                        accelerator: 'CmdOrCtrl+F'
                    }
                ]
            },
            {
                label: lang.main.view.label,
                submenu: [
                    {
                        label: lang.main.view.fullScreen,
                        accelerator: 'F11',
                        click: () => {
                            windowManager.getCurrentWindow().setFullScreen(!windowManager.getCurrentWindow().isFullScreen());
                            windowManager.getCurrentWindow().fixBounds();
                        }
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.view.viewSource,
                        accelerator: 'CmdOrCtrl+U',
                        click: () => {
                            if (windowManager.getCurrentWindow().getBrowserViews()[0] == undefined) return;
                            const view = windowManager.getCurrentWindow().getBrowserViews()[0];

                            windowManager.getCurrentWindow().addView(`view-source:${view.webContents.getURL()}`, true);
                        }
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.view.devTool,
                        accelerator: 'CmdOrCtrl+Shift+I',
                        click: () => {
                            if (windowManager.getCurrentWindow().getBrowserViews()[0] == undefined) return;
                            const view = windowManager.getCurrentWindow().getBrowserViews()[0];

                            if (view.webContents.isDevToolsOpened())
                                view.webContents.closeDevTools();
                            else
                                view.webContents.openDevTools();
                        }
                    },
                    {
                        label: lang.main.view.devTool,
                        accelerator: 'F12',
                        visible: false,
                        click: () => {
                            if (windowManager.getCurrentWindow().getBrowserViews()[0] == undefined) return;
                            const view = windowManager.getCurrentWindow().getBrowserViews()[0];

                            if (view.webContents.isDevToolsOpened())
                                view.webContents.closeDevTools();
                            else
                                view.webContents.openDevTools();
                        }
                    },
                    {
                        label: lang.main.view.devToolWindow,
                        accelerator: 'CmdOrCtrl+Shift+F12',
                        click: () => {
                            windowManager.getCurrentWindow().webContents.openDevTools({ mode: 'detach' });
                        }
                    }
                ]
            },
            {
                label: lang.main.navigate.label,
                submenu: [
                    {
                        label: lang.main.navigate.back,
                        accelerator: 'Alt+Left',
                        click: () => {
                            if (windowManager.getCurrentWindow().getBrowserViews()[0] == undefined) return;
                            const view = windowManager.getCurrentWindow().getBrowserViews()[0];

                            const url = view.webContents.getURL();

                            if (view.webContents.canGoBack())
                                view.webContents.goBack();
                            if (url.startsWith(`${protocolStr}://error`)) {
                                if (view.webContents.canGoBack())
                                    view.webContents.goBack();
                            }
                        }
                    },
                    {
                        label: lang.main.navigate.forward,
                        accelerator: 'Alt+Right',
                        click: () => {
                            if (windowManager.getCurrentWindow().getBrowserViews()[0] == undefined) return;
                            const view = windowManager.getCurrentWindow().getBrowserViews()[0];

                            const url = view.webContents.getURL();

                            if (view.webContents.canGoForward())
                                view.webContents.goForward();
                            if (url.startsWith(`${protocolStr}://error`)) {
                                if (view.webContents.canGoForward())
                                    view.webContents.goForward();
                            }
                        }
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.navigate.reload,
                        accelerator: 'CmdOrCtrl+R',
                        click: () => {
                            if (windowManager.getCurrentWindow().getBrowserViews()[0] == undefined) return;
                            const view = windowManager.getCurrentWindow().getBrowserViews()[0];

                            if (!view.webContents.isLoadingMainFrame())
                                view.webContents.reload();
                            else
                                view.webContents.stop();
                        }
                    },
                    {
                        label: lang.main.navigate.reload,
                        accelerator: 'F5',
                        visible: false,
                        click: () => {
                            if (windowManager.getCurrentWindow().getBrowserViews()[0] == undefined) return;
                            const view = windowManager.getCurrentWindow().getBrowserViews()[0];

                            if (!view.webContents.isLoadingMainFrame())
                                view.webContents.reload();
                            else
                                view.webContents.stop();
                        }
                    },
                    {
                        label: lang.main.navigate.reloadIgnoringCache,
                        accelerator: 'CmdOrCtrl+Shift+R',
                        click: () => {
                            if (windowManager.getCurrentWindow().getBrowserViews()[0] == undefined) return;
                            const view = windowManager.getCurrentWindow().getBrowserViews()[0];

                            if (!view.webContents.isLoadingMainFrame())
                                view.webContents.reloadIgnoringCache();
                            else
                                view.webContents.stop();
                        }
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.navigate.home,
                        accelerator: 'Alt+Home',
                        click: () => {
                            if (windowManager.getCurrentWindow().getBrowserViews()[0] == undefined) return;
                            const view = windowManager.getCurrentWindow().getBrowserViews()[0];

                            view.webContents.loadURL(config.get('homePage.isDefaultHomePage') ? `${protocolStr}://home/` : config.get('homePage.defaultPage'));
                        }
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.navigate.history,
                        accelerator: 'Ctrl+H',
                        click: () => {
                            if (windowManager.getCurrentWindow().getBrowserViews()[0] == undefined) return;
                            const view = windowManager.getCurrentWindow().getBrowserViews()[0];

                            view.webContents.loadURL(`${protocolStr}://history/`);
                        }
                    },
                    {
                        label: lang.main.navigate.downloads,
                        accelerator: 'Ctrl+D',
                        click: () => {
                            if (windowManager.getCurrentWindow().getBrowserViews()[0] == undefined) return;
                            const view = windowManager.getCurrentWindow().getBrowserViews()[0];

                            view.webContents.loadURL(`${protocolStr}://downloads/`);
                        }
                    },
                    {
                        label: lang.main.navigate.bookmarks,
                        accelerator: 'Ctrl+B',
                        click: () => {
                            if (windowManager.getCurrentWindow().getBrowserViews()[0] == undefined) return;
                            const view = windowManager.getCurrentWindow().getBrowserViews()[0];

                            view.webContents.loadURL(`${protocolStr}://bookmarks/`);
                        }
                    }
                ]
            },
        ]);
    }

    loadExtension = (id) => {
        const extensionDir = resolve(os.homedir(), 'AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions');

        const versions = readdirSync(`${extensionDir}/${id}`).sort();
        const version = versions.pop();

        extensions.loadExtension(`${extensionDir}/${id}/${version}`);
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