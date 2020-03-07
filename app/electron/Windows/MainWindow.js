const { app, shell, ipcMain, protocol, session, BrowserWindow, BrowserView, Menu, nativeImage, clipboard, dialog, Notification, nativeTheme } = require('electron');
const { join } = require('path');
const { parse, format } = require('url');
const os = require('os');
const https = require('https');
const http = require('http');

const Firebase = require('../Firebase');

const InfomationWindow = require('./InfomationWindow');
const PermissionWindow = require('./PermissionWindow');
const MenuWindow = require('./MenuWindow');
const AuthenticationWindow = require('./AuthenticationWindow');
const SuggestWindow = require('./SuggestWindow');

const TranslateWindow = require('./TranslateWindow');

const pkg = require(`${app.getAppPath()}/package.json`);
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const { download } = require('electron-dl');
const fetch = require('node-fetch');
const platform = require('electron-platform');
const localShortcut = require('electron-localshortcut');
const isOnline = require('is-online');
const imageDataURI = require('image-data-uri');

const Config = require('electron-store');
const config = new Config();
const userConfig = new Config({
    cwd: join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

const { isURL, prefixHttp } = require('../URL');

const lang = require(`${app.getAppPath()}/langs/${userConfig.get('language') != undefined ? userConfig.get('language') : 'ja'}.js`);
const { runAdblockService, stopAdblockService } = require('../AdBlocker');

module.exports = class MainWindow extends BrowserWindow {

    constructor(application, defaultConfig, isPrivate = false, db, urls = (userConfig.get('startUp.isDefaultHomePage') ? [`${protocolStr}://home/`] : userConfig.get('startUp.defaultPages'))) {
        const { width, height, x, y } = userConfig.get('window.bounds');

        super({
            width: userConfig.get('window.isMaximized') ? 1110 : (width !== undefined ? width : 1110),
            height: userConfig.get('window.isMaximized') ? 680 : (height !== undefined ? height : 680),
            minWidth: 500, minHeight: 360, x, y,
            titleBarStyle: 'hiddenInset',
            frame: !userConfig.get('design.isCustomTitlebar'),
            fullscreenable: true,
            icon: nativeImage.createFromPath(`${__dirname}/static/app/icon.${platform.isWin32 ? 'ico' : 'png'}`),
            show: false,
            webPreferences: {
                nodeIntegration: true,
                webviewTag: true,
                plugins: true,
                experimentalFeatures: true,
                contextIsolation: false,
                enableRemoteModule: true
            }
        });

        this.application = application;

        this.db = db;

        this.firebase = new Firebase(defaultConfig);

        this.views = [];

        this.isModuleWindowFocused = false;
        this.isFullScreenToolbar = false;
        this.isFloatingWindow = false;

        this.tabId = 0;

        this.windowId = (!isPrivate ? `window-${this.id}` : `private-${this.id}`);

        userConfig.get('window.isMaximized') && this.maximize();

        this.infoWindow = new InfomationWindow(this, this.windowId);
        this.permissionWindow = new PermissionWindow(this, this.windowId);
        this.menuWindow = new MenuWindow(this, this.windowId);

        this.suggestWindow = new SuggestWindow(this, this.windowId);
        this.authenticationWindow = new AuthenticationWindow(this, this.windowId);

        this.translateWindow = new TranslateWindow(this, this.windowId);

        const mainMenu = this.getMainMenu(application, this);
        this.setMenu(mainMenu);
        this.setMenuBarVisibility(false);
        this.autoHideMenuBar = true;

        mainMenu.on('menu-will-show', (e) => console.log(e));
        mainMenu.on('menu-will-close', (e) => console.log(e));

        let urlStrings = '';
        urls.map((url, i) => urlStrings += `${encodeURIComponent(url)}($|$)`);

        const startUrl = process.env.ELECTRON_START_URL || format({
            pathname: join(__dirname, '/../../build/index.html'),
            protocol: 'file:',
            slashes: true,
            hash: `/window/${this.windowId}/${urlStrings.substring(0, urlStrings.length - 5)}`,
        });

        this.loadURL(startUrl);

        this.once('ready-to-show', () => this.show());

        const id2 = this.id;
        this.on('closed', () => {
            application.currentWindow = null;

            this.views.map((item) => {
                item.view.destroy();
            });
            application.windows.delete(id2);
        });
        this.on('close', (e) => {
            userConfig.set('window.isMaximized', this.isMaximized());
            userConfig.set('window.bounds', this.getBounds());
        });

        this.on('focus', () => {
            if (!isPrivate)
                application.currentWindow = this;

            this.webContents.send(`window-focus-${this.windowId}`, {});

            this.infoWindow.fixBounds();
            this.permissionWindow.fixBounds();
            this.menuWindow.fixBounds();
            this.suggestWindow.fixBounds();
            this.authenticationWindow.fixBounds();

            this.infoWindow.hide();
            this.menuWindow.hide();
            this.suggestWindow.hide();
            this.translateWindow.hide();
        });
        this.on('blur', () => {
            if (this.isModuleWindowFocused) return;

            this.webContents.send(`window-blur-${this.windowId}`, {});
        });

        this.on('resize', this.resizeWindows);
        this.on('move', this.resizeWindows);

        this.on('maximize', () => {
            this.resizeWindows();

            this.webContents.send(`window-maximized-${this.windowId}`, {});
        });
        this.on('unmaximize', () => {
            this.resizeWindows();

            this.webContents.send(`window-unmaximized-${this.windowId}`, {});
        });

        this.on('restore', this.resizeWindows);
        this.on('enter-full-screen', this.resizeWindows);
        this.on('leave-full-screen', this.resizeWindows);
        this.on('enter-html-full-screen', this.resizeWindows);
        this.on('leave-html-full-screen', this.resizeWindows);

        const ses = !isPrivate ? session.defaultSession : session.fromPartition(this.windowId);

        ses.setPermissionRequestHandler((webContents, permission, callback, details) => {
            const url = parse(webContents.getURL());
            const origin = `${url.protocol}//${url.hostname}`;

            const type = permission === 'media' ? `${permission}_${details.mediaTypes}` : permission;
            const userConfigPath = `pageSettings.${type.replace('_', '.')}`;

            db.pageSettings.findOne({ origin, type }, async (err, doc) => {
                if (doc != undefined) {
                    console.log(doc);
                    return callback(doc.result);
                } else {
                    if (userConfig.get(userConfigPath) === null || userConfig.get(userConfigPath) === -1) {
                        const results = await this.permissionWindow.showWindow(type, webContents.getURL());
                        const { result, isChecked } = results;

                        if (isChecked)
                            db.pageSettings.update({ origin, type }, { origin, type, result }, { upsert: true });

                        callback(result);
                    } else if (userConfig.get(userConfigPath) === 0) {
                        return callback(false);
                    } else if (userConfig.get(userConfigPath) === 1) {
                        return callback(true);
                    }
                }
            });
        });


        this.registerListeners(this.windowId);
    }

    hideWindows = () => {
        this.infoWindow.hide();
        this.permissionWindow.hide();
        this.menuWindow.hide();
        this.suggestWindow.hide();
        this.authenticationWindow.hide();

        this.translateWindow.hide();

        this.fixBounds();
    }

    resizeWindows = () => {
        this.fixBounds();

        this.infoWindow.fixBounds();
        this.permissionWindow.fixBounds();
        this.menuWindow.fixBounds();
        this.suggestWindow.fixBounds();
        this.authenticationWindow.fixBounds();

        this.translateWindow.fixBounds();
    };

    getWindowId = () => {
        return this.windowId;
    }

    getFloatingWindow = () => {
        return this.isFloatingWindow;
    }

    registerListeners = (id) => {

        ipcMain.on(`window-adBlock-${id}`, (e, args) => {
            // this.infoWindow.showWindow('test', 'test', false);
        });


        ipcMain.on(`window-titleBarWindow-${id}`, (e, args) => {

        });

        ipcMain.on(`view-focus-${this.id}`, (e, args) => {
            this.hideWindows();
            this.resizeWindows();
        });


        ipcMain.on(`window-isFullScreen-toolBar-${id}`, (e, args) => {
            e.sender.send(`window-isFullScreen-toolBar-${id}`, { result: this.isFullScreenToolbar });
        });

        ipcMain.on(`window-fullScreen-toolBar-${id}`, (e, args) => {
            this.isFullScreenToolbar = !this.isFullScreenToolbar;
            e.sender.send(`window-fullScreen-toolBar-${id}`, { result: this.isFullScreenToolbar });
        });

        ipcMain.on(`window-isFullScreen-${id}`, (e, args) => {
            e.sender.send(`window-isFullScreen-${id}`, { result: this.isFullScreen() });
        });

        ipcMain.on(`window-fullScreen-${id}`, (e, args) => {
            if (this.isFullScreen())
                this.isFullScreenToolbar = false;
            this.setFullScreen(!this.isFullScreen());
            this.fixBounds();
            e.sender.send(`window-fullScreen-${id}`, { result: this.isFullScreen() });
        });

        ipcMain.on(`window-infoWindow-${id}`, (e, args) => {
            this.infoWindow.hide();
            this.menuWindow.hide();
            this.suggestWindow.hide();
            this.infoWindow.showWindow(args.title, args.description, args.url, args.certificate, args.isButton);
        });

        ipcMain.on(`window-translateWindow-${id}`, (e, args) => {
            this.hideWindows();
            if (!this.translateWindow.isVisible()) {
                this.translateWindow.showWindow(args.url);
            } else {
                this.translateWindow.hide();
            }
        });

        ipcMain.on(`window-menuWindow-${id}`, (e, args) => {
            this.hideWindows();
            if (!this.menuWindow.isVisible()) {
                this.views.filter((view, i) => {
                    if (view.view.webContents.id == args.id) {
                        let webContents = this.views[i].view.webContents;

                        this.menuWindow.showWindow(args.url, webContents.zoomFactor);
                    }
                });
            } else {
                this.menuWindow.hide();
            }
        });

        ipcMain.on(`window-showSuggest-${id}`, (e, args) => {
            this.infoWindow.hide();
            this.permissionWindow.hide();
            this.menuWindow.hide();
            this.authenticationWindow.hide();
            this.suggestWindow.showWindow(args.id, args.text);
        });

        ipcMain.on(`window-hideSuggest-${id}`, (e, args) => {
            this.suggestWindow.hide();
        });

        ipcMain.on(`tab-add-${id}`, (e, args) => {
            this.addView(args.url, args.isActive);
        });

        ipcMain.on(`tab-remove-${id}`, (e, args) => {
            this.removeView(args.id);
        });

        ipcMain.on(`tab-select-${id}`, (e, args) => {
            this.selectView(args.id);
        });

        ipcMain.on(`tab-get-${id}`, (e, args) => {
            args.id != null ? this.getView(args.id) : this.getViews();
        });

        ipcMain.on(`tab-fixed-${id}`, (e, args) => {
            this.views.filter((item, i) => {
                if (item.view.webContents.id === args.id) {
                    let newViews = this.views.concat();
                    newViews[i].isFixed = args.result;
                    this.views = newViews;

                    this.getViews(this.windowId);
                }
            });
        });

        ipcMain.on(`browserView-goBack-${id}`, (e, args) => {
            this.views.filter((item, i) => {
                if (item.view.webContents.id === args.id) {
                    let webContents = item.view.webContents;

                    if (webContents.canGoBack())
                        webContents.goBack();

                    const url = webContents.getURL();
                    if (url.startsWith(`${protocolStr}://error`)) {
                        if (webContents.canGoBack())
                            webContents.goBack();
                    }
                }
            });
        });

        ipcMain.on(`browserView-goForward-${id}`, (e, args) => {
            this.views.filter((item, i) => {
                if (item.view.webContents.id === args.id) {
                    let webContents = item.view.webContents;

                    if (webContents.canGoForward())
                        webContents.goForward();

                    const url = webContents.getURL();
                    if (url.startsWith(`${protocolStr}://error`)) {
                        if (webContents.canGoForward())
                            webContents.goForward();
                    }
                }
            });
        });

        ipcMain.on(`browserView-reload-${id}`, (e, args) => {
            this.views.filter((view, i) => {
                if (view.view.webContents.id == args.id) {
                    let webContents = this.views[i].view.webContents;

                    webContents.reload();
                }
            });
        });

        ipcMain.on(`browserView-stop-${id}`, (e, args) => {
            this.views.filter((view, i) => {
                if (view.view.webContents.id == args.id) {
                    let webContents = this.views[i].view.webContents;

                    webContents.stop();
                }
            });
        });

        ipcMain.on(`browserView-goHome-${id}`, (e, args) => {
            this.views.filter((view, i) => {
                if (view.view.webContents.id == args.id) {
                    let webContents = this.views[i].view.webContents;

                    webContents.loadURL(userConfig.get('homePage.homeButton.isDefaultHomePage') ? `${protocolStr}://home/` : userConfig.get('homePage.homeButton.defaultPage'));
                }
            });
        });

        ipcMain.on(`browserView-loadURL-${id}`, (e, args) => {
            const url = String(args.url);
            const pattern = /^(file:\/\/\S.*)\S*$/;

            this.infoWindow.hide();
            this.suggestWindow.hide();

            this.views.filter((view, i) => {
                if (view.view.webContents.id == args.id) {
                    let webContents = this.views[i].view.webContents;

                    !pattern.test(url) ? webContents.loadURL(url) : webContents.loadFile(url.replace(/^(file:\/\/\/?)/, ''));
                }
            });
        });

        ipcMain.on(`browserView-loadFile-${id}`, (e, args) => {
            this.infoWindow.hide();
            this.suggestWindow.hide();

            this.views.filter((view, i) => {
                if (view.view.webContents.id == args.id) {
                    let webContents = this.views[i].view.webContents;
                    webContents.loadFile(args.url);
                }
            });
        });

        ipcMain.on(`browserView-zoom-${id}`, (e, args) => {
            this.getZoom(args.id);
        });

        ipcMain.on(`browserView-zoomIn-${id}`, (e, args) => {
            this.views.filter((view, i) => {
                if (view.view.webContents.id == args.id) {
                    let webContents = this.views[i].view.webContents;

                    if (webContents.zoomFactor > 4.9) return;

                    webContents.zoomFactor = webContents.zoomFactor + 0.1;
                    this.getZoom(args.id);
                    this.webContents.send(`menuWindow-${this.windowId}`, { url: webContents.getURL(), zoomSize: webContents.zoomFactor });
                }
            });
        });

        ipcMain.on(`browserView-zoomOut-${id}`, (e, args) => {
            this.views.filter((view, i) => {
                if (view.view.webContents.id == args.id) {
                    let webContents = this.views[i].view.webContents;

                    if (webContents.zoomFactor < 0.2) return;

                    webContents.zoomFactor = webContents.zoomFactor - 0.1;
                    this.getZoom(args.id);
                    this.webContents.send(`menuWindow-${this.windowId}`, { url: webContents.getURL(), zoomSize: webContents.zoomFactor });
                }
            });
        });

        ipcMain.on(`browserView-zoomDefault-${id}`, (e, args) => {
            this.views.filter((view, i) => {
                if (view.view.webContents.id == args.id) {
                    let webContents = this.views[i].view.webContents;

                    webContents.zoomFactor = userConfig.get('pageSettings.defaultZoomSize');
                    this.getZoom(args.id);
                    this.webContents.send(`menuWindow-${this.windowId}`, { url: webContents.getURL(), zoomSize: webContents.zoomFactor });
                }
            });
        });

        ipcMain.on(`browserView-audioMute-${id}`, (e, args) => {
            this.views.filter((view, i) => {
                if (view.view.webContents.id == args.id) {
                    let webContents = this.views[i].view.webContents;

                    webContents.audioMuted = !webContents.audioMuted;
                    this.getViews();
                }
            });
        });

        ipcMain.on(`browserView-print-${id}`, (e, args) => {
            this.views.filter((view, i) => {
                if (view.view.webContents.id == args.id) {
                    let webContents = this.views[i].view.webContents;
                    webContents.print();
                }
            });
        });

        ipcMain.on(`browserView-savePage-${id}`, (e, args) => {
            this.views.filter((view, i) => {
                if (view.view.webContents.id == args.id) {
                    let webContents = this.views[i].view.webContents;

                    dialog.showSaveDialog({
                        defaultPath: `${app.getPath('downloads')}/${webContents.getTitle()}.html`,
                        filters: [
                            { name: 'HTML', extensions: ['htm', 'html'] },
                            { name: 'All Files', extensions: ['*'] }
                        ]
                    }, (fileName) => {
                        if (fileName === undefined || fileName === null) return;
                        webContents.savePage(fileName, 'HTMLComplete', (err) => {
                            if (!err) console.log('Page Save successfully');
                        });
                    });
                }
            });
        });

        ipcMain.on(`browserView-viewSource-${id}`, (e, args) => {
            this.views.filter((view, i) => {
                if (view.view.webContents.id == args.id) {
                    let webContents = this.views[i].view.webContents;
                    this.addView(`view-source:${webContents.getURL()}`, true);
                }
            });
        });

        ipcMain.on(`browserView-devTool-${id}`, (e, args) => {
            this.views.filter((view, i) => {
                if (view.view.webContents.id == args.id) {
                    let webContents = this.views[i].view.webContents;

                    if (webContents.isDevToolsOpened())
                        webContents.devToolsWebContents.focus();
                    else
                        webContents.openDevTools();
                }
            });
        });

        ipcMain.on(`suggestWindow-loadURL-${id}`, (e, args) => {
            this.infoWindow.hide();
            this.suggestWindow.hide();

            this.focus();

            this.views.filter((view, i) => {
                if (view.view.webContents.id == args.id) {
                    let webContents = this.views[i].view.webContents;
                    webContents.loadURL(args.url);
                }
            });
        });

        ipcMain.on(`suggestWindow-loadFile-${id}`, (e, args) => {
            this.infoWindow.hide();
            this.suggestWindow.hide();

            this.focus();

            this.views.filter((item, i) => {
                if (item.view.webContents.id == args.id) {
                    let webContents = item.view.webContents;
                    webContents.loadFile(args.url);
                }
            });
        });

        ipcMain.on(`data-bookmark-add-${id}`, (e, args) => {
            this.views.filter((item, i) => {
                if (item.view.webContents.id == args.id) {
                    const view = item.view;

                    this.getFavicon(view.webContents.getURL()).then((favicon) => this.firebase.addBookmark(view.webContents.getTitle(), view.webContents.getURL(), favicon, args.isFolder, args.isPrivate));
                    this.updateViewState(view);
                }
            });
        });

        ipcMain.on(`data-bookmark-remove-${id}`, (e, args) => {
            this.views.filter((item, i) => {
                if (item.view.webContents.id == args.id) {
                    const view = item.view;

                    this.firebase.removeBookmark(view.webContents.getURL(), args.isPrivate);
                    this.updateViewState(view);
                }
            });
        });

        ipcMain.on(`data-bookmark-has-${id}`, (e, args) => {
            this.views.filter((item, i) => {
                if (item.view.webContents.id == args.id) {
                    let view = item.view;

                    this.firebase.isBookmarked(view.webContents.getURL(), args.isPrivate).then((result) => e.sender.send(`data-bookmark-has-${id}`, { isBookmarked: result }));
                    /*
                    this.db.bookmarks.find({ url: view.webContents.getURL(), isPrivate: args.isPrivate }, (err, docs) => e.sender.send(`data-bookmark-has-${id}`, { isBookmarked: (docs.length > 0 ? true : false) }));
                    */
                }
            });
        });
    }

    getFavicon = (url) => {
        return new Promise((resolve, reject) => {
            this.db.favicons.findOne({ url }, async (err, doc) => {
                const parsed = parse(url);
                resolve(url.startsWith(`${protocolStr}://`) || url.startsWith(`${fileProtocolStr}://`) ? undefined : (doc != undefined ? doc.favicon : `https://www.google.com/s2/favicons?domain=${parsed.protocol}//${parsed.hostname}`));
            });
        });
    }

    getZoom = (id) => {
        if (this.isDestroyed()) return;
        this.views.filter((item, i) => {
            if (item.view.webContents.id == id) {
                if (item.view.isDestroyed()) return;
                let webContents = item.view.webContents;

                console.log(webContents.zoomFactor);
                this.webContents.send(`browserView-zoom-${this.windowId}`, { result: webContents.zoomFactor });
                this.webContents.send(`browserView-zoom-menu-${this.windowId}`, { result: webContents.zoomFactor });
            }
        });
    }

    getSearchEngine = () => {
        for (var i = 0; i < userConfig.get('searchEngine.searchEngines').length; i++)
            if (userConfig.get('searchEngine.searchEngines')[i].name === userConfig.get('searchEngine.defaultEngine'))
                return userConfig.get('searchEngine.searchEngines')[i];
        return userConfig.get('searchEngine.searchEngines')[0];
    }

    updateNavigationState = (view) => {
        if (this.isDestroyed() || view.isDestroyed()) return;

        this.webContents.send(`update-navigation-state-${this.windowId}`, {
            id: view.webContents.id,
            canGoBack: view.webContents.canGoBack(),
            canGoForward: view.webContents.canGoForward(),
            isAudioStatus: !view.webContents.audioMuted ? (view.webContents.isCurrentlyAudible() ? 1 : 0) : -1,
        });
    }

    updateViewState = (view, url = undefined) => {
        if (this.isDestroyed() || view.isDestroyed()) return;

        if (url === undefined)
            url = view.webContents.getURL();

        if (url.startsWith(`${protocolStr}://error`)) return;
        this.firebase.isBookmarked(url, String(this.windowId).startsWith('private')).then((result) => {
            this.getFavicon(url).then((favicon) => this.webContents.send(`browserView-load-${this.windowId}`, { id: view.webContents.id, title: view.webContents.getTitle(), url, icon: favicon, color: userConfig.get('design.tabAccentColor'), isAudioPlaying: !view.webContents.isCurrentlyAudible(), isBookmarked: result }));
        });
        /*
        this.db.bookmarks.find({ url, isPrivate: (String(this.windowId).startsWith('private')) }, (err, docs) => {
            this.getFavicon(url).then((favicon) => this.webContents.send(`browserView-load-${this.windowId}`, { id: view.webContents.id, title: view.webContents.getTitle(), url, icon: favicon, color: userConfig.get('design.tabAccentColor'), isAudioPlaying: !view.webContents.isCurrentlyAudible(), isBookmarked: (docs.length > 0 ? true : false) }));
        });
        */
    }

    getColor = (view) => {
        return new Promise((resolve, reject) => {
            if (view !== null && !view.isDestroyed() && view.webContents !== null) {
                view.webContents.executeJavaScript(
                    `(function () {
                        const heads = document.head.children;
                        for (var i = 0; i < heads.length; i++) {
                            if (heads[i].getAttribute('name') === 'theme-color') {
                                return heads[i].getAttribute('content');
                            }
                        } 
                    })()`, false, async (result) => {
                    resolve(result !== null ? result : userConfig.get('design.tabAccentColor'));
                });
            } else {
                reject(new Error('WebContents are not available'));
            }
        });
    }

    fixDragging = () => {
        const bounds = this.getBounds();
        this.setBounds({
            height: bounds.height + 1,
        });
        this.setBounds(bounds);
    }

    fixBounds = () => {
        if (this.getBrowserViews()[0] == undefined) return;
        const view = this.getBrowserViews()[0];

        const { width, height } = this.getContentBounds();

        view.setAutoResize({ width: true, height: true });
        if (this.isFloatingWindow) {
            this.minimizable = false;
            this.maximizable = false;
            this.setAlwaysOnTop(true);
            this.setVisibleOnAllWorkspaces(true);
            view.setBounds({
                x: 1,
                y: 1,
                width: width - 2,
                height: height - 2,
            });
        } else {
            this.minimizable = true;
            this.maximizable = true;
            this.setAlwaysOnTop(false);
            this.setVisibleOnAllWorkspaces(false);

            if (this.isFullScreen()) {
                const toolBarHeight = 40;

                view.setBounds({
                    x: 0,
                    y: this.isFullScreenToolbar ? toolBarHeight : 0,
                    width: width,
                    height: this.isFullScreenToolbar ? height - toolBarHeight : height,
                });
            } else {
                view.setBounds({
                    x: userConfig.get('design.isCustomTitlebar') ? 1 : 0,
                    y: this.isMaximized() ? this.getHeight(true, height) : userConfig.get('design.isCustomTitlebar') ? this.getHeight(true, height) + 1 : this.getHeight(true, height),
                    width: userConfig.get('design.isCustomTitlebar') ? width - 2 : width,
                    height: this.isMaximized() ? this.getHeight(false, height) : (userConfig.get('design.isCustomTitlebar') ? (this.getHeight(false, height)) - 2 : this.getHeight(false, height)),
                });
            }
        }
        view.setAutoResize({ width: true, height: true });
    }

    getHeight = (b, height) => {
        if (this.getBrowserViews()[0] == undefined) return;
        const view = this.getBrowserViews()[0];

        const titleBarHeight = 33;
        const toolBarHeight = 40;

        const baseBarHeight = titleBarHeight + toolBarHeight;
        const bookMarkBarHeight = 32;

        const isBookmarkBar = userConfig.get('design.isBookmarkBar') === 1 || userConfig.get('design.isBookmarkBar') === 0 && view.webContents.getURL().startsWith(`${protocolStr}://home/`);

        return b ? (isBookmarkBar ? (baseBarHeight + bookMarkBarHeight) : baseBarHeight) : (height - (isBookmarkBar ? (baseBarHeight + bookMarkBarHeight) : baseBarHeight));
    }

    getDomain = (url) => {
        let hostname = url;

        if (hostname.indexOf('http://') !== -1 || hostname.indexOf('https://') !== -1)
            hostname = hostname.split('://')[1];
        if (hostname.indexOf('?') !== -1)
            hostname = hostname.split('?')[0];

        hostname = hostname.indexOf('://') !== -1 ? `${hostname.split('://')[0]}://${hostname.split('/')[2]}` : hostname.split('/')[0];

        return hostname;
    }

    getCertificate = (url) => {
        return new Promise((resolve, reject) => {
            if (url.startsWith(`${protocolStr}://`) || url.startsWith(`${fileProtocolStr}://`)) {
                return resolve({ type: url.startsWith(`${protocolStr}://home`) || url.startsWith(`${protocolStr}://home2`) ? 'Search' : 'Internal' });
            } else if (url.startsWith('view-source:')) {
                return resolve({ type: 'Source' });
            } else if (url.startsWith('file://')) {
                return resolve({ type: 'File' });
            } else if (url.startsWith('https://')) {
                const domain = this.getDomain(url);

                let options = {
                    host: domain,
                    port: 443,
                    method: 'GET'
                };

                let req = https.request(options, (res) => {
                    let certificate = res.connection.getPeerCertificate();
                    if (certificate.subject == null) return;

                    console.log(certificate);

                    resolve({ type: 'Secure', certificate });
                });

                req.end();
            } else if (url.startsWith('http://')) {
                return resolve({ type: 'InSecure' });
            }
        });
    }

    addView = (url = userConfig.get('homePage.newTab.defaultPage'), isActive = true) => {
        if (String(this.windowId).startsWith('private'))
            this.loadSessionAndProtocolWithPrivateMode(this.windowId);

        this.addTab(url, isActive);
    }

    removeView = () => {
        this.removeView(this.tabId);
    }

    removeView = (id) => {
        this.views.filter((item, i) => {
            if (item.view.webContents.id == id) {
                const index = i;

                if (index + 1 < this.views.length) {
                    this.selectView2(index + 1);
                } else if (index - 1 >= 0) {
                    this.selectView2(index - 1);
                }

                this.views[index].view.destroy();
                this.views.splice(index, 1);
            }
        });
    }

    selectView = (id) => {
        this.views.filter((item, i) => {
            if (item.view.webContents.id == id) {
                this.tabId = id;

                this.setBrowserView(item.view);
                this.setTitle(`${item.view.webContents.getTitle()} - ${pkg.name}`);

                this.updateNavigationState(item.view);
                this.updateViewState(item.view);

                this.webContents.send(`tab-select-${this.windowId}`, { id });

                this.infoWindow.hide();
                this.permissionWindow.hide();
                this.menuWindow.hide();
                this.suggestWindow.hide();
                this.authenticationWindow.hide();

                this.menuWindow.destroy();
                this.menuWindow = new MenuWindow(this, this.windowId, id);
                this.fixBounds();
            }
        });
    }

    selectView2 = (i) => {
        const item = this.views[i];

        this.tabId = item.id;

        this.setBrowserView(item.view);
        this.setTitle(`${item.view.webContents.getTitle()} - ${pkg.name}`);

        this.updateNavigationState(item.view);
        this.updateViewState(item.view);

        this.webContents.send(`tab-select-${this.windowId}`, { id: item.id });

        this.infoWindow.hide();
        this.permissionWindow.hide();
        this.menuWindow.hide();
        this.suggestWindow.hide();
        this.authenticationWindow.hide();

        this.menuWindow.destroy();
        this.menuWindow = new MenuWindow(this, this.windowId, item.id);
        this.fixBounds();
    }

    getView = (id) => {
        this.views.filter((item, i) => {
            if (id == item.view.webContents.id) {
                const url = item.view.webContents.getURL();

                this.getFavicon(url).then(favicon => {
                    const view = { id: item.view.webContents.id, title: item.view.webContents.getTitle(), url, icon: favicon, color: userConfig.get('design.tabAccentColor'), isAudioStatus: !item.view.webContents.audioMuted ? (item.view.webContents.isCurrentlyAudible() ? 1 : 0) : -1, isFixed: item.isFixed, isBookmarked: false };
                    this.webContents.send(`tab-get-${this.windowId}`, { id, view });
                });
            }
        });
    }

    getViews = () => {
        let datas = [];

        this.views.map((item) => {
            const url = item.view.webContents.getURL();

            datas.push({ id: item.view.webContents.id, title: item.view.webContents.getTitle(), url, icon: undefined, color: userConfig.get('design.tabAccentColor'), isAudioStatus: !item.view.webContents.audioMuted ? (item.view.webContents.isCurrentlyAudible() ? 1 : 0) : -1, isFixed: item.isFixed, isBookmarked: false });
        });

        this.webContents.send(`tab-get-${this.windowId}`, { views: datas });


        this.views.map((item) => {
            const url = item.view.webContents.getURL();

            this.getFavicon(url).then(favicon => {
                const view = { id: item.view.webContents.id, title: item.view.webContents.getTitle(), url, icon: favicon, color: userConfig.get('design.tabAccentColor'), isAudioStatus: !item.view.webContents.audioMuted ? (item.view.webContents.isCurrentlyAudible() ? 1 : 0) : -1, isFixed: item.isFixed, isBookmarked: false };
                this.webContents.send(`tab-get-${this.windowId}`, { id: item.view.webContents.id, view });
            });
        });
    }

    addTab = (url = userConfig.get('homePage.newTab.defaultPage'), isActive = true) => {
        const view = new BrowserView({
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: false,
                plugins: true,
                experimentalFeatures: true,
                safeDialogs: true,
                safeDialogsMessage: '今後このページではダイアログを表示しない',
                ...(String(this.windowId).startsWith('private') && { partition: this.windowId }),
                preload: require.resolve('../Preloads/Preload')
            }
        });

        view.webContents.setVisualZoomLevelLimits(1, 3);

        const id = view.webContents.id;
        this.tabId = id;

        const executeJs = this.getRandString(12);
        let viewId = '';

        userConfig.get('adBlock.isAdBlock') ? runAdblockService(view.webContents.session) : stopAdblockService(view.webContents.session);

        view.webContents.on('did-start-loading', () => {
            if (view.isDestroyed()) return;

            this.webContents.send(`browserView-start-loading-${this.windowId}`, { id });

            const isBookmarkBar = userConfig.get('design.isBookmarkBar') === 1 || userConfig.get('design.isBookmarkBar') === 0 && url.startsWith(`${protocolStr}://home/`);
            isBookmarkBar && this.fixBounds();

            isOnline().then((result) => {
                if (result) {
                    this.firebase.getBookmarks(String(this.windowId).startsWith('private'))
                        .then((items) => {
                            let datas = [];
                            items.forEach((item, i) => datas.push({ id: item.id, title: item.data().title, url: item.data().url, favicon: item.data().favicon, isFolder: item.data().isFolder, createdAt: item.data().date.toDate() }));
                            this.webContents.send('window-bookmarks-get', { bookmarks: datas });
                        })
                        .catch((err) => {
                            console.log(`Test: ${err}`);
                            this.db.bookmarks.find({ isPrivate: args.isPrivate }).sort({ createdAt: -1 }).exec((err, docs) => this.webContents.send('window-bookmarks-get', { bookmarks: docs }));
                        });
                } else {
                    console.log(`Offline Mode`);
                    this.db.bookmarks.find({ isPrivate: args.isPrivate }).sort({ createdAt: -1 }).exec((err, docs) => this.webContents.send('window-bookmarks-get', { bookmarks: docs }));
                }
            });
        });
        view.webContents.on('did-stop-loading', () => {
            if (view.isDestroyed()) return;

            this.webContents.send(`browserView-stop-loading-${this.windowId}`, { id });

            const isBookmarkBar = userConfig.get('design.isBookmarkBar') === 1 || userConfig.get('design.isBookmarkBar') === 0 && url.startsWith(`${protocolStr}://home/`);
            isBookmarkBar && this.fixBounds();
        });

        view.webContents.on('did-start-navigation', async (e, url, isInPlace, isMainFrame, processId, routingId) => {
            if (view.isDestroyed()) return;

            this.updateViewState(view);
            this.updateNavigationState(view);

            if (isMainFrame) {
                this.infoWindow.hide();
                this.permissionWindow.hide();
                this.suggestWindow.hide();

                this.updateViewState(view, url);

                if (url.startsWith('https://twitter.com') && !userConfig.get('pageSettings.pages.twitter.oldDesignIgnore')) {
                    const b = userConfig.get('pageSettings.pages.twitter.oldDesign');
                    const result = await this.infoWindow.showWindow('Twitter', 'Twitter の旧デザインが利用できます。\n今すぐ変更しますか？', 'https://twitter.com/', undefined, true);
                    userConfig.set('pageSettings.pages.twitter.oldDesign', result);
                    userConfig.set('pageSettings.pages.twitter.oldDesignIgnore', true);

                    if (result != b) {
                        view.webContents.session.clearStorageData({
                            origin: 'https://twitter.com',
                            storages: [
                                'appcache',
                                'cachestorage',
                            ],
                        });
                        view.webContents.reloadIgnoringCache();
                    }
                } else {
                    this.infoWindow.hide();
                }
            }
        });

        const filter = {
            urls: ['https://twitter.com/*']
        }
        view.webContents.session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
            if (!userConfig.get('pageSettings.pages.twitter.oldDesign')) return callback(details);

            details.requestHeaders['User-Agent'] = 'Internet Explorer 11 (Mozilla/5.0 (Windows NT 9.0; WOW64; Trident/7.0; rv:11.0) like Gecko)';
            return callback({ requestHeaders: details.requestHeaders });
        });

        view.webContents.on('did-finish-load', (e) => {
            if (view.isDestroyed()) return;

            viewId = this.getRandString(12);

            this.getCertificate(view.webContents.getURL()).then((certificate) => this.webContents.send(`browserView-certificate-${this.windowId}`, { id, certificate }));

            this.setTitle(`${view.webContents.getTitle()} - ${pkg.name}`);

            this.updateViewState(view);
            this.updateNavigationState(view);

            this.getZoom(id);
        });
        view.webContents.on('did-fail-load', (e, code, description, url, isMainFrame, processId, routingId) => {
            if (view.isDestroyed() || !isMainFrame || code === -3) return;

            view.webContents.loadURL(`${protocolStr}://error/#${description}/${encodeURIComponent(url)}`);
        });

        view.webContents.on('page-title-updated', (e, title) => {
            if (view.isDestroyed()) return;

            if (!String(this.windowId).startsWith('private') && !(view.webContents.getURL().startsWith(`${protocolStr}://`) || view.webContents.getURL().startsWith(`${fileProtocolStr}://`)))
                this.getFavicon(view.webContents.getURL()).then((favicon) => this.firebase.addHistory(title, view.webContents.getURL(), favicon));

            this.setTitle(`${title} - ${pkg.name}`);

            this.updateViewState(view);
            this.updateNavigationState(view);

            this.getZoom(id);
        });
        view.webContents.on('page-favicon-updated', (e, favicons) => {
            if (view.isDestroyed()) return;

            if (!String(this.windowId).startsWith('private') && !(view.webContents.getURL().startsWith(`${protocolStr}://`) || view.webContents.getURL().startsWith(`${fileProtocolStr}://`))) {
                imageDataURI.encodeFromURL(favicons[0])
                    .then((res) => {
                        this.db.favicons.update({ url: view.webContents.getURL() }, { url: view.webContents.getURL(), favicon: res }, { upsert: true });
                        this.firebase.addHistory(view.webContents.getTitle(), view.webContents.getURL(), res);
                    });
            }

            this.setTitle(`${view.webContents.getTitle()} - ${pkg.name}`);

            this.updateViewState(view);
            this.updateNavigationState(view);

            this.getZoom(id);
        });
        view.webContents.on('did-change-theme-color', (e, color) => {
            if (view.isDestroyed()) return;

            if (!String(this.windowId).startsWith('private') && !(view.webContents.getURL().startsWith(`${protocolStr}://`) || view.webContents.getURL().startsWith(`${fileProtocolStr}://`)))
                this.getFavicon(view.webContents.getURL()).then((favicon) => this.firebase.addHistory(view.webContents.getTitle(), view.webContents.getURL(), favicon));

            this.setTitle(`${view.webContents.getTitle()} - ${pkg.name}`);

            this.updateViewState(view);
            this.updateNavigationState(view);

            this.getZoom(id);

            this.webContents.send(`browserView-theme-color-${this.windowId}`, { id: view.webContents.id, color });
        });

        view.webContents.on('media-started-playing', (e) => {
            this.updateViewState(view);
            this.updateNavigationState(view);

            this.getZoom(id);
        });
        view.webContents.on('media-paused', (e) => {
            this.updateViewState(view);
            this.updateNavigationState(view);

            this.getZoom(id);
        });

        view.webContents.on('update-target-url', (e, url) => {
            /*
            if (url.length > 0) {
                view.webContents.executeJavaScript(
                    `(function () {
                        let dom = document.getElementById('tip-${executeJs}');
                        
                        document.getElementById('tip-${executeJs}').style.display = 'block';
                        dom.textContent = '${url}';
                    })()`
                );
            } else {
                view.webContents.executeJavaScript(
                    `(function () {
                        document.getElementById('tip-${executeJs}').style.display = 'none';
                    })()`
                );
            }
            */
        })

        view.webContents.on('new-window', (e, url, frameName, disposition, options) => {
            if (view.isDestroyed()) return;

            if (disposition === 'new-window') {
                if (frameName === '_self') {
                    e.preventDefault();
                    view.webContents.loadURL(url);
                } else {
                    e.preventDefault();
                    const win = new BrowserWindow({
                        webContents: options.webContents, // 提供されていれば既存の webContents を使う
                        show: false
                    });
                    win.once('ready-to-show', () => win.show());
                    if (!options.webContents)
                        win.loadURL(url);
                    e.newGuest = win;
                }
            } else if (disposition === 'foreground-tab') {
                e.preventDefault();
                this.addView(url, true);
            } else if (disposition === 'background-tab') {
                e.preventDefault();
                this.addView(url, false);
            }
        });

        view.webContents.on('certificate-error', (e, url, error, certificate, callback) => {
            e.preventDefault();
            if (Notification.isSupported()) {
                const notify = new Notification({
                    icon: join(app.getAppPath(), 'static', 'app', 'icon.png'),
                    title: `プライバシー エラー`,
                    body: '詳細はここをクリックしてください。',
                    silent: true
                });

                notify.show();

                notify.on('click', (e) => {
                    dialog.showMessageBox({
                        type: 'warning',
                        title: 'プライバシー エラー',
                        message: 'この接続ではプライバシーが保護されません',
                        detail: `${parse(url).hostname} の証明書を信頼することができませんでした。\n信頼できるページに戻ることをおすすめします。\nこのまま閲覧することも可能ですが安全ではありません。`,
                        noLink: true,
                        buttons: ['続行', 'キャンセル'],
                        defaultId: 1,
                        cancelId: 1
                    }, (res) => {
                        callback(res === 0);
                    });
                });
                notify.on('close', (e) => {
                    callback(false);
                });
            } else {
                dialog.showMessageBox({
                    type: 'warning',
                    title: 'プライバシー エラー',
                    message: 'この接続ではプライバシーが保護されません',
                    detail: `${parse(url).hostname} の証明書を信頼することができませんでした。\n信頼できるページに戻ることをおすすめします。\nこのまま閲覧することも可能ですが安全ではありません。`,
                    noLink: true,
                    buttons: ['続行', 'キャンセル'],
                    defaultId: 1,
                    cancelId: 1
                }, (res) => {
                    callback(res === 0);
                });
            }
        });

        view.webContents.on('login', (e, request, authInfo, callback) => {
            e.preventDefault();

            if (!this.authenticationWindow.isClosed())
                this.authenticationWindow = new AuthenticationWindow(this, this.windowId);
            this.authenticationWindow.showWindow(callback);
        });

        view.webContents.on('context-menu', (e, params) => {
            if (view.isDestroyed()) return;

            let menu;
            if (params.linkURL !== '' && !params.hasImageContents) {
                menu = Menu.buildFromTemplate(
                    [
                        {
                            label: lang.window.view.contextMenu.link.newTab,
                            click: () => { this.addView(params.linkURL, false); }
                        },
                        {
                            label: lang.window.view.contextMenu.link.newWindow,
                            click: () => { this.application.addWindow(false, [params.linkURL]); }
                        },
                        {
                            label: lang.window.view.contextMenu.link.openPrivateWindow,
                            click: () => { this.application.addWindow(true, [params.linkURL]); }
                        },
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.link.copy,
                            icon: `${app.getAppPath()}/static/${this.getThemeType() ? 'dark' : 'light'}/copy.png`,
                            accelerator: 'CmdOrCtrl+C',
                            click: () => {
                                clipboard.clear();
                                clipboard.writeText(params.linkURL);
                            }
                        },
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.devTool,
                            accelerator: 'CmdOrCtrl+Shift+I',
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => {
                                if (view.webContents.isDevToolsOpened())
                                    view.webContents.devToolsWebContents.focus();
                                else
                                    view.webContents.openDevTools();
                            }
                        }
                    ]
                );
            } else if (params.linkURL === '' && params.hasImageContents) {
                menu = Menu.buildFromTemplate(
                    [
                        {
                            label: lang.window.view.contextMenu.image.newTab,
                            click: () => {
                                this.addView(params.srcURL, false);
                            }
                        },
                        {
                            label: lang.window.view.contextMenu.image.saveImage,
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => {
                                view.webContents.downloadURL(params.srcURL);
                            }
                        },
                        {
                            label: lang.window.view.contextMenu.image.copyImage,
                            click: () => {
                                const img = nativeImage.createFromDataURL(params.srcURL);

                                clipboard.clear();
                                clipboard.writeImage(img);
                            }
                        },
                        {
                            label: lang.window.view.contextMenu.image.copyLink,
                            click: () => {
                                clipboard.clear();
                                clipboard.writeText(params.srcURL);
                            }
                        },
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.devTool,
                            accelerator: 'CmdOrCtrl+Shift+I',
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => {
                                if (view.webContents.isDevToolsOpened())
                                    view.webContents.devToolsWebContents.focus();
                                else
                                    view.webContents.openDevTools();
                            }
                        }
                    ]
                );
            } else if (params.linkURL !== '' && params.hasImageContents) {
                menu = Menu.buildFromTemplate(
                    [
                        {
                            label: lang.window.view.contextMenu.link.newTab,
                            click: () => { this.addView(params.linkURL, false); }
                        },
                        {
                            label: lang.window.view.contextMenu.link.newWindow,
                            click: () => { this.application.addWindow(false, [params.linkURL]); }
                        },
                        {
                            label: lang.window.view.contextMenu.link.openPrivateWindow,
                            click: () => { this.application.addWindow(true, [params.linkURL]); }
                        },
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.link.copy,
                            icon: `${app.getAppPath()}/static/${this.getThemeType() ? 'dark' : 'light'}/copy.png`,
                            accelerator: 'CmdOrCtrl+C',
                            click: () => {
                                clipboard.clear();
                                clipboard.writeText(params.linkURL);
                            }
                        },
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.image.newTab,
                            click: () => {
                                this.addView(params.srcURL, false);
                            }
                        },
                        {
                            label: lang.window.view.contextMenu.image.saveImage,
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => {
                                view.webContents.downloadURL(params.srcURL);
                            }
                        },
                        {
                            label: lang.window.view.contextMenu.image.copyImage,
                            click: () => {
                                const img = nativeImage.createFromDataURL(params.srcURL);

                                clipboard.clear();
                                clipboard.writeImage(img);
                            }
                        },
                        {
                            label: lang.window.view.contextMenu.image.copyLink,
                            click: () => {
                                clipboard.clear();
                                clipboard.writeText(params.srcURL);
                            }
                        },
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.devTool,
                            accelerator: 'CmdOrCtrl+Shift+I',
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => {
                                if (view.webContents.isDevToolsOpened())
                                    view.webContents.devToolsWebContents.focus();
                                else
                                    view.webContents.openDevTools();
                            }
                        }
                    ]
                );
            } else if (params.isEditable) {
                menu = Menu.buildFromTemplate(
                    [
                        ...(app.isEmojiPanelSupported() ? [
                            {
                                label: lang.window.view.contextMenu.editable.emotePalette,
                                icon: `${app.getAppPath()}/static/${this.getThemeType() ? 'dark' : 'light'}/emote.png`,
                                click: () => { app.showEmojiPanel(); }
                            },
                            { type: 'separator' }
                        ] : []),
                        {
                            label: lang.window.view.contextMenu.editable.undo,
                            icon: `${app.getAppPath()}/static/${this.getThemeType() ? 'dark' : 'light'}/undo.png`,
                            accelerator: 'CmdOrCtrl+Z',
                            enabled: params.editFlags.canUndo,
                            click: () => { view.webContents.undo(); }
                        },
                        {
                            label: lang.window.view.contextMenu.editable.redo,
                            icon: `${app.getAppPath()}/static/${this.getThemeType() ? 'dark' : 'light'}/redo.png`,
                            accelerator: 'CmdOrCtrl+Y',
                            enabled: params.editFlags.canRedo,
                            click: () => { view.webContents.redo(); }
                        },
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.editable.cut,
                            icon: `${app.getAppPath()}/static/${this.getThemeType() ? 'dark' : 'light'}/cut.png`,
                            accelerator: 'CmdOrCtrl+X',
                            enabled: params.editFlags.canCut,
                            click: () => { view.webContents.cut(); }
                        },
                        {
                            label: lang.window.view.contextMenu.editable.copy,
                            icon: `${app.getAppPath()}/static/${this.getThemeType() ? 'dark' : 'light'}/copy.png`,
                            accelerator: 'CmdOrCtrl+C',
                            enabled: params.editFlags.canCopy,
                            click: () => { view.webContents.copy(); }
                        },
                        {
                            label: lang.window.view.contextMenu.editable.paste,
                            icon: `${app.getAppPath()}/static/${this.getThemeType() ? 'dark' : 'light'}/paste.png`,
                            accelerator: 'CmdOrCtrl+V',
                            enabled: params.editFlags.canPaste,
                            click: () => { view.webContents.paste(); }
                        },
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.editable.selectAll,
                            accelerator: 'CmdOrCtrl+A',
                            enabled: params.editFlags.canSelectAll,
                            click: () => { view.webContents.selectAll(); }
                        },
                        ...(params.editFlags.canCopy ? [
                            { type: 'separator' },
                            {
                                label: String(lang.window.view.contextMenu.selection.textSearch).replace(/{name}/, this.getSearchEngine().name).replace(/{text}/, params.selectionText.replace(/([\n\t])+/g, ' ')),
                                visible: params.editFlags.canCopy && !isURL(params.selectionText.replace(/([\n\t])+/g, ' ')),
                                click: () => {
                                    this.addView(this.getSearchEngine().url.replace('%s', encodeURIComponent(params.selectionText.replace(/([\n\t])+/g, ' '))), true);
                                }
                            },
                            {
                                label: String(lang.window.view.contextMenu.selection.textLoad).replace(/{text}/, params.selectionText.replace(/([\n\t])+/g, '')),
                                visible: params.editFlags.canCopy && isURL(params.selectionText.replace(/([\n\t])+/g, '')),
                                click: () => {
                                    this.addView(params.selectionText.replace(/([\n\t])+/g, ''), true);
                                }
                            }
                        ] : []),
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.devTool,
                            accelerator: 'CmdOrCtrl+Shift+I',
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => {
                                if (view.webContents.isDevToolsOpened())
                                    view.webContents.devToolsWebContents.focus();
                                else
                                    view.webContents.openDevTools();
                            }
                        }
                    ]
                );
            } else if (params.selectionText !== '' && !params.isEditable) {
                menu = Menu.buildFromTemplate(
                    [
                        {
                            label: lang.window.view.contextMenu.selection.copy,
                            accelerator: 'CmdOrCtrl+C',
                            role: 'copy'
                        },
                        {
                            label: String(lang.window.view.contextMenu.selection.textSearch).replace(/{name}/, this.getSearchEngine().name).replace(/{text}/, params.selectionText.replace(/([\n\t])+/g, ' ')),
                            visible: !isURL(params.selectionText.replace(/([\n\t])+/g, ' ')),
                            click: () => {
                                this.addView(this.getSearchEngine().url.replace('%s', encodeURIComponent(params.selectionText.replace(/([\n\t])+/g, ' '))), true);
                            }
                        },
                        {
                            label: String(lang.window.view.contextMenu.selection.textLoad).replace(/{text}/, params.selectionText.replace(/([\n\t])+/g, '')),
                            visible: isURL(params.selectionText.replace(/([\n\t])+/g, '')),
                            click: () => {
                                this.addView(params.selectionText.replace(/([\n\t])+/g, ''), true);
                            }
                        },
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.devTool,
                            accelerator: 'CmdOrCtrl+Shift+I',
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => {
                                view.webContents.isDevToolsOpened() ? view.webContents.devToolsWebContents.focus() : view.webContents.openDevTools();
                            }
                        }
                    ]
                );
            } else {
                menu = Menu.buildFromTemplate(
                    [
                        ...(this.isFullScreen() ? [
                            {
                                label: lang.window.view.contextMenu.fullScreen.fullScreenExit,
                                icon: `${app.getAppPath()}/static/${this.getThemeType() ? 'dark' : 'light'}/fullscreen_exit.png`,
                                accelerator: 'F11',
                                click: () => {
                                    this.setFullScreen(!this.isFullScreen());
                                    this.fixBounds();
                                }
                            },
                            {
                                label: lang.window.view.contextMenu.fullScreen.toolBar,
                                click: () => {
                                    this.isFullScreenToolbar = !this.isFullScreenToolbar;
                                    this.fixBounds();
                                    this.webContents.send(`window-fullScreen-toolBar-${this.windowId}`, { result: this.isFullScreenToolbar });
                                }
                            },
                            { type: 'separator' },
                        ] : []),
                        {
                            label: lang.window.view.contextMenu.back,
                            icon: `${app.getAppPath()}/static/${!view.webContents.canGoBack() ? 'arrow_back_inactive' : `${this.getThemeType() ? 'dark' : 'light'}/arrow_back`}.png`,
                            accelerator: 'Alt+Left',
                            enabled: view.webContents.canGoBack(),
                            click: () => {
                                const url = view.webContents.getURL();

                                view.webContents.goBack();
                                if (url.startsWith(`${protocolStr}://error`)) {
                                    if (view.webContents.canGoBack())
                                        view.webContents.goBack();
                                }
                            }
                        },
                        {
                            label: lang.window.view.contextMenu.forward,
                            icon: `${app.getAppPath()}/static/${!view.webContents.canGoForward() ? 'arrow_forward_inactive' : `${this.getThemeType() ? 'dark' : 'light'}/arrow_forward`}.png`,
                            accelerator: 'Alt+Right',
                            enabled: view.webContents.canGoForward(),
                            click: () => {
                                const url = view.webContents.getURL();

                                view.webContents.goForward();
                                if (url.startsWith(`${protocolStr}://error`)) {
                                    if (view.webContents.canGoForward())
                                        view.webContents.goForward();
                                }
                            }
                        },
                        {
                            label: !view.webContents.isLoadingMainFrame() ? lang.window.view.contextMenu.reload.reload : lang.window.view.contextMenu.reload.stop,
                            icon: `${app.getAppPath()}/static/${this.getThemeType() ? 'dark' : 'light'}/${!view.webContents.isLoadingMainFrame() ? 'refresh' : 'close'}.png`,
                            accelerator: 'CmdOrCtrl+R',
                            click: () => { !view.webContents.isLoadingMainFrame() ? view.webContents.reload() : view.webContents.stop(); }
                        },
                        ...(params.mediaType === 'audio' || params.mediaType === 'video' || view.webContents.isCurrentlyAudible() ? [
                            { type: 'separator' },
                            {
                                label: view.webContents.audioMuted ? lang.window.view.contextMenu.media.audioMuteExit : lang.window.view.contextMenu.media.audioMute,
                                icon: `${app.getAppPath()}/static/${this.getThemeType() ? 'dark' : 'light'}/audio${view.webContents.audioMuted ? '' : '_mute'}.png`,
                                click: () => {
                                    view.webContents.audioMuted = !view.webContents.audioMuted;

                                    this.getViews();
                                }
                            },
                            {
                                label: lang.window.view.contextMenu.media.pictureInPicture,
                                icon: `${app.getAppPath()}/static/${this.getThemeType() ? 'dark' : 'light'}/picture_in_picture.png`,
                                click: () => {
                                    view.webContents.executeJavaScript('togglePictureInPicture()');
                                }
                            }
                        ] : []),
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.savePage,
                            icon: `${app.getAppPath()}/static/${this.getThemeType() ? 'dark' : 'light'}/save.png`,
                            accelerator: 'CmdOrCtrl+S',
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => {
                                dialog.showSaveDialog({
                                    defaultPath: `${app.getPath('downloads')}/${view.webContents.getTitle()}`,
                                    filters: [
                                        { name: 'Web ページ', extensions: ['html'] }
                                    ]
                                }).then((result) => {
                                    if (result.canceled) return;
                                    view.webContents.savePage(result.filePath, 'HTMLComplete').then(() => {
                                        console.log('Page was saved successfully.')
                                    }).catch((err) => {
                                        if (!err) console.log('Page Save successfully');
                                    });
                                });
                            }
                        },
                        {
                            label: lang.window.view.contextMenu.print,
                            icon: `${app.getAppPath()}/static/${this.getThemeType() ? 'dark' : 'light'}/print.png`,
                            accelerator: 'CmdOrCtrl+P',
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => { view.webContents.print(); }
                        },
                        {
                            label: lang.window.view.contextMenu.translate,
                            icon: `${app.getAppPath()}/static/${this.getThemeType() ? 'dark' : 'light'}/translate.png`,
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => {
                                /*
                                view.webContents.executeJavaScript(
                                    `(function () {
                                        fetch('https://script.google.com/macros/s/AKfycbyR_DvrDkeXOBWtA-0Zk8BO8ChnIAnunZrKIE4fpveX2P9IL3L8/exec?text=' + encodeURIComponent(document.body.innerText) + '&target=en&source=', {
                                            method: 'GET'
                                        }).then((res) => {
                                            const json = res.json();
                                            console.log(json);
                                            if (!json.result) return;

                                            document.body.innerText = decodeURIComponent(json.targetText);
                                        });
                                    })()`
                                );
                                */

                                this.hideWindows();
                                if (!this.translateWindow.isVisible()) {
                                    this.translateWindow.showWindow(view.webContents.getURL());
                                } else {
                                    this.translateWindow.hide();
                                }
                            }
                        },
                        {
                            label: lang.window.view.contextMenu.floatingWindow,
                            type: 'checkbox',
                            checked: this.isFloatingWindow,
                            enabled: (!this.isFullScreen() && !this.isMaximized() && userConfig.get('design.isCustomTitlebar')),
                            click: () => {
                                this.isFloatingWindow = !this.isFloatingWindow;
                                this.fixBounds();
                            }
                        },
                        { type: 'separator' },
                        {
                            label: lang.window.view.contextMenu.viewSource,
                            accelerator: 'CmdOrCtrl+U',
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => { this.addView(`view-source:${view.webContents.getURL()}`, true); }
                        },
                        {
                            label: lang.window.view.contextMenu.devTool,
                            accelerator: 'CmdOrCtrl+Shift+I',
                            enabled: !view.webContents.getURL().startsWith(`${protocolStr}://`),
                            click: () => {
                                if (view.webContents.isDevToolsOpened())
                                    view.webContents.devToolsWebContents.focus();
                                else
                                    view.webContents.openDevTools();
                            }
                        }
                    ]
                );
            }

            menu.popup();
        });

        view.webContents.session.on('will-download', (e, item, webContents) => {
            if (id !== webContents.id) return;

            const str = this.getRandString(12);
            if (item.getMimeType() == 'application/pdf') {
                item.savePath = join(app.getPath('userData'), 'Users', config.get('currentUser'), `${item.getFilename()}.pdf`);

                item.once('done', (e, state) => {
                    const filePath = item.savePath;
                    this.db.downloads.update({ id: str }, { id: str, name: item.getFilename(), url: item.getURL(), type: item.getMimeType(), size: item.getTotalBytes(), path: item.getSavePath(), status: item.getState() }, { upsert: true });
                    if (state === 'completed') {
                        this.webContents.send(`notification-${this.windowId}`, { id: id, content: `${item.getFilename()} のダウンロードが完了しました。` });

                        if (!Notification.isSupported()) return;
                        const notify = new Notification({
                            icon: join(app.getAppPath(), 'static', 'app', 'icon.png'),
                            title: 'ダウンロード完了',
                            body: `${item.getFilename()} のダウンロードが完了しました。\n詳細はここをクリックしてください。`
                        });

                        notify.show();

                        notify.on('click', (e) => {
                            if (filePath !== undefined)
                                shell.openItem(filePath);
                        });
                    } else {
                        console.log(`Download failed: ${state}`);
                    }
                });
            } else {
                this.db.downloads.update({ id: str }, { id: str, name: item.getFilename(), url: item.getURL(), type: item.getMimeType(), size: item.getTotalBytes(), path: item.getSavePath(), status: item.getState() }, { upsert: true });

                item.on('updated', (e, state) => {
                    this.db.downloads.update({ id: str }, { id: str, name: item.getFilename(), url: item.getURL(), type: item.getMimeType(), size: item.getTotalBytes(), path: item.getSavePath(), status: item.getState() }, { upsert: true });
                });

                item.once('done', (e, state) => {
                    const filePath = item.savePath;
                    this.db.downloads.update({ id: str }, { id: str, name: item.getFilename(), url: item.getURL(), type: item.getMimeType(), size: item.getTotalBytes(), path: item.getSavePath(), status: item.getState() }, { upsert: true });
                    if (state === 'completed') {
                        this.webContents.send(`notification-${this.windowId}`, { id: id, content: `${item.getFilename()} のダウンロードが完了しました。` });

                        if (!Notification.isSupported()) return;
                        const notify = new Notification({
                            icon: join(app.getAppPath(), 'static', 'app', 'icon.png'),
                            title: 'ダウンロード完了',
                            body: `${item.getFilename()} のダウンロードが完了しました。\n詳細はここをクリックしてください。`
                        });

                        notify.show();

                        notify.on('click', (e) => {
                            if (filePath !== undefined)
                                shell.openItem(filePath);
                        });
                    } else {
                        console.log(`Download failed: ${state}`);
                    }
                });
            }
        });

        view.webContents.loadURL(url);
        this.views.push({ id, view, isFixed: false, isNotificationBar: false });

        if (isActive) {
            this.menuWindow.destroy();
            this.menuWindow = new MenuWindow(this, this.windowId, id);
            this.webContents.send(`tab-select-${this.windowId}`, { id });
            this.setBrowserView(view);
        }

        this.fixBounds();
        this.getViews();
    }

    getMainMenu = (windowManager) => {
        return Menu.buildFromTemplate([
            {
                label: `${lang.main.file.label}(&F)`,
                accelerator: 'Alt+F',
                submenu: [
                    {
                        accelerator: 'CmdOrCtrl+T',
                        label: lang.main.file.newTab,
                        click: () => this.addView()
                    },
                    {
                        accelerator: 'CmdOrCtrl+N',
                        label: lang.main.file.newWindow,
                        click: () => windowManager.addWindow(false)
                    },
                    {
                        accelerator: 'CmdOrCtrl+Shift+N',
                        label: lang.main.file.openPrivateWindow,
                        click: () => windowManager.addWindow(true)
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.file.savePage,
                        accelerator: 'CmdOrCtrl+S',
                        click: () => {
                            if (this.getBrowserViews()[0] == undefined) return;
                            const view = this.getBrowserViews()[0];

                            dialog.showSaveDialog({
                                defaultPath: `${app.getPath('downloads')}/${view.webContents.getTitle()}`,
                                filters: [
                                    { name: 'Web ページ', extensions: ['html'] }
                                ]
                            }).then((result) => {
                                if (result.canceled) return;
                                view.webContents.savePage(result.filePath, 'HTMLComplete').then(() => {
                                    console.log('Page was saved successfully.')
                                }).catch((err) => {
                                    if (!err) console.log('Page Save successfully');
                                });
                            });
                        }
                    },
                    {
                        label: lang.main.file.print,
                        accelerator: 'CmdOrCtrl+P',
                        click: () => {
                            if (this.getBrowserViews()[0] == undefined) return;
                            const view = this.getBrowserViews()[0];

                            view.webContents.print();
                        }
                    },
                    { type: 'separator' },
                    {
                        accelerator: 'CmdOrCtrl+W',
                        label: 'Close tab',
                        click: () => this.removeView()
                    },
                    {
                        accelerator: 'CmdOrCtrl+Shift+W',
                        label: 'Close current window',
                        click: () => this.close()
                    },
                    { type: 'separator' },
                    { role: 'quit' }
                ],
            },
            {
                label: `${lang.main.edit.label}(&E)`,
                accelerator: 'Alt+E',
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
                label: `${lang.main.view.label}(&V)`,
                accelerator: 'Alt+V',
                submenu: [
                    {
                        label: lang.main.view.fullScreen,
                        accelerator: 'F11',
                        click: () => {
                            this.setFullScreen(!this.isFullScreen());
                            this.fixBounds();
                        }
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.view.viewSource,
                        accelerator: 'CmdOrCtrl+U',
                        click: () => {
                            if (this.getBrowserViews()[0] == undefined) return;
                            const view = this.getBrowserViews()[0];

                            windowManager.getCurrentWindow().addView(`view-source:${view.webContents.getURL()}`, true);
                        }
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.view.devTool,
                        accelerator: 'CmdOrCtrl+Shift+I',
                        click: () => {
                            if (this.getBrowserViews()[0] == undefined) return;
                            const view = this.getBrowserViews()[0];

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
                            if (this.getBrowserViews()[0] == undefined) return;
                            const view = this.getBrowserViews()[0];

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
                            this.webContents.openDevTools({ mode: 'detach' });
                        }
                    }
                ]
            },
            {
                label: `${lang.main.navigate.label}(&N)`,
                accelerator: 'Alt+N',
                submenu: [
                    {
                        label: lang.main.navigate.back,
                        accelerator: 'Alt+Left',
                        click: () => {
                            if (this.getBrowserViews()[0] == undefined) return;
                            const view = this.getBrowserViews()[0];

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
                            if (this.getBrowserViews()[0] == undefined) return;
                            const view = this.getBrowserViews()[0];

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
                            if (this.getBrowserViews()[0] == undefined) return;
                            const view = this.getBrowserViews()[0];

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
                            if (this.getBrowserViews()[0] == undefined) return;
                            const view = this.getBrowserViews()[0];

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
                            if (this.getBrowserViews()[0] == undefined) return;
                            const view = this.getBrowserViews()[0];

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
                            if (this.getBrowserViews()[0] == undefined) return;
                            const view = this.getBrowserViews()[0];

                            view.webContents.loadURL(userConfig.get('homePage.homeButton.isDefaultHomePage') ? `${protocolStr}://home/` : userConfig.get('homePage.homeButton.defaultPage'));
                        }
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.navigate.history,
                        accelerator: 'Ctrl+H',
                        click: () => {
                            if (this.getBrowserViews()[0] == undefined) return;
                            this.addTabOrLoadUrl(this.getBrowserViews()[0], `${protocolStr}://history/`, true);
                        }
                    },
                    {
                        label: lang.main.navigate.downloads,
                        accelerator: 'Ctrl+D',
                        click: () => {
                            if (this.getBrowserViews()[0] == undefined) return;
                            this.addTabOrLoadUrl(this.getBrowserViews()[0], `${protocolStr}://downloads/`, true);
                        }
                    },
                    {
                        label: lang.main.navigate.bookmarks,
                        accelerator: 'Ctrl+B',
                        click: () => {
                            if (this.getBrowserViews()[0] == undefined) return;
                            this.addTabOrLoadUrl(this.getBrowserViews()[0], `${protocolStr}://bookmarks/`, true);
                        }
                    }
                ]
            },
            {
                label: `${lang.main.help.label}(&H)`,
                accelerator: 'Alt+N',
                submenu: [
                    {
                        label: lang.main.help.help,
                        accelerator: 'F1',
                        click: () => {
                            if (this.getBrowserViews()[0] == undefined) return;
                            this.addTabOrLoadUrl(this.getBrowserViews()[0], `${protocolStr}://help/`, true);
                        }
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.help.feedback,
                        accelerator: 'Alt+Shift+I',
                        click: () => this.application.addAppWindow(`${protocolStr}://feedback/`, 550, 430, false)
                    },
                    { type: 'separator' },
                    {
                        label: lang.main.help.about,
                        click: () => {
                            if (this.getBrowserViews()[0] == undefined) return;
                            this.addTabOrLoadUrl(this.getBrowserViews()[0], `${protocolStr}://settings/about`, true);
                        }
                    }
                ]
            },
        ]);
    }

    addTabOrLoadUrl = (view, url, isInternal = false) => {
        isInternal ? (parse(url).protocol === `${protocolStr}:` ? view.webContents.loadURL(url) : this.addView(url, true)) : this.addView(url, true);
    }

    getThemeType = () => {
        if (userConfig.get('design.theme') === -1)
            return nativeTheme.shouldUseDarkColors;
        else if (userConfig.get('design.theme') === 0)
            return false;
        else if (userConfig.get('design.theme') === 1)
            return true;
    }

    getRandString = (length) => {
        const char = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const charLength = char.length;

        let str = '';
        for (var i = 0; i < length; i++)
            str += char[Math.floor(Math.random() * charLength)];

        return str;
    }

    loadSessionAndProtocolWithPrivateMode = (windowId) => {
        const ses = session.fromPartition(windowId);
        ses.setUserAgent(ses.getUserAgent().replace(/ Electron\/[0-9\.]*/g, '') + ' PrivMode');

        if (!ses.protocol.isProtocolRegistered(protocolStr)) {
            ses.protocol.registerFileProtocol(protocolStr, (request, callback) => {
                const parsed = parse(request.url);

                return callback({
                    path: join(app.getAppPath(), 'pages', parsed.pathname === '/' || !parsed.pathname.match(/(.*)\.([A-z0-9])\w+/g) ? `${parsed.hostname}.html` : `${parsed.hostname}${parsed.pathname}`),
                });
            }, (error) => {
                if (error) console.error(`[Error] Failed to register protocol: ${error}`);
            });
        }

        if (!ses.protocol.isProtocolRegistered(fileProtocolStr)) {
            ses.protocol.registerFileProtocol(fileProtocolStr, (request, callback) => {
                const parsed = parse(request.url);

                return callback({ path: join(app.getPath('userData'), 'Users', config.get('currentUser'), parsed.pathname) });
            }, (error) => {
                if (error) console.error(`[Error] Failed to register protocol: ${error}`);
            });
        }
    }
}