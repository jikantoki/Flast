const { app } = require('electron');
const { ElectronBlocker, Request } = require('@cliqz/adblocker-electron');
const fetch = require('node-fetch');
const Axios = require('axios');
const { exists, existsSync, readFile, readFileSync, writeFile, mkdir } = require('fs');
const { resolve, join } = require('path');
const tldts = require('tldts');
const { parse, format } = require('url');

const lists = require('./Lists.json');

const Config = require('electron-store');
const config = new Config();
const userConfig = new Config({
	cwd: join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

const PRELOAD_PATH = join(__dirname, './Preloads/Preload.js');

let blocker;

/*
if (!existsSync(join(app.getPath('userData'), 'Files')))
	mkdirSync(join(app.getPath('userData'), 'Files'));
*/

const loadFilters = async () => {
	const filters = [];
	await userConfig.get('adBlock.filters').filter((value) => value.isEnabled).forEach((item) => filters.push(item.url));
	blocker = await ElectronBlocker.fromLists(fetch, filters);
};

let adblockRunning = false;

const runAdblockService = async (ses) => {
	if (!blocker)
		await loadFilters();
	blocker.enableBlockingInSession(ses);
};

const stopAdblockService = async (ses) => {
	blocker.disableBlockingInSession(ses);
};

const isDisabled = (url) => {
	for (const item of userConfig.get('adBlock.disabledSites'))
		if (String(url).startsWith(item.url))
			return true;
	return false;
}

module.exports = { loadFilters, runAdblockService, stopAdblockService };