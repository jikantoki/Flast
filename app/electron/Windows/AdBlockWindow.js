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

const lang = require(`${app.getAppPath()}/langs/${config.get('language')}.js`);

module.exports = class AdBlockWindow extends BrowserWindow {
    constructor(appWindow) {
        super({
            width: 300,
            height: 120,
            frame: false,
            resizable: false,
            transparent: true,
            show: false,
            fullscreenable: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
            skipTaskbar: true,
        });

        this.appWindow = appWindow;

        this.loadURL('https://ja.osdn.net/projects/serene/scm/git/MyBrowser/summary');
        this.setParentWindow(appWindow);

        // this.show();
        this.fixBounds();
    }

    fixBounds = () => {
        const bounds = this.appWindow.getContentBounds();
        this.setBounds({ x: bounds.x + 1 + 25, y: bounds.y + 73 + 1 });
    }
}