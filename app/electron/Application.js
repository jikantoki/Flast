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

const defaultConfig = {
    profile: {
        id: '',
        name: '',
        address: '',
        token: '',
        refresh: ''
    },
    design: {
        isHomeButton: false,
        isBookmarkBar: 0,
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
        filters: [
            {
                name: 'AdBlock Custom Filters',
                url: 'https://cdn.adblockcdn.com/filters/adblock_custom.txt',
                isEnabled: true
            },
            {
                name: 'EasyList',
                url: 'https://easylist-downloads.adblockplus.org/easylist.txt',
                isEnabled: true
            },
            {
                name: 'Acceptable Ads',
                url: 'https://easylist-downloads.adblockplus.org/exceptionrules.txt',
                isEnabled: true
            },
            {
                name: 'Anti-Circumvention Filters',
                url: 'https://easylist-downloads.adblockplus.org/abp-filters-anti-cv.txt',
                isEnabled: true
            },
            {
                name: 'EasyPrivacy (privacy protection)',
                url: 'https://easylist.to/easylist/easyprivacy.txt',
                isEnabled: true
            },
            {
                name: 'JustDomains',
                url: 'http://mirror1.malwaredomains.com/files/justdomains',
                isEnabled: false
            },
            {
                name: 'Adblock Warning Removal list',
                url: 'https://easylist-downloads.adblockplus.org/antiadblockfilters.txt',
                isEnabled: true
            },
            {
                name: 'Antisocial filter list',
                url: 'https://easylist-downloads.adblockplus.org/fanboy-social.txt',
                isEnabled: false
            },
            {
                name: 'Cryptocurrency (Bitcoin) Mining Protection List',
                url: 'https://raw.githubusercontent.com/hoshsadiq/adblock-nocoin-list/master/nocoin.txt',
                isEnabled: false
            },
            {
                name: 'Fanboy\'s Annoyances',
                url: 'https://easylist-downloads.adblockplus.org/fanboy-annoyance.txt',
                isEnabled: false
            },
            {
                name: 'Malware protection',
                url: 'https://easylist-downloads.adblockplus.org/malwaredomains_full.txt',
                isEnabled: true
            },
            {
                name: 'uBlock Origin Filters',
                url: 'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt',
                isEnabled: false
            },
            {
                name: 'uBlock Origin Badware filters',
                url: 'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/badware.txt',
                isEnabled: false
            },
            {
                name: 'uBlock Origin Privacy filters',
                url: 'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/privacy.txt',
                isEnabled: false
            },
            {
                name: 'uBlock Origin Unbreak filters',
                url: 'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/unbreak.txt',
                isEnabled: false
            }
        ],
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
};

const Config = require('electron-store');
const config = new Config({
    defaults: {
        currentUser: '',
        meta: {
            version: '1.0.0'
        }
    }
});
const userConfig = config.get('currentUser') !== '' ? new Config({
    cwd: join(app.getPath('userData'), 'Users', config.get('currentUser')),
    defaults: defaultConfig
}) : undefined;

const lang = require(`${app.getAppPath()}/langs/${userConfig ? userConfig.get('language') != undefined ? userConfig.get('language') : 'ja' : 'ja'}.js`);

const WindowManager = require('./WindowManager');

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

    loadApplication = async () => {
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
        autoUpdater.on('download-progress', (progress) => {
            console.log(`Download speed: ${progress.bytesPerSecond} - Downloaded ${progress.percent}% (${progress.transferred} / ${progressObj.total})`);

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

        const firebase = new Firebase(defaultConfig);
        await firebase.login();

        ipcMain.on('login-account', async (e, args) => {
            e.sender.send('login-account', await firebase.loginAccount(args.email, args.password));
        });

        ipcMain.on('create-account', async (e, args) => {
            e.sender.send('create-account', await firebase.createAccount(args.email, args.password));
        });

        ipcMain.on('logout-account', async (e, args) => {
            e.sender.send('logout-account', await firebase.logout());
        });

        ipcMain.on('update-account', async (e, args) => {
            const result = await firebase.updateAccount(args.email, args.password, args.displayName);
            e.sender.send('update-account', result);
        });

        ipcMain.on('sync-account', (e, args) => {
            const id = firebase.syncAccount(args.id, args.email);
            e.sender.send('sync-account', { id });
        });

        this.windowManager = new WindowManager(defaultConfig);

        if (!singleInstance) {
            app.quit();
        } else {
            app.on('second-instance', async (e, argv) => {
                const path = argv[argv.length - 1];

                if (isAbsolute(path) && existsSync(path)) {
                    if (process.env.ENV !== 'dev') {
                        const ext = extname(path);

                        if (ext === '.html' || ext === '.htm') {
                            if (BrowserWindow.getAllWindows().length < 1 || this.windowManager.getCurrentWindow() == null) {
                                this.windowManager.addWindow(false, [`file:///${path}`]);
                            } else {
                                const window = this.windowManager.getWindows().get(this.windowManager.getCurrentWindow().id).window;
                                window.addView(`file:///${path}`, false);
                                window.show();
                            }
                        }
                    }
                    return;
                } else if (isURL(path)) {
                    if (BrowserWindow.getAllWindows().length < 1 || this.windowManager.getCurrentWindow() == null) {
                        this.windowManager.addWindow(false, [prefixHttp(path)]);
                    } else {
                        const window = this.windowManager.getWindows().get(this.windowManager.getCurrentWindow().id).window;
                        window.addView(prefixHttp(path), false);
                        window.show();
                    }
                    return;
                } else {
                    this.windowManager.addWindow();
                    return;
                }
            });

            app.on('ready', () => {
                process.env.GOOGLE_API_KEY = cfg.googleAPIKey;
                console.log(process.env.GOOGLE_API_KEY);

                app.setAppUserModelId(pkg.flast_package_id);
                session.defaultSession.setUserAgent(session.defaultSession.getUserAgent().replace(/ Electron\/[A-z0-9-\.]*/g, ''));

                autoUpdater.checkForUpdatesAndNotify();
                Menu.setApplicationMenu(null);

                this.windowManager.addWindow();
            });

            app.on('before-quit', async () => {
                await this.windowManager.updateDatabases();
            });
            app.on('window-all-closed', () => {
                if (process.platform !== 'darwin')
                    app.quit();
            });
        }
    }

    loadExtension = (id) => {
        const extensionDir = resolve(os.homedir(), 'AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions');

        const versions = readdirSync(`${extensionDir}/${id}`).sort();
        const version = versions.pop();

        extensions.loadExtension(`${extensionDir}/${id}/${version}`);
    }

    getDefaultConfig = () => {
        return defaultConfig;
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