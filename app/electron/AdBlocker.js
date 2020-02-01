const { app } = require('electron');
const { ElectronBlocker, Request } = require('@cliqz/adblocker-electron');
const fetch = require('node-fetch');
const Axios = require('axios');
const { existsSync, readFile, writeFile, mkdirSync } = require('fs');
const { resolve, join } = require('path');
const tldts = require('tldts');
const { parse, format } = require('url');

const lists = require('./Lists.json');

const Config = require('electron-store');
const config = new Config();

const PRELOAD_PATH = join(__dirname, './Preloads/Preload.js');

let engine;

if (!existsSync(join(app.getPath('userData'), 'Files')))
	mkdirSync(join(app.getPath('userData'), 'Files'));

const loadFilters = async (forceDownload = false) => {
	const filePath = resolve(join(app.getPath('userData'), 'Files', 'Ads.dat'));

	const downloadFilters = async () => {
		engine = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch);

		await writeFile(filePath, engine.serialize(), (err) => { if (err) return console.error(err); });
	};

	if (!forceDownload && existsSync(filePath)) {
		try {
			await readFile(resolve(filePath), (err, data) => {
				try {
					engine = ElectronBlocker.deserialize(data);
				} catch (e) {
					return downloadFilters();
				}
			});
		} catch (err) {
			return console.error(err);
		}
	} else {
		return downloadFilters();
	}
};

let adblockRunning = false;

const runAdblockService = async (ses) => {
	if (!engine)
		await loadFilters();

	engine.enableBlockingInSession(ses);
};

const stopAdblockService = (ses) => {
	engine.disableBlockingInSession(ses);
};

const isDisabled = (url) => {
	for (const item of config.get('adBlock.disabledSites'))
		if (String(url).startsWith(item.url))
			return true;
	return false;
}

module.exports = {
	loadFilters, runAdblockService, stopAdblockService
};