const { remote, ipcRenderer, shell } = require('electron');
const { app, systemPreferences, nativeTheme } = remote;
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const fileType = require('file-type');
const isOnline = require('is-online');


const { injectChromeWebstoreInstallButton } = require('./Chrome-WebStore');

// const Firebase = require(`${remote.app.getAppPath()}/electron/Firebase.js`);

const package = require(`${remote.app.getAppPath()}/package.json`);
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const Config = require('electron-store');
const config = new Config();
const userConfig = new Config({
    cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

// ファイルタイプの列挙体（のつもり）
const FileType = {
    File: 'file',
    Directory: 'directory',
    Unknown: 'unknown'
}

/**
 * ファイルの種類を取得する
 * @param {string} path パス
 * @return {FileType} ファイルの種類
 */
const getFileType = path => {
    try {
        const stat = fs.statSync(path);

        switch (true) {
            case stat.isFile():
                return FileType.File;

            case stat.isDirectory():
                return FileType.Directory;

            default:
                return FileType.Unknown;
        }

    } catch (e) {
        return FileType.Unknown;
    }
}

/**
 * 指定したディレクトリ配下のすべてのファイルをリストアップする
 * @param {string} dirPath 検索するディレクトリのパス
 * @return {Array<string>} ファイルのパスのリスト
 */
const listFiles = dirPath => {
    const ret = [];
    const paths = fs.readdirSync(dirPath);

    paths.forEach(a => {
        const path = `${dirPath}/${a}`;

        switch (getFileType(path)) {
            case FileType.File:
                ret.push(path);
                break;

            case FileType.Directory:
                ret.push(...listFiles(path));
                break;

            default:
            /* noop */
        }
    })

    return ret;
};

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getConfigPath = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.path;
}

global.getFiles = (pathName) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return listFiles(path.resolve(__dirname, pathName));
}

global.getFile = (path, json = false) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    if (json) {
        return require(path);
    } else {
        const text = fs.readFileSync(path, 'utf8');
        return text;
    }
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.openInEditor = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.openInEditor();
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getAppName = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return package.name;
}

global.getAppDescription = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return package.description;
}

global.getAppVersion = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return package.version;
}

global.getAppChannel = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return package.flast_channel;
}

global.getElectronVersion = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return process.versions.electron;
}

global.getChromiumVersion = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return process.versions.chrome;
}

global.getOSVersion = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return `${os.type()} ${process.getSystemVersion()}`;
}

global.getUpdateStatus = () => new Promise((resolve) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('app-updateStatus', {});
    ipcRenderer.once('app-updateStatus', (e, args) => {
        resolve(args.result);
    });
});

global.isOnline = () => new Promise((resolve) => {
    resolve(isOnline());
});

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.clearBrowserData = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    b && ipcRenderer.send('clear-browsing-data', {});
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.updateFilters = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('update-filters', {});
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

/*
 * ブックマーク
 */
global.addBookmark = (title, url, isFolder = false, isPrivate = false) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send(`data-bookmark-add`, { title, url, isFolder, isPrivate });
}

global.removeBookmark = (url, isPrivate = false) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send(`data-bookmark-remove`, { url, isPrivate });
}

global.getBookmarks = (isPrivate = false) => new Promise((resolve) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('data-bookmarks-get', { isPrivate });
    ipcRenderer.on('data-bookmarks-get', (e, args) => {
        console.log(args.bookmarks);
        resolve(args.bookmarks);
    });
});

global.clearBookmarks = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    b && ipcRenderer.send('data-bookmarks-clear', {});
}

/*
 * 履歴
 */
global.getHistorys = () => new Promise((resolve) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('data-history-get', {});
    ipcRenderer.on('data-history-get', (e, args) => {
        resolve(args.historys);
    });
});

global.clearHistorys = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    b && ipcRenderer.send('data-history-clear', {});
}

/*
 * ダウンロード
 */
global.getDownloads = () => new Promise((resolve) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('data-downloads-get', {});
    ipcRenderer.on('data-downloads-get', (e, args) => {
        resolve(args.downloads);
    });
});

global.clearDownloads = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    b && ipcRenderer.send('data-downloads-clear', {});
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getApps = () => new Promise((resolve) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('data-apps-get', {});
    ipcRenderer.on('data-apps-get', (e, args) => {
        resolve(args.apps);
    });
});

