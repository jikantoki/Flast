const { app, shell, ipcMain, protocol, session, BrowserWindow, BrowserView, Menu, nativeImage, clipboard, dialog, Notification } = require('electron');
const path = require('path');
const { parse, format } = require('url');
const os = require('os');
const https = require('https');
const http = require('http');

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
const platform = require('electron-platform');
const localShortcut = require('electron-localshortcut');

const Config = require('electron-store');
const config = new Config();

const { isURL, prefixHttp } = require('../URL');

const lang = require(`${app.getAppPath()}/langs/${config.get('language') != undefined ? config.get('language') : 'ja'}.js`);
const { loadFilters, updateFilters, runAdblockService, removeAds } = require('../AdBlocker');

module.exports = class MainWindow2 extends BrowserWindow {
    constructor(application, isPrivate = false, db, urls = (config.get('startUp.isDefaultHomePage') ? [`${protocolStr}://home/`] : config.get('startUp.defaultPages'))) {
        const { width, height, x, y } = config.get('window.bounds');

        const winWidth = config.get('window.isMaximized') ? 1110 : (width !== undefined ? width : 1110);
        const winHeight = config.get('window.isMaximized') ? 680 : (height !== undefined ? height : 680);

        console.log(winWidth, winHeight);

        super({
            width: winWidth, height: winHeight, minWidth: 500, minHeight: 360, x, y, titleBarStyle: 'hiddenInset', frame: !config.get('design.isCustomTitlebar'), fullscreenable: true,
            icon: `${__dirname}/static/app/icon.png`,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                webviewTag: true,
                plugins: true,
                experimentalFeatures: true
            }
        });

        this.application = application;

        this.db = db;

        this.isModuleWindowFocused = false;
        this.isPreviousFullScreen = false;
        this.isFloatingWindow = false;

        this.tabId = 0;

        this.windowId = (!isPrivate ? `window-${this.id}` : `private-${this.id}`);

        config.get('window.isMaximized') && this.maximize();

        let urlStrings = '';
        urls.map((url, i) => urlStrings += `${encodeURIComponent(url)}($|$)`);

        const startUrl = process.env.ELECTRON_START_URL || format({
            pathname: path.join(__dirname, '/../../build/index.html'), // 警告：このファイルを移動する場合ここの相対パスの指定に注意してください
            protocol: 'file:',
            slashes: true,
            hash: `/window2/${this.windowId}/${urlStrings.substring(0, urlStrings.length - 5)}`,
        });

        this.loadURL(startUrl);

        this.once('ready-to-show', () => { this.show(); });

        this.on('focus', () => {
            this.webContents.send(`window-focus-${this.windowId}`, {});
        });
        this.on('blur', () => {
            this.webContents.send(`window-blur-${this.windowId}`, {});
        });

        this.on('maximize', () => {
            this.webContents.send(`window-maximized-${this.windowId}`, {});
        });
        this.on('unmaximize', () => {
            this.webContents.send(`window-unmaximized-${this.windowId}`, {});
        });

        const ses = !isPrivate ? session.defaultSession : session.fromPartition(this.windowId);

        ses.setPermissionRequestHandler((webContents, permission, callback, details) => {
            const url = parse(webContents.getURL());
            const permName = permission === 'media' ? `${permission}_${details.mediaTypes}` : permission;
            const configPath = `pageSettings.${permission}${permission === 'media' ? `.${details.mediaTypes}` : ''}`;

            db.pageSettings.findOne({ origin: `${url.protocol}//${url.hostname}`, type: permName }, async (err, doc) => {
                if (doc != undefined) {
                    console.log(doc);
                    return callback(doc.result);
                } else {
                    if (config.get(configPath) === null || config.get(configPath) === -1) {
                        const results = await this.permissionWindow.showWindow(permission, webContents.getURL());
                        const result = results[0];
                        const isChecked = true;

                        if (isChecked) {
                            db.pageSettings.update(
                                { origin: `${url.protocol}//${url.hostname}`, type: permName, result },
                                { origin: `${url.protocol}//${url.hostname}`, type: permName, result },
                                { upsert: true }
                            );
                        }
                        callback(result);
                    } else if (config.get(configPath) === 0) {
                        return callback(false);
                    } else if (config.get(configPath) === 1) {
                        return callback(true);
                    }
                }
            });
        });
    }

    getRandString = (length) => {
        const char = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const charLength = char.length;

        let str = '';
        for (var i = 0; i < length; i++) {
            str += char[Math.floor(Math.random() * charLength)];
        }

        return str;
    }
}