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

module.exports = class SuggestWindow extends BrowserWindow {
    constructor(appWindow, windowId) {
        super({
            width: 320,
            height: 218,
            frame: false,
            resizable: false,
            transparent: true,
            show: false,
            fullscreenable: false,
            skipTaskbar: true,
            title: `Module_${windowId}`,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
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
            hash: `/suggest/${windowId}`,
        });

        this.loadURL(startUrl);
        this.setParentWindow(appWindow);

        // this.show();
        this.fixBounds();
    }

    showWindow = (id, text) => {
        this.appWindow.isModuleWindowFocused = true;

        this.showInactive();
        this.fixBounds();
        // this.webContents.openDevTools({ mode: 'detach' });

        ipcMain.once(`suggestWindow-close-${this.windowId}`, (e, result) => {
            this.hide();
            this.appWindow.focus();
        });

        this.webContents.send(`suggestWindow-${this.windowId}`, { id, text });
    }

    fixBounds = () => {
        const isMaximized = this.appWindow.isMaximized();
        const bounds = this.appWindow.getContentBounds();

        const x = bounds.x + ((40 * (config.get('design.isHomeButton') ? 5 : 4)) - (config.get('design.isHomeButton') ? 52 : 48));
        const width = bounds.width - ((40 * (config.get('design.isHomeButton') ? 8 : 7)) - (config.get('design.isHomeButton') ? 11 : 5));

        this.setBounds({
            x: isMaximized ? x : x + 1,
            y: isMaximized ? bounds.y + 70 : bounds.y + 70 + 1,
            width: isMaximized ? width : width - 2
        });
    }
}