global.clearApps = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    b && ipcRenderer.send('data-apps-clear', {});
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/


global.getCurrentUser = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('profile');
}

global.loginAccount = (email, password) => new Promise((resolve) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('login-account', { email, password });
    ipcRenderer.once('login-account', (e, result) => {
        console.log(result);
    });
});

global.createAccount = (email, password) => new Promise((resolve) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('create-account', { email, password });
    ipcRenderer.once('create-account', (e, result) => {
        console.log(result);
    });
});

global.logoutAccount = () => new Promise((resolve) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('logout-account', {});
    ipcRenderer.once('logout-account', (e, result) => {
        console.log(result);
        resolve(result);
    });
});

global.syncAccount = (id = undefined) => new Promise((resolve) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('sync-account', { id });
    ipcRenderer.once('sync-account', (e, args) => {
        resolve(args.id);
    });
});

global.updateAccount = (email, password, displayName) => new Promise((resolve) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    ipcRenderer.send('update-account', { email, password, displayName });
    ipcRenderer.once('update-account', (e, result) => {
        console.log(result);
    });
});

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getHomeButton = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('design.isHomeButton');
}

global.setHomeButton = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('design.isHomeButton', b);
    ipcRenderer.send('window-change-settings', {});
}

global.getBookmarkBar = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('design.isBookmarkBar');
}

global.setBookmarkBar = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('design.isBookmarkBar', b);
    ipcRenderer.send('window-change-settings', {});
    ipcRenderer.send('window-fixBounds', {});
}

global.getThemeType = () => {
    if (userConfig.get('design.theme') === -1)
        return nativeTheme.shouldUseDarkColors;
    else if (userConfig.get('design.theme') === 0)
        return false;
    else if (userConfig.get('design.theme') === 1)
        return true;
}

global.getTheme = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('design.theme');
}

global.setTheme = (i) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    if (i === -1)
        nativeTheme.themeSource = 'system';
    else if (i === 0)
        nativeTheme.themeSource = 'light';
    else if (i === 1)
        nativeTheme.themeSource = 'dark';

    userConfig.set('design.theme', i);
    ipcRenderer.send('window-change-settings', {});
}

global.getTabAccentColor = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('design.tabAccentColor');
}

global.setTabAccentColor = (color) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('design.tabAccentColor', color);
    ipcRenderer.send('window-change-settings', {});
}

global.getCustomTitlebar = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('design.isCustomTitlebar');
}

global.setCustomTitlebar = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('design.isCustomTitlebar', b);
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getButtonDefaultHomePage = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('homePage.homeButton.isDefaultHomePage');
}

global.setButtonDefaultHomePage = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('homePage.homeButton.isDefaultHomePage', b);
}

global.getButtonStartPage = (b = true) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return b ? (userConfig.get('homePage.homeButton.isDefaultHomePage') ? `${protocolStr}://home/` : userConfig.get('homePage.homeButton.defaultPage')) : userConfig.get('homePage.homeButton.defaultPage');
}

global.setButtonStartPage = (url) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('homePage.homeButton.defaultPage', url);
}

global.getHomePageBackgroundType = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('homePage.homePage.backgroundType');
}

global.setHomePageBackgroundType = (type) => {
    if (!(location.protocol !== `${protocolStr}://` || location.protocol !== `${fileProtocolStr}://`) || type < -1 || type > 1) return;

    userConfig.set('homePage.homePage.backgroundType', type);
}

global.getHomePageBackgroundImage = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('homePage.homePage.backgroundImage');
}

global.setHomePageBackgroundImage = (data) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('homePage.homePage.backgroundImage', data);
}

global.copyHomePageBackgroundImage = (file) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    const sourceFile = fs.readFileSync(file);
    const targetFile = path.join(app.getPath('userData'), 'Users', config.get('currentUser'), `background.${fileType(sourceFile).ext}`);
    fs.copy(file, targetFile);
    userConfig.set('homePage.homePage.backgroundImage', `${fileProtocolStr}:///background.${fileType(sourceFile).ext}`);
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/
global.getNewTabDefaultHomePage = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('homePage.newTab.isDefaultHomePage');
}

global.setNewTabDefaultHomePage = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('homePage.newTab.isDefaultHomePage', b);
}

