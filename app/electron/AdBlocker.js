const { app } = require('electron');
const { FiltersEngine, makeRequest } = require('@cliqz/adblocker');
const Axios = require('axios');
const fs = require('fs');
const path = require('path');
const tldts = require('tldts');
const { parse, format } = require('url');

const lists = require('./Lists.json');

const Config = require('electron-store');
const config = new Config();

let engine;

if (!fs.existsSync(path.join(app.getPath('userData'), 'Files'))) {
	fs.mkdirSync(path.join(app.getPath('userData'), 'Files'));
}

const ops = [];

const updateFilters = () => {
	if (!fs.existsSync(path.join(app.getPath('userData'), 'Files'))) {
		fs.mkdirSync(path.join(app.getPath('userData'), 'Files'));
	}

	console.log('Downloading filters...');

	for (const key in lists) {
		ops.push(Axios.get(lists[key]));
	}

	Axios.all(ops).then(res => {
		let data = '';

		for (const res1 of res) {
			data += res1.data;
		}

		console.log('Parsing filters...');

		engine = FiltersEngine.parse(data);

		console.log('Saving output...');

		fs.writeFile(path.resolve(path.join(app.getPath('userData'), 'Files', 'Ads.dat')), engine.serialize(), err => {
			if (err) return console.error(err);
			console.log('Complete.');
		});
	});
}

module.exports.updateFilters = updateFilters;

module.exports.loadFilters = async () => {
	const filePath = path.resolve(path.join(app.getPath('userData'), 'Files', 'Ads.dat'));

	if (fs.existsSync(filePath)) {
		fs.readFile(path.resolve(filePath), (err, buffer) => {
			if (err) return console.error(err);

			try {
				engine = FiltersEngine.deserialize(buffer);
			} catch (e) {
				updateFilters();
			}
		});
	} else {
		updateFilters();
	}
};

module.exports.hasFile = () => {
	const filePath = path.resolve(path.join(app.getPath('userData'), 'Files', 'Ads.dat'));

	return fs.existsSync(filePath);
}

module.exports.isEnabled = () => {
	return engine != undefined;
}

const isDisabledSite = (url) => {
	for (const item of config.get('adBlock.disabledSites')) {
		if (item.isSubDomain) {
			if (String(url).endsWith(item.url)) {
				return true;
			}
		} else {
			if (String(url) === String(item.url)) {
				return true;
			}
		}
	}
	return false;
}

module.exports.runAdblockService = (window, windowId, id, session) => {
	session.webRequest.onBeforeRequest({ urls: ['<all_urls>'] }, async (details, callback) => {
		if (engine && config.get('adBlock.isAdBlock')) {
			const { match, redirect } = engine.match(makeRequest({ type: details.resourceType, url: details.url }, tldts.parse));

			if (match || redirect) {
				window.webContents.send(`blocked-ad-${windowId}`, { id });

				if (redirect) {
					callback({ redirectURL: redirect });
				} else {
					callback({ cancel: true });
				}

				return;
			}
		}

		callback({ cancel: false });
	});
}

module.exports.removeAds = (url, webContents) => {
	if (engine == undefined) return;

	let urlWithoutProtocol = new URL(url).hostname;

	new Promise((resolve, reject) => {
		resolve(isDisabledSite(urlWithoutProtocol));
	}).then((result) => {
		console.log(`${urlWithoutProtocol} is AdBlock ${result ? 'Paused' : 'Run'}`);
		if (!result) {
			console.log(`${urlWithoutProtocol} is Run`);
			const { styles, scripts } = engine.getCosmeticsFilters({
				url,
				...tldts.parse(url),
			});

			webContents.insertCSS(styles);

			for (const script of scripts) {
				console.log(script);
				webContents.executeJavaScript(script);
			}
			return;
		} else {
			return;
		}
	});
}