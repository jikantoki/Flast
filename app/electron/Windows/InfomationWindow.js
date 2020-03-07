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

module.exports = class InfomationWindow extends BrowserWindow {

    constructor(appWindow, windowId) {
        super({
            width: 320,
            frame: false,
            resizable: false,
            transparent: true,
            show: false,
            fullscreenable: false,
            skipTaskbar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
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
            hash: `/info/${windowId}`,
        });

        this.loadURL(startUrl);
        this.setParentWindow(appWindow);

        // this.show();
        this.fixBounds();
    }

    showWindow = (title, description, url = '', certificate = undefined, isButton = false) => {
        this.appWindow.isModuleWindowFocused = true;

        this.hide();
        this.webContents.send(`infoWindow-${this.windowId}`, { title, description, url, certificate, isButton });
        this.fixBounds();
        this.show();

        // this.webContents.openDevTools({ mode: 'detach' });

        ipcMain.once(`infoWindow-close-${this.windowId}`, (e, result) => {
            this.hide();
            this.appWindow.focus();
        });

        return new Promise((resolve, reject) => {
            ipcMain.once(`infoWindow-result-${this.windowId}`, (e, result) => {
                resolve(result);
                this.hide();
                this.appWindow.focus();
            });
        });
    }

    fixBounds = () => {
        const bounds = this.appWindow.getContentBounds();
        this.setBounds({
            x: bounds.x + (userConfig.get('design.isHomeButton') ? (platform.isWin32 || platform.isDarwin ? (this.appWindow.isMaximized() ? 147 : 148) : 151) : (platform.isWin32 || platform.isDarwin ? (this.appWindow.isMaximized() ? 112 : 113) : 116)),
            y: this.appWindow.isFullScreen() ? bounds.y : bounds.y + 70 + 1
        });
    }
}