global.getNewTabStartPage = (b = true) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return b ? (userConfig.get('homePage.newTab.isDefaultHomePage') ? `${protocolStr}://home/` : userConfig.get('homePage.newTab.defaultPage')) : userConfig.get('homePage.newTab.defaultPage');
}

global.setNewTabStartPage = (url) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('homePage.newTab.defaultPage', url);
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getDefaultHomePage = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('startUp.isDefaultHomePage');
}

global.setDefaultHomePage = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('startUp.isDefaultHomePage', b);
}

global.getStartPages = (b = true) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return b ? (userConfig.get('startUp.isDefaultHomePage') ? [`${protocolStr}://home/`] : userConfig.get('startUp.defaultPages')) : userConfig.get('startUp.defaultPages');
}

global.setStartPages = (urls) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('startUp.defaultPages', urls);
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getSearchEngines = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('searchEngine.searchEngines');
}

global.getSearchEngine = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    for (var i = 0; i < userConfig.get('searchEngine.searchEngines').length; i++) {
        if (userConfig.get('searchEngine.searchEngines')[i].name == userConfig.get('searchEngine.defaultEngine')) {
            return userConfig.get('searchEngine.searchEngines')[i];
        }
    }
}

global.setSearchEngine = (name) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    getSearchEngines().some((item, i) => {
        if (item.name && item.name === name)
            userConfig.set('searchEngine.defaultEngine', name);
    });
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getVideoCamera = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('pageSettings.media.video');
}

global.setVideoCamera = (v) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('pageSettings.media.video', v);
}

global.getMicroPhone = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('pageSettings.media.audio');
}

global.setMicroPhone = (v) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('pageSettings.media.audio', v);
}


global.getGeolocation = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('pageSettings.geolocation');
}

global.setGeolocation = (v) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('pageSettings.geolocation', v);
}

global.getNotifications = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('pageSettings.notifications');
}

global.setNotifications = (v) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('pageSettings.notifications', v);
}

global.getMidiSysex = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('pageSettings.midiSysex');
}

global.setMidiSysex = (v) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('pageSettings.midiSysex', v);
}

global.getPointerLock = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('pageSettings.pointerLock');
}

global.setPointerLock = (v) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('pageSettings.pointerLock', v);
}

global.getFullScreen = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('pageSettings.fullscreen');
}

global.setFullScreen = (v) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('pageSettings.fullscreen', v);
}

global.getOpenExternal = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('pageSettings.openExternal');
}

global.setOpenExternal = (v) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('pageSettings.openExternal', v);
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getAdBlock = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('adBlock.isAdBlock');
}

global.setAdBlock = (b) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('adBlock.isAdBlock', b);
    ipcRenderer.send('window-change-settings', {});
}

global.getFilters = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    return userConfig.get('adBlock.filters');
}

global.setFilters = (list) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('adBlock.filters', list);
    ipcRenderer.send('window-change-settings', {});
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.getLanguage = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;
    return userConfig.get('language') != undefined ? userConfig.get('language') : 'ja';
}

global.setLanguage = (language) => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    userConfig.set('language', language);
    ipcRenderer.send('window-change-settings', {});
}

global.getLanguageFile = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;
    return require(`${remote.app.getAppPath()}/langs/${userConfig.get('language') != undefined ? userConfig.get('language') : 'ja'}.js`);
}

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.restart = () => {
    if (location.protocol !== `${protocolStr}:` && location.protocol !== `${fileProtocolStr}:`) return;

    remote.app.relaunch();
    remote.app.exit(0);
}

global.isURL = (input) => {
    const pattern = /^((?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)|flast:\/\/\S.*|flast-file:\/\/\S.*|file:\/\/\S.*)\S*$/;

    return pattern.test(input) ? true : pattern.test(`http://${input}`);
};

global.installApp = (id, name, description, url) => {
    if (!(location.protocol !== `${protocolStr}://` || location.protocol !== `${fileProtocolStr}://` || location.hostname !== 'store.aoichaan0513.xyz' || location.host !== 'localhost:3000')) return;

    ipcRenderer.send('data-apps-add', { id, name, description, url });
}

global.isInstallApp = (id) => new Promise((resolve) => {
    if (!(location.protocol !== `${protocolStr}://` || location.protocol !== `${fileProtocolStr}://` || location.hostname !== 'store.aoichaan0513.xyz' || location.host !== 'localhost:3000')) return;

    ipcRenderer.send('data-apps-is', { id });
    ipcRenderer.once('data-apps-is', (e, args) => {
        resolve([args.id, args.isInstalled]);
    });
});

/*
// ====================================================================== //
// ====================================================================== //
// ====================================================================== //
*/

global.togglePictureInPicture = (i = 0) => {
    if (!document.pictureInPictureElement) {
        if (document.querySelectorAll('video').length > 0 && document.querySelectorAll('video').length > i
            && document.querySelectorAll('video')[i] != undefined) {
            document.querySelectorAll('video')[i].requestPictureInPicture();
            return;
        } else {
            throw Error('Video Element Not found.');
            return;
        }
    } else {
        document.exitPictureInPicture();
        return;
    }
}

onload = () => {
    if (location.protocol === `${protocolStr}:` || location.protocol === `${fileProtocolStr}://` || location.hostname === 'store.aoichaan0513.xyz' || location.host === 'localhost:3000') return;

    delete global.getConfigPath;
    delete global.getFiles;
    delete global.getFile;

    delete global.openInEditor;

    delete global.getAppName;
    delete global.getAppDescription;
    delete global.getAppVersion;
    delete global.getAppChannel;
    delete global.getChromiumVersion;

    delete global.clearBrowserData;

    delete global.updateFilters;

    delete global.addBookmark;
    delete global.removeBookmark;
    delete global.getBookmarks;
    delete global.clearBookmarks;
    delete global.getHistorys;
    delete global.clearHistory;
    delete global.getDownloads;
    delete global.clearDownloads;

    delete global.getApps;
    delete global.clearApps;

    delete global.getCurrentUser;
    delete global.loginAccount;
    delete global.createAccount;
    delete global.logoutAccount;
    delete global.syncAccount;
    delete global.updateAccount;

    delete global.getHomeButton;
    delete global.setHomeButton;
    delete global.getBookmarkBar;
    delete global.setBookmarkBar;
    delete global.getDarkTheme;
    delete global.setDarkTheme;
    delete global.getCustomTitlebar;
    delete global.setCustomTitlebar;

    delete global.getDefaultHomePage;
    delete global.setDefaultHomePage;
    delete global.getStartPage;
    delete global.setStartPage;

    delete global.getSearchEngines;
    delete global.getSearchEngine;
    delete global.setSearchEngine;

    delete global.getVideoCamera;
    delete global.setVideoCamera;
    delete global.getMicroPhone;
    delete global.setMicroPhone;
    delete global.getGeolocation;
    delete global.setGeolocation;
    delete global.getNotifications;
    delete global.setNotifications;
    delete global.getMidiSysex;
    delete global.setMidiSysex;
    delete global.getPointerLock;
    delete global.setPointerLock;
    delete global.getFullScreen;
    delete global.setFullScreen;
    delete global.getOpenExternal;
    delete global.setOpenExternal;

    delete global.getAdBlock;
    delete global.setAdBlock;

    delete global.getLanguage;
    delete global.setLanguage;
    delete global.getLanguageFile;

    delete global.restart;
    delete global.isURL;

    delete global.installApp;
    delete global.isInstallApp;
}

onfocus = (e) => {
    ipcRenderer.send(`view-focus-${remote.getCurrentWindow().id}`, {});
}

onmousedown = (e) => {
    if (remote.getCurrentWindow().getBrowserViews()[0] == undefined) return;
    const view = remote.getCurrentWindow().getBrowserViews()[0];
    const url = view.webContents.getURL();

    if (e.button == 3) {
        if (view.webContents.canGoBack())
            view.webContents.goBack();
        if (url.startsWith(`${protocolStr}://error`)) {
            if (view.webContents.canGoBack())
                view.webContents.goBack();
            return;
        }
        return;
    } else if (e.button == 4) {
        if (view.webContents.canGoForward())
            view.webContents.goForward();
        if (url.startsWith(`${protocolStr}://error`)) {
            if (view.webContents.canGoForward())
                view.webContents.goForward();
            return;
        }
        return;
    }
}

if (window.location.host === 'chrome.google.com')
    injectChromeWebstoreInstallButton();