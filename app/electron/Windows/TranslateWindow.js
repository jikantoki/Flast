const { app, shell, ipcMain, protocol, session, BrowserWindow, BrowserView, Menu, nativeImage, clipboard, dialog, Notification } = require('electron');
const path = require('path');
const { parse, format } = require('url');
const os = require('os');
const https = require('https');
const http = require('http');

const pkg = require(`${app.getAppPath()}/package.json`);
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const { download } = require('electron-dl');
const platform = require('electron-platform');
const localShortcut = require('electron-localshortcut');

const Config = require('electron-store');
const config = new Config();
const userConfig = new Config({
    cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

const lang = require(`${app.getAppPath()}/langs/${userConfig.get('language') != undefined ? userConfig.get('language') : 'ja'}.js`);

const width = 400;
const height = 550;

module.exports = class TranslateWindow extends BrowserWindow {
    constructor(appWindow, windowId) {
        super({
            width,
            height,
            frame: false,
            resizable: false,
            transparent: true,
            show: false,
            fullscreenable: false,
            skipTaskbar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webviewTag: true,
                enableRemoteModule: true
            }
        });

        this.on('focus', () => {
            appWindow.isModuleWindowFocused = true;
        });
        this.on('blur', () => {
            appWindow.isModuleWindowFocused = false;
        });

        this.appWindow = appWindow;
        this.windowId = windowId;

        const startUrl = process.env.ELECTRON_START_URL || format({
            pathname: path.join(__dirname, '/../../build/index.html'), // 警告：このファイルを移動する場合ここの相対パスの指定に注意してください
            protocol: 'file:',
            slashes: true,
            hash: `/extensions/translate/${windowId}`,
        });

        this.loadURL(startUrl);
        this.setParentWindow(appWindow);

        // this.show();
        this.fixBounds();
    }

    showWindow = (url) => {
        this.appWindow.isModuleWindowFocused = true;

        this.hide();
        this.webContents.send(`translateWindow-${this.windowId}`, { url });
        this.fixBounds();
        this.show();

        ipcMain.once(`translateWindow-close-${this.windowId}`, (e, result) => {
            if (this.isDestroyed()) return;
            this.hide();
            this.appWindow.focus();
        });
    }

    fixBounds = () => {
        const bounds = this.appWindow.getContentBounds();
        this.setBounds({
            x: this.appWindow.isMaximized() ? (bounds.x + bounds.width) - width : (bounds.x + bounds.width) - (width + 1),
            y: this.appWindow.isFullScreen() ? bounds.y : bounds.y + 70 + 1
        });
    }
}