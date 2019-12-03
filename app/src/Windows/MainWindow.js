import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Tippy from '@tippy.js/react';
import Sortable from 'sortablejs';
import { parse, format } from 'url';

import Window from './Components/Window';
import WindowButtons from './Components/WindowButtons';
import WindowButton from './Components/WindowButton';
import WindowContent from './Components/WindowContent';
import Titlebar from './Components/Titlebar';
import Tabs from './Components/Tabs';
import { TabContainer, Tab, TabIcon, TabTitle, TabStatusIcon, TabCloseButton } from './Components/Tab';
import TabButton from './Components/TabButton';
import TabContent from './Components/TabContent';
import Toolbar from './Components/Toolbar';
import { ToolbarButton, ToolbarButtonBadge } from './Components/ToolbarButton';
import ToolbarDivider from './Components/ToolbarDivider';
import { ToolbarTextBoxWrapper, ToolbarTextBox, ToolbarTextBox2 } from './Components/ToolbarTextBox';
import BookmarkBar from './Components/BookmarkBar';
import ContentWrapper from './Components/ContentWrapper';

import ApplicationIcon from './Resources/icon.png';

import WindowMinimizeIcon from './Resources/windows/minimize.svg';
import WindowMaximizeIcon from './Resources/windows/maximize.svg';
import WindowCloseIcon from './Resources/windows/close.svg';

import DarkFullScreenExitIcon from './Resources/dark/fullscreen_exit.svg';
import LightFullScreenExitIcon from './Resources/light/fullscreen_exit.svg';

import DarkBackIcon from './Resources/dark/arrow_back.svg';
import LightBackIcon from './Resources/light/arrow_back.svg';
import DarkForwardIcon from './Resources/dark/arrow_forward.svg';
import LightForwardIcon from './Resources/light/arrow_forward.svg';

import BackInActiveIcon from './Resources/inactive/arrow_back.svg';
import ForwardInActiveIcon from './Resources/inactive/arrow_forward.svg';

import DarkReloadIcon from './Resources/dark/reload.svg';
import LightReloadIcon from './Resources/light/reload.svg';
import DarkHomeIcon from './Resources/dark/home.svg';
import LightHomeIcon from './Resources/light/home.svg';

import DarkInfomationIcon from './Resources/dark/info.svg';
import LightInfomationIcon from './Resources/light/info.svg';

import DarkSecureIcon from './Resources/dark/secure.svg';
import LightSecureIcon from './Resources/light/secure.svg';
import DarkInSecureIcon from './Resources/dark/insecure.svg';
import LightInSecureIcon from './Resources/light/insecure.svg';

import DarkTranslateIcon from './Resources/dark/translate.svg';
import LightTranslateIcon from './Resources/light/translate.svg';

import DarkZoomInIcon from './Resources/dark/zoom_in.svg';
import LightZoomInIcon from './Resources/light/zoom_in.svg';
import DarkZoomOutIcon from './Resources/dark/zoom_out.svg';
import LightZoomOutIcon from './Resources/light/zoom_out.svg';

import DarkStarIcon from './Resources/dark/star.svg';
import LightStarIcon from './Resources/light/star.svg';
import DarkStarFilledIcon from './Resources/dark/star-filled.svg';
import LightStarFilledIcon from './Resources/light/star-filled.svg';

import DarkFeedbackIcon from './Resources/dark/feedback.svg';
import LightFeedbackIcon from './Resources/light/feedback.svg';
import DarkAccountIcon from './Resources/dark/account.svg';
import LightAccountIcon from './Resources/light/account.svg';

import DarkShieldIcon from './Resources/dark/shield.svg';
import LightShieldIcon from './Resources/light/shield.svg';

import DarkMoreIcon from './Resources/dark/more.svg';
import LightMoreIcon from './Resources/light/more.svg';

import DarkPublicIcon from './Resources/dark/public.svg';
import LightPublicIcon from './Resources/light/public.svg';

import DarkAddIcon from './Resources/dark/add.svg';
import LightAddIcon from './Resources/light/add.svg';
import DarkCloseIcon from './Resources/dark/close.svg';
import LightCloseIcon from './Resources/light/close.svg';

import DarkAudioIcon from './Resources/dark/audio.svg';
import LightAudioIcon from './Resources/light/audio.svg';
import DarkAudioMuteIcon from './Resources/dark/audio_mute.svg';
import LightAudioMuteIcon from './Resources/light/audio_mute.svg';

import DarkSearchIcon from './Resources/dark/search.svg';
import LightSearchIcon from './Resources/light/search.svg';

import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import 'tippy.js/themes/light-border.css';
import 'tippy.js/themes/material.css';
import 'tippy.js/themes/translucent.css';

import { isURL, prefixHttp } from '../Utils/URL';

const { remote, ipcRenderer, shell } = window.require('electron');
const { app, systemPreferences, Menu, MenuItem, dialog, nativeTheme } = remote;

const pkg = window.require(`${app.getAppPath()}/package.json`);
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const platform = window.require('electron-platform');
const path = window.require('path');
const process = window.require('process');

const Config = window.require('electron-store');
const config = new Config();

const lang = window.require(`${app.getAppPath()}/langs/${config.get('language') != undefined ? config.get('language') : 'ja'}.js`);

class BrowserView extends Component {
	constructor(props) {
		super(props);

		this.blockCount = 0;

		this.state = {
			barText: '',
			findText: '',
			previousText: '',
			resultString: '',
			activeMatch: 0,
			certificate: {},
			viewUrl: '',
			zoomSize: 1,
			isLoading: false,
			canGoBack: false,
			canGoForward: false,
			isBookmarked: false,
			isShowing: true,
		};
	}

	componentDidMount() {
		this.setState({ zoomSize: config.get('pageSettings.defaultZoomSize') });

		/*
		let webView = this.refs.webView;
		let props = this.props;

		webView.addEventListener('did-finish-load', (e) => {
			document.title = webView.getTitle();
			this.setText(webView.getURL());
			this.props.updateTab(webView.getTitle(), PublicIcon, webView.getURL(), this.props.index);
			this.setState({ barText: webView.getURL() });
		}, false);

		webView.addEventListener('page-title-updated', (e) => {
			document.title = webView.getTitle();
			this.setText(webView.getURL());
			this.props.updateTab(webView.getTitle(), PublicIcon, webView.getURL(), this.props.index);
			this.setState({ barText: webView.getURL() });
		}, false);

		webView.addEventListener('page-favicon-updated', (e) => {
			if (e.favicons.length > 0) {
				this.props.updateTab(webView.getTitle(), e.favicons[0], webView.getURL(), this.props.index);
			} else {
				this.props.updateTab(webView.getTitle(), PublicIcon, webView.getURL(), this.props.index);
			}
		});

		webView.addEventListener('load-commit', (e) => {
			if (e.isMainFrame) {
				document.title = webView.getTitle();
				this.setText(webView.getURL());
				this.props.updateTab(webView.getTitle(), PublicIcon, webView.getURL(), this.props.index);
				this.setState({ barText: webView.getURL() });
			}
		});

		webView.addEventListener('found-in-page', (e, result) => {
			if (result.activeMatchOrdinal) {
				this.setState({
					activeMatch: result.activeMatchOrdinal,
					resultString: `${this.state.activeMatch}/${result.matches}`
				});
			}

			if (result.finalUpdate) {
				this.setState({ resultString: `${this.state.activeMatch}/${result.matches}` });
			}
		});

		webView.addEventListener('new-window', (e, url) => {
			this.props.addTab('新しいタブ', '', e.url);
		});
		*/

		ipcRenderer.on(`browserView-start-loading-${this.props.windowId}`, (e, args) => {
			if (args.id === this.props.index) {
				this.setState({ isLoading: true });
				this.blockCount = 0;
			}
		});

		ipcRenderer.on(`browserView-stop-loading-${this.props.windowId}`, (e, args) => {
			if (args.id === this.props.index) {
				this.setState({ isLoading: false });
			}
		});

		ipcRenderer.on(`browserView-load-${this.props.windowId}`, (e, args) => {
			if (args.id === this.props.index) {
				this.props.updateTab();
				this.setState({ viewUrl: args.url, isBookmarked: args.isBookmarked });
				this.setText(args.url);
			}
		});

		ipcRenderer.on(`browserView-certificate-${this.props.windowId}`, (e, args) => {
			if (args.id === this.props.index) {
				this.setState({ certificate: args.certificate });
			}
		});

		ipcRenderer.on(`blocked-ad-${this.props.windowId}`, (e, args) => {
			if (args.id === this.props.index) {
				this.blockCount++
			}
		});

		ipcRenderer.on(`update-navigation-state-${this.props.windowId}`, (e, args) => {
			if (args.id === this.props.index) {
				this.setState({ canGoBack: args.canGoBack, canGoForward: args.canGoForward });
			}
		});

		ipcRenderer.on(`browserView-permission-${this.props.windowId}`, (e, args) => {
			if (args.id === this.props.index) {
				const toolTip = findDOMNode(this.infomationTooltip)._tippy;
				toolTip.setContent(args.content);
				toolTip.show();
				setTimeout(() => {
					toolTip.hide();
				}, 1250);
			}
		});

		ipcRenderer.on(`browserView-zoom-${this.props.windowId}`, (e, args) => {
			this.setState({ zoomSize: args.result });
		});

		ipcRenderer.on(`notification-${this.props.windowId}`, (e, args) => {
			if (args.id === this.props.index) {
				const toolTip = findDOMNode(this.infomationTooltip)._tippy;
				toolTip.setContent(args.content);
				toolTip.show();
				setTimeout(() => {
					toolTip.hide();
				}, 1250);
			}
		});
	}

	getTheme = () => {
		if (config.get('design.theme') === -1)
			return nativeTheme.shouldUseDarkColors;
		else if (config.get('design.theme') === 0)
			return false;
		else if (config.get('design.theme') === 1)
			return true;
	}

	handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			const value = this.state.barText;

			if (value.length > 0 || value !== '') {
				ipcRenderer.send(`window-hideSuggest-${this.props.windowId}`, {});

				if (isURL(value) && !value.includes('://')) {
					ipcRenderer.send(`browserView-loadURL-${this.props.windowId}`, { id: this.props.index, url: `http://${value}` });
				} else if (!value.includes('://')) {
					ipcRenderer.send(`browserView-loadURL-${this.props.windowId}`, { id: this.props.index, url: this.getSearchEngine().url.replace('%s', encodeURIComponent(value)) });
				} else {
					const pattern = /^(file:\/\/\S.*)\S*$/;

					if (pattern.test(value)) {
						ipcRenderer.send(`browserView-loadFile-${this.props.windowId}`, { id: this.props.index, url: value.replace('file:///', '') });
					} else {
						ipcRenderer.send(`browserView-loadURL-${this.props.windowId}`, { id: this.props.index, url: value });
					}
				}
			} else {
				ipcRenderer.send(`window-hideSuggest-${this.props.windowId}`, {});

				this.setText(this.state.viewUrl);
			}
		} else if (e.key === 'Escape') {
			ipcRenderer.send(`window-hideSuggest-${this.props.windowId}`, {});

			this.setText(this.state.viewUrl);
		}
	}

	handleContextMenu = (e) => {
		const menu = Menu.buildFromTemplate([
			{
				label: lang.window.view.contextMenu.editable.undo,
				accelerator: 'CmdOrCtrl+Z',
				role: 'undo'
			},
			{
				label: lang.window.view.contextMenu.editable.redo,
				accelerator: 'CmdOrCtrl+Y',
				role: 'redo'
			},
			{ type: 'separator' },
			{
				label: lang.window.view.contextMenu.editable.cut,
				accelerator: 'CmdOrCtrl+X',
				role: 'cut'
			},
			{
				label: lang.window.view.contextMenu.editable.copy,
				accelerator: 'CmdOrCtrl+C',
				role: 'copy'
			},
			{
				label: lang.window.view.contextMenu.editable.paste,
				accelerator: 'CmdOrCtrl+V',
				role: 'paste'
			},
			{ type: 'separator' },
			{
				label: lang.window.view.contextMenu.editable.selectAll,
				accelerator: 'CmdOrCtrl+A',
				role: 'selectAll'
			}
		]);
		menu.popup();
	}

	getSearchEngine = () => {
		for (var i = 0; i < config.get('searchEngine.searchEngines').length; i++) {
			if (config.get('searchEngine.searchEngines')[i].name === config.get('searchEngine.defaultEngine')) {
				return config.get('searchEngine.searchEngines')[i];
			}
		}
	}

	setText = (text) => {
		this.setState({ barText: text });
	}

	goBack = () => {
		ipcRenderer.send(`browserView-goBack-${this.props.windowId}`, { id: this.props.index });
	}

	goForward = () => {
		ipcRenderer.send(`browserView-goForward-${this.props.windowId}`, { id: this.props.index });
	}

	reload = () => {
		if (!this.state.isLoading) {
			ipcRenderer.send(`browserView-reload-${this.props.windowId}`, { id: this.props.index });
		} else {
			ipcRenderer.send(`browserView-stop-${this.props.windowId}`, { id: this.props.index });
		}
	}

	goHome = () => {
		ipcRenderer.send(`browserView-goHome-${this.props.windowId}`, { id: this.props.index });
	}

	certificate = () => {
		let title = '';
		let description = '';
		if (this.state.certificate.type === 'Internal') {
			title = lang.window.toolBar.addressBar.info.clicked.internal;
		} else if (this.state.certificate.type === 'Source') {
			title = lang.window.toolBar.addressBar.info.clicked.viewSource;
		} else if (this.state.certificate.type === 'File') {
			title = lang.window.toolBar.addressBar.info.clicked.file;
		} else if (this.state.certificate.type === 'Secure') {
			title = `<span style="color: ${this.getTheme() || String(this.props.windowId).startsWith('private') ? '#81c995' : '#188038'};">${lang.window.toolBar.addressBar.info.clicked.secure.title}</span>`;
			description = `${lang.window.toolBar.addressBar.info.clicked.secure.description}${this.state.certificate.title != undefined && this.state.certificate.title != null ? `<br /><br />${this.state.certificate.title} [${this.state.certificate.country}]` : ''}`;
		} else if (this.state.certificate.type === 'InSecure') {
			title = `<span style="color: ${this.getTheme() || String(this.props.windowId).startsWith('private') ? '#f28b82' : '#c5221f'};">${lang.window.toolBar.addressBar.info.clicked.insecure.title}</span>`;
			description = lang.window.toolBar.addressBar.info.clicked.insecure.description;
		}

		ipcRenderer.send(`window-infoWindow-${this.props.windowId}`, { title, description, url: this.state.viewUrl, isButton: false });
	}

	bookMark = () => {
		const toolTip = findDOMNode(this.markTooltip)._tippy;
		toolTip.show();
		setTimeout(() => {
			toolTip.hide();
		}, 1250);
		if (this.state.isBookmarked)
			ipcRenderer.send(`data-bookmark-remove-${this.props.windowId}`, { id: this.props.index, isPrivate: this.props.windowId.startsWith('private') });
		else
			ipcRenderer.send(`data-bookmark-add-${this.props.windowId}`, { id: this.props.index, isPrivate: this.props.windowId.startsWith('private') });
	}

	userMenu = async () => {
		const menu = Menu.buildFromTemplate([
			{
				label: (!this.props.windowId.startsWith('private') ? `${process.env.USERNAME} でログイン中` : 'プライベートモード'),
				enabled: false,
			},
			{ type: 'separator' },
			{
				label: lang.window.toolBar.menu.menus.close,
				click: () => { remote.getCurrentWindow().close(); }
			}
		]);
		menu.popup({
			x: remote.getCurrentWindow().getSize()[0] - 57,
			y: 67
		});
	}

	moreMenu = () => {
		const menu = Menu.buildFromTemplate([
			{
				label: lang.window.toolBar.menu.menus.newTab,
				accelerator: 'CmdOrCtrl+T',
				click: () => { this.props.addTab(config.get('homePage.defaultPage')); }
			},
			{
				label: lang.window.toolBar.menu.menus.newWindow,
				accelerator: 'CmdOrCtrl+N',
				click: () => { ipcRenderer.send(`window-add`, { isPrivate: false }); }
			},
			{
				label: lang.window.toolBar.menu.menus.openPrivateWindow,
				accelerator: 'CmdOrCtrl+Shift+N',
				click: () => { ipcRenderer.send(`window-add`, { isPrivate: true }); }
			},
			{ type: 'separator' },
			{
				label: lang.window.toolBar.menu.menus.zoom.name,
				type: 'submenu',
				submenu: [
					{
						label: lang.window.toolBar.menu.menus.zoom.zoomIn,
						icon: `${app.getAppPath()}/static/dark/zoom_in.png`,
						click: () => { ipcRenderer.send(`browserView-zoomIn-${this.props.windowId}`, { id: this.props.index }); }
					},
					{
						label: lang.window.toolBar.menu.menus.zoom.zoomOut,
						icon: `${app.getAppPath()}/static/dark/zoom_out.png`,
						click: () => { ipcRenderer.send(`browserView-zoomOut-${this.props.windowId}`, { id: this.props.index }); }
					},
					{ type: 'separator' },
					{
						label: lang.window.toolBar.menu.menus.zoom.zoomDefault,
						click: () => { ipcRenderer.send(`browserView-zoomDefault-${this.props.windowId}`, { id: this.props.index }); }
					},
					{ type: 'separator' },
					{
						label: lang.window.toolBar.menu.menus.zoom.fullScreen,
						icon: `${app.getAppPath()}/static/dark/fullscreen.png`,
						click: () => { ipcRenderer.send(`window-fullScreen-${this.props.windowId}`, {}); }
					}
				]
			},
			{ type: 'separator' },
			{
				label: lang.window.toolBar.menu.menus.history,
				icon: `${app.getAppPath()}/static/dark/history.png`,
				click: () => { this.props.addTab(`${protocolStr}://history/`); }
			},
			{
				label: lang.window.toolBar.menu.menus.downloads,
				icon: `${app.getAppPath()}/static/dark/download.png`,
				click: () => { this.props.addTab(`${protocolStr}://downloads/`); }
			},
			{
				label: lang.window.toolBar.menu.menus.bookmarks,
				icon: `${app.getAppPath()}/static/dark/bookmarks.png`,
				click: () => { this.props.addTab(`${protocolStr}://bookmarks/`); }
			},
			{
				label: lang.window.toolBar.menu.menus.app.name,
				type: 'submenu',
				submenu: [
					{
						label: lang.window.toolBar.menu.menus.app.list,
						icon: `${app.getAppPath()}/static/dark/apps.png`,
						click: () => { this.props.addTab(`${protocolStr}://apps/`); }
					},
					{
						label: String(lang.window.toolBar.menu.menus.app.run).replace(/{title}/, lang.window.toolBar.menu.menus.app.name),
						click: () => { ipcRenderer.send(`appWindow-add`, { url: this.state.viewUrl }); }
					},
					{ type: 'separator' },
					{
						label: lang.window.toolBar.menu.menus.app.store,
						icon: `${app.getAppPath()}/static/dark/shop.png`,
						enabled: false,
						click: () => { this.props.addTab(`http://store.aoichaan0513.xyz/`); }
					},
					{ type: 'separator' },
					{
						label: lang.window.toolBar.menu.menus.app.store,
						icon: `${app.getAppPath()}/static/dark/shop.png`,
						click: () => { ipcRenderer.send(`window-adBlock-${this.props.windowId}`, {}); }
					},
				]
			},
			{ type: 'separator' },
			{
				label: lang.window.toolBar.menu.menus.print,
				icon: `${app.getAppPath()}/static/dark/print.png`,
				accelerator: 'CmdOrCtrl+P',
				click: () => { ipcRenderer.send(`browserView-print-${this.props.windowId}`, { id: this.props.index }); }
			},
			{
				label: lang.window.toolBar.menu.menus.find,
				icon: `${app.getAppPath()}/static/dark/find.png`,
				accelerator: 'CmdOrCtrl+F',
				enabled: false,
				click: () => { this.props.addTab(`${protocolStr}://history/`); }
			},
			{ type: 'separator' },
			{
				label: lang.window.toolBar.menu.menus.settings,
				icon: `${app.getAppPath()}/static/dark/settings.png`,
				click: () => { this.props.addTab(`${protocolStr}://settings/`); }
			},
			{
				label: lang.window.toolBar.menu.menus.help,
				icon: `${app.getAppPath()}/static/dark/help_outline.png`,
				click: () => { this.props.addTab(`${protocolStr}://help/`); }
			},
			{ type: 'separator' },
			{
				label: lang.window.toolBar.menu.menus.close,
				accelerator: platform.isDarwin ? 'Cmd+Q' : 'Alt+F4',
				click: () => { this.props.closeWindow(); }
			}
		]);
		menu.popup({
			x: remote.getCurrentWindow().getSize()[0] - 24,
			y: 67
		});
	}

	isDarkModeOrPrivateMode = () => {
		return this.getTheme() || String(this.props.windowId).startsWith('private');
	}

	isDarkModeOrPrivateMode = (lightMode, darkMode) => {
		return !(this.getTheme() || String(this.props.windowId).startsWith('private')) ? lightMode : darkMode;
	}

	getCertificateIcon = () => {
		if (this.state.certificate !== undefined && this.state.certificate !== null) {
			if (this.state.certificate.type === 'Secure') {
				return this.isDarkModeOrPrivateMode.bind(this, LightSecureIcon, DarkSecureIcon);
			} else if (this.state.certificate.type === 'InSecure') {
				return this.isDarkModeOrPrivateMode.bind(this, LightInSecureIcon, DarkInSecureIcon);
			} else if (this.state.certificate.type === 'Internal') {
				return this.isDarkModeOrPrivateMode.bind(this, ApplicationIcon, ApplicationIcon);
			} else if (this.state.certificate.type === 'Search') {
				return this.isDarkModeOrPrivateMode.bind(this, LightSearchIcon, DarkSearchIcon);
			} else {
				return this.isDarkModeOrPrivateMode.bind(this, LightInfomationIcon, DarkInfomationIcon);
			}
		} else {
			return this.isDarkModeOrPrivateMode.bind(this, LightInfomationIcon, DarkInfomationIcon);
		}
	}

	getButtonCount = () => {
		var i = 1;

		if (this.state.zoomSize != config.get('pageSettings.defaultZoomSize'))
			i += 1;

		if (!this.state.barText.startsWith(protocolStr))
			i += 2;

		return i;
	}

	render() {
		return (
			<ContentWrapper isLoading={this.state.isLoading} isDarkModeOrPrivateMode={this.getTheme() || String(this.props.windowId).startsWith('private')}>
				<Toolbar isDarkModeOrPrivateMode={this.getTheme() || String(this.props.windowId).startsWith('private')} isBookmarkBar={config.get('design.isBookmarkBar')}>
					<ToolbarButton isDarkModeOrPrivateMode={this.getTheme() || String(this.props.windowId).startsWith('private')} src={this.state.canGoBack ? this.isDarkModeOrPrivateMode.bind(this, LightBackIcon, DarkBackIcon) : BackInActiveIcon} size={24}
						isShowing={true} isRight={false} isMarginLeft={true} isEnabled={this.state.canGoBack} title={lang.window.toolBar.back} onClick={() => { this.goBack(); }} />
					<ToolbarButton isDarkModeOrPrivateMode={this.getTheme() || String(this.props.windowId).startsWith('private')} src={this.state.canGoForward ? this.isDarkModeOrPrivateMode.bind(this, LightForwardIcon, DarkForwardIcon) : ForwardInActiveIcon} size={24}
						isShowing={true} isRight={false} isMarginLeft={false} isEnabled={this.state.canGoForward} title={lang.window.toolBar.forward} onClick={() => { this.goForward(); }} />
					<ToolbarButton isDarkModeOrPrivateMode={this.getTheme() || String(this.props.windowId).startsWith('private')} src={!this.state.isLoading ? this.isDarkModeOrPrivateMode.bind(this, LightReloadIcon, DarkReloadIcon) : this.isDarkModeOrPrivateMode.bind(this, LightCloseIcon, DarkCloseIcon)} size={24}
						isShowing={true} isRight={false} isMarginLeft={false} isEnabled={true} title={!this.state.isLoading ? lang.window.toolBar.reload.reload : lang.window.toolBar.reload.stop} onClick={() => { this.reload(); }} />
					<ToolbarButton isDarkModeOrPrivateMode={this.getTheme() || String(this.props.windowId).startsWith('private')} src={this.isDarkModeOrPrivateMode.bind(this, LightHomeIcon, DarkHomeIcon)} size={24}
						isShowing={config.get('design.isHomeButton')} isRight={false} isMarginLeft={false} isEnabled={true} title={lang.window.toolBar.home} onClick={() => { this.goHome(); }} />
					<ToolbarTextBoxWrapper isDarkModeOrPrivateMode={this.getTheme() || String(this.props.windowId).startsWith('private')}>
						<ToolbarButton isDarkModeOrPrivateMode={this.getTheme() || String(this.props.windowId).startsWith('private')} src={this.getCertificateIcon()} size={18}
							isShowing={true} isRight={false} isMarginLeft={true} isEnabled={this.state.certificate.type !== 'Search'} title={lang.window.toolBar.addressBar.info.name} onClick={() => { this.state.certificate.type !== 'Search' && this.certificate(); }} />

						<ToolbarTextBox buttonCount={this.getButtonCount} value={decodeURIComponent(this.state.barText)} onChange={(e) => { this.setState({ barText: e.target.value }); ipcRenderer.send(`window-showSuggest-${this.props.windowId}`, { id: this.props.index, text: e.target.value }); e.currentTarget.focus(); }} onKeyDown={this.handleKeyDown} onFocus={(e) => { e.target.select(); }} onContextMenu={this.handleContextMenu} />

						<ToolbarButton isDarkModeOrPrivateMode={this.getTheme() || String(this.props.windowId).startsWith('private')} src={this.isDarkModeOrPrivateMode.bind(this, LightTranslateIcon, DarkTranslateIcon)} size={18} style={{ right: this.state.zoomSize != config.get('pageSettings.defaultZoomSize') ? 60 : 30, borderRadius: 0 }}
							isShowing={!this.state.barText.startsWith(protocolStr)} isRight={true} isMarginLeft={true} isEnabled={true} title={lang.window.toolBar.addressBar.translate} onClick={() => { ipcRenderer.send(`window-translateWindow-${this.props.windowId}`, { url: this.state.viewUrl }); }} />

						<ToolbarButton isDarkModeOrPrivateMode={this.getTheme() || String(this.props.windowId).startsWith('private')} src={this.state.zoomSize > config.get('pageSettings.defaultZoomSize') ? this.isDarkModeOrPrivateMode.bind(this, LightZoomInIcon, DarkZoomInIcon) : this.isDarkModeOrPrivateMode.bind(this, LightZoomOutIcon, DarkZoomOutIcon)}
							size={18} style={{ right: !this.state.barText.startsWith(protocolStr) ? 30 : 0, borderRadius: 0 }} isShowing={this.state.zoomSize != config.get('pageSettings.defaultZoomSize')} isRight={true} isMarginLeft={true} isEnabled={true} title={lang.window.toolBar.addressBar.zoomDefault} onClick={() => { ipcRenderer.send(`browserView-zoomDefault-${this.props.windowId}`, { id: this.props.index }); }} />

						<Tippy ref={ref => { this.markTooltip = ref; }} content={!this.state.isBookmarked ? (this.props.windowId.startsWith('private') ? lang.window.toolBar.addressBar.bookmark.clicked.removePrivate : lang.window.toolBar.addressBar.bookmark.clicked.remove) : (this.props.windowId.startsWith('private') ? lang.window.toolBar.addressBar.bookmark.clicked.addPrivate : lang.window.toolBar.addressBar.bookmark.clicked.add)} theme={this.getTheme() || String(this.props.windowId).startsWith('private') ? 'dark' : 'light'} placement="left" arrow={true} trigger="manual">
							<ToolbarButton isDarkModeOrPrivateMode={this.getTheme() || String(this.props.windowId).startsWith('private')} src={this.state.isBookmarked ? this.isDarkModeOrPrivateMode.bind(this, LightStarFilledIcon, DarkStarFilledIcon) : this.isDarkModeOrPrivateMode.bind(this, LightStarIcon, DarkStarIcon)} size={18}
								isShowing={!this.state.barText.startsWith(protocolStr)} isRight={true} isMarginLeft={true} isEnabled={true} title={this.state.isBookmarked ? lang.window.toolBar.addressBar.bookmark.remove : lang.window.toolBar.addressBar.bookmark.add} onClick={() => { this.bookMark(); }} />
						</Tippy>
					</ToolbarTextBoxWrapper>
					<ToolbarButton isDarkModeOrPrivateMode={this.getTheme() || String(this.props.windowId).startsWith('private')} src={this.isDarkModeOrPrivateMode.bind(this, LightShieldIcon, DarkShieldIcon)} size={24}
						isShowing={config.get('adBlock.isAdBlock')} isRight={true} isMarginLeft={true} isEnabled={true} title={String(lang.window.toolBar.extensions.adBlock).replace(/{replace}/, this.blockCount)} onClick={() => { this.props.addTab(`${protocolStr}://settings/`); }}>
						{this.blockCount > 0 && <ToolbarButtonBadge>{this.blockCount}</ToolbarButtonBadge>}
					</ToolbarButton>
					<ToolbarButton isDarkModeOrPrivateMode={this.getTheme() || String(this.props.windowId).startsWith('private')} src={this.isDarkModeOrPrivateMode.bind(this, LightFeedbackIcon, DarkFeedbackIcon)} size={24}
						isShowing={true} isRight={true} isMarginLeft={!config.get('adBlock.isAdBlock')} isEnabled={true} title={lang.window.toolBar.extensions.feedback} onClick={() => { this.props.addTab('https://join.slack.com/t/flast-develop/shared_invite/enQtNzM4MzM3OTExNjA3LWZkNTlmYTY0YzJjODNhYmY1OTlmYTllODRiMmJjNjA2YmUzNDg0OGMwZjliNmFhMjBlYWRjNTVhZTFkNWE3OTA'); }} />
					<ToolbarDivider isDarkModeOrPrivateMode={this.getTheme() || String(this.props.windowId).startsWith('private')} />
					<ToolbarButton isDarkModeOrPrivateMode={this.getTheme() || String(this.props.windowId).startsWith('private')} src={this.props.windowId.startsWith('private') ? this.isDarkModeOrPrivateMode.bind(this, LightShieldIcon, DarkShieldIcon) : this.isDarkModeOrPrivateMode.bind(this, LightAccountIcon, DarkAccountIcon)} size={24}
						isShowing={true} isRight={true} isMarginLeft={true} isEnabled={true} title={this.props.windowId.startsWith('private') ? 'プライベートモード' : process.env.USERNAME} onClick={() => { this.userMenu(); }} />
					<ToolbarButton isDarkModeOrPrivateMode={this.getTheme() || String(this.props.windowId).startsWith('private')} src={this.isDarkModeOrPrivateMode.bind(this, LightMoreIcon, DarkMoreIcon)} size={24}
						isShowing={true} isRight={true} isMarginLeft={false} isEnabled={true} title={lang.window.toolBar.menu.name} onClick={() => { ipcRenderer.send(`window-menuWindow-${this.props.windowId}`, { id: this.props.index, url: this.state.viewUrl }); }} />
				</Toolbar>
				<BookmarkBar isDarkModeOrPrivateMode={this.getTheme() || String(this.props.windowId).startsWith('private')} isBookmarkBar={config.get('design.isBookmarkBar')} />
			</ContentWrapper>
		);
	}
}

class MainWindow extends Component {
	constructor(props) {
		super(props);

		this.state = {
			tabs: [],
			current: 0
		};

		ipcRenderer.on(`window-maximized-${this.props.match.params.windowId}`, (e, args) => {
			this.forceUpdate();
		});
		ipcRenderer.on(`window-unmaximized-${this.props.match.params.windowId}`, (e, args) => {
			this.forceUpdate();
		});

		ipcRenderer.on(`window-focus-${this.props.match.params.windowId}`, (e, args) => {
			this.forceUpdate();
		});
		ipcRenderer.on(`window-blur-${this.props.match.params.windowId}`, (e, args) => {
			this.forceUpdate();
		});

		ipcRenderer.on('window-change-settings', (e, args) => {
			this.forceUpdate();
		});

		ipcRenderer.on(`tab-add-${this.props.match.params.windowId}`, (e, args) => {
			this.addTab(args.url);
		});

		ipcRenderer.on(`tab-get-${this.props.match.params.windowId}`, (e, args) => {
			if (args.id != null && args.view != null) {
				this.state.tabs.filter((item, i) => {
					if (args.id === item.id) {
						let newTabs = this.state.tabs.concat();
						newTabs[i] = args.view;
						this.setState({ tabs: newTabs });
						this.forceUpdate();

						console.log(this.state.tabs);
					}
				});
			} else {
				console.log(args.views);
				this.setState({ tabs: args.views });
				this.forceUpdate();
			}
		});

		ipcRenderer.on(`tab-select-${this.props.match.params.windowId}`, (e, args) => {
			this.setState({ current: args.id });
		});

		ipcRenderer.on(`update-navigation-state-${this.props.match.params.windowId}`, (e, args) => {
			this.state.tabs.filter((item, i) => {
				if (args.id === item.id) {
					var newTabs = this.state.tabs.concat();
					newTabs[i].isAudioStatus = args.isAudioStatus;
					this.setState({ tabs: newTabs });
				}
			});
		});
	}

	componentDidMount = () => {
		Sortable.create(findDOMNode(this.tabContainer), {
			group: {
				name: String(this.props.match.params.windowId).startsWith('private') ? 'private' : 'window'
			},
			filter: '.fixed-tab',
			animation: 100
		});

		this.props.match.params.urls.split('($|$)').map((url, i) => {
			this.addTab(decodeURIComponent(url));
		});
		this.getTabs();
	}

	getTheme = () => {
		if (config.get('design.theme') === -1)
			return nativeTheme.shouldUseDarkColors;
		else if (config.get('design.theme') === 0)
			return false;
		else if (config.get('design.theme') === 1)
			return true;
	}

	handleContextMenu = (id) => {
		this.state.tabs.filter((item, i) => {
			if (id === item.id) {
				const menu = Menu.buildFromTemplate([
					{
						label: '新しいタブ',
						accelerator: 'CmdOrCtrl+T',
						click: () => { this.addTab(); }
					},
					{
						label: 'タブを閉じる',
						accelerator: 'CmdOrCtrl+W',
						click: () => { this.removeTab(id); }
					},
					{ type: 'separator' },
					{
						label: item.isAudioStatus === -1 ? lang.window.view.contextMenu.media.audioMuteExit : lang.window.view.contextMenu.media.audioMute,
						icon: `${app.getAppPath()}/static/light/${item.isAudioStatus === -1 ? 'volume_up' : 'volume_off'}.png`,
						click: () => {
							ipcRenderer.send(`browserView-audioMute-${this.props.match.params.windowId}`, { id });
						}
					},
					{
						type: 'checkbox',
						label: 'タブを固定',
						checked: item.isFixed,
						click: () => {
							/*
							var newTabs = this.state.tabs.concat();
							item.isFixed = !item.isFixed;
							this.setState({ tabs: newTabs });
							*/

							ipcRenderer.send(`tab-fixed-${this.props.match.params.windowId}`, { id, result: !item.isFixed });
						}
					}
				]);
				menu.popup(remote.getCurrentWindow());
			}
		});
	}

	addTab = (url = (config.get('homePage.newTab.isDefaultHomePage') ? `${protocolStr}://home/` : config.get('homePage.newTab.defaultPage'))) => {
		ipcRenderer.send(`tab-add-${this.props.match.params.windowId}`, { url, isActive: true });
		// ipcRenderer.send(`tab-get-${this.props.match.params.windowId}`, {});
		this.setState({ current: this.state.tabs.length });
	}

	removeTab = (i) => {
		ipcRenderer.send(`tab-remove-${this.props.match.params.windowId}`, { id: i });
		ipcRenderer.send(`tab-get-${this.props.match.params.windowId}`, {});

		this.forceUpdate();
		if ((this.state.tabs.length - 1) < 1) {
			remote.getCurrentWindow().close();
		}
	}

	getTab = (id) => {
		ipcRenderer.send(`tab-get-${this.props.match.params.windowId}`, { id });
	}

	getTabs = () => {
		ipcRenderer.send(`tab-get-${this.props.match.params.windowId}`, {});
	}

	getForegroundColor = (hexColor) => {
		var r = parseInt(hexColor.substr(1, 2), 16);
		var g = parseInt(hexColor.substr(3, 2), 16);
		var b = parseInt(hexColor.substr(5, 2), 16);

		return ((((r * 299) + (g * 587) + (b * 114)) / 1000) < 128) ? '#ffffff' : '#000000';
	}

	getColor = () => {
		return !String(this.props.match.params.windowId).startsWith('private') ? (platform.isWin32 || platform.isDarwin ? `#${systemPreferences.getAccentColor()}` : '#353535') : '#353535';
	}

	isDarkModeOrPrivateMode = () => {
		return this.getTheme() || String(this.props.match.params.windowId).startsWith('private');
	}

	isDarkModeOrPrivateMode = (lightMode, darkMode) => {
		return !(this.getTheme() || String(this.props.match.params.windowId).startsWith('private')) ? lightMode : darkMode;
	}

	closeWindow = () => {
		if (this.state.tabs.length > 1) {
			if (config.get('window.isCloseConfirm')) {
				dialog.showMessageBox({
					type: 'info',
					title: 'アプリ終了確認',
					message: `${this.state.tabs.length}個のタブを閉じようとしています。`,
					detail: `${this.state.tabs.length}個のタブを閉じてアプリを終了しようとしています。\n複数のタブを閉じてアプリを終了してもよろしいでしょうか？`,
					checkboxLabel: '今後は確認しない',
					checkboxChecked: false,
					noLink: true,
					buttons: ['はい / Yes', 'いいえ / No'],
					defaultId: 0,
					cancelId: 1
				}).then((result) => {
					const { response, checkboxChecked } = result;

					if (checkboxChecked)
						config.set('window.isCloseConfirm', false);
					if (response === 0)
						remote.getCurrentWindow().close();
				});
			} else {
				remote.getCurrentWindow().close();
			}
		} else {
			remote.getCurrentWindow().close();
		}
	}

	render() {
		return (
			<Window isActive={remote.getCurrentWindow().isFocused()} isMaximized={remote.getCurrentWindow().isMaximized()} color={this.getColor()} isCustomTitlebar={config.get('design.isCustomTitlebar')}>
				<Titlebar isActive={remote.getCurrentWindow().isFocused()} color={this.getColor()}>
					<Tabs isCustomTitlebar={config.get('design.isCustomTitlebar')} isWindowsOrLinux={platform.isWin32 || (!platform.isWin32 && !platform.isDarwin)}>
						<TabContainer ref={ref => { this.tabContainer = ref; }}>
							{this.state.tabs.map((tab, i) => {
								return (
									<Tab isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')} isActive={tab.id === this.state.current} isFixed={tab.isFixed} inActiveColor={remote.getCurrentWindow().isFocused() ? this.getForegroundColor(this.getColor()) : '#000000'} accentColor={tab.color} className={tab.isFixed ? 'fixed-tab' : ''}
										onClick={() => { if (tab.id !== this.state.current) { ipcRenderer.send(`tab-select-${this.props.match.params.windowId}`, { id: tab.id }); } this.forceUpdate(); }} onContextMenu={this.handleContextMenu.bind(this, tab.id)} title={tab.title}>
										<TabIcon src={tab.icon !== undefined ? tab.icon : (tab.id === this.state.current || remote.getCurrentWindow().isFocused() ? (this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? DarkPublicIcon : LightPublicIcon) : (this.getForegroundColor(this.getColor()) === '#ffffff' ? LightPublicIcon : DarkPublicIcon))} width={18} height={18} />
										<TabTitle isShowing={tab.isAudioStatus !== 0} isFixed={tab.isFixed}>{tab.title}</TabTitle>
										<TabStatusIcon isActive={tab.id === this.state.current} isFixed={tab.isFixed} isRight={true} src={tab.isAudioStatus !== 0 ? (tab.id === this.state.current ? this.isDarkModeOrPrivateMode.bind(this, tab.isAudioStatus === 1 ? LightAudioIcon : LightAudioMuteIcon, tab.isAudioStatus === 1 ? DarkAudioIcon : DarkAudioMuteIcon) : (this.getForegroundColor(platform.isWin32 || platform.isDarwin ? `#${systemPreferences.getAccentColor()}` : '#353535') === '#000000' || this.isDarkModeOrPrivateMode() ? (tab.isAudioStatus === 1 ? LightAudioIcon : LightAudioMuteIcon) : (tab.isAudioStatus === 1 ? DarkAudioIcon : DarkAudioMuteIcon))) : undefined} isShowing={tab.isAudioStatus !== 0} size={14} title={tab.isAudioStatus !== 0 ? (tab.isAudioStatus === 1 ? lang.window.titleBar.tab.media.audioPlaying : lang.window.titleBar.tab.media.audioMuted) : ''} />
										<TabCloseButton isActive={tab.id === this.state.current} isFixed={tab.isFixed} isRight={true} src={tab.id === this.state.current ? this.isDarkModeOrPrivateMode.bind(this, LightCloseIcon, DarkCloseIcon) : (this.getForegroundColor(platform.isWin32 || platform.isDarwin ? `#${systemPreferences.getAccentColor()}` : '#353535') === '#000000' || this.isDarkModeOrPrivateMode() ? LightCloseIcon : DarkCloseIcon)} size={14} title={lang.window.titleBar.tab.close} onClick={() => { this.removeTab(tab.id); this.forceUpdate(); }} />
									</Tab>
								);
							})}
						</TabContainer>
						<TabButton isRight={true} src={this.getForegroundColor(platform.isWin32 || platform.isDarwin ? `#${systemPreferences.getAccentColor()}` : '#353535') === '#000000' || this.isDarkModeOrPrivateMode() ? LightAddIcon : DarkAddIcon} size={24} title={lang.window.titleBar.tab.new} onClick={() => { this.addTab(); }} />
					</Tabs>
					<WindowButtons isMaximized={remote.getCurrentWindow().isMaximized()} isCustomTitlebar={config.get('design.isCustomTitlebar')} isWindowsOrLinux={platform.isWin32 || (!platform.isWin32 && !platform.isDarwin)}>
						<WindowButton isClose={false} isWindowsOrLinux={platform.isWin32 || (!platform.isWin32 && !platform.isDarwin)} title={lang.window.titleBar.buttons.minimize} onClick={() => { remote.getCurrentWindow().minimize(); }}>
							<svg name="TitleBarMinimize" width="12" height="12" viewBox="0 0 12 12" fill={this.getForegroundColor(platform.isWin32 || platform.isDarwin ? `#${systemPreferences.getAccentColor()}` : '#353535')}>
								<rect width="10" height="1" x="1" y="6" />
							</svg>
						</WindowButton>
						<WindowButton isClose={false} isWindowsOrLinux={platform.isWin32 || (!platform.isWin32 && !platform.isDarwin)} title={remote.getCurrentWindow().isMaximized() ? lang.window.titleBar.buttons.maximize.restore : lang.window.titleBar.buttons.maximize.maximize} onClick={() => { remote.getCurrentWindow().isMaximized() ? remote.getCurrentWindow().unmaximize() : remote.getCurrentWindow().maximize(); this.forceUpdate(); }}>
							<svg name="TitleBarMaximize" width="12" height="12" viewBox="0 0 12 12" stroke={this.getForegroundColor(platform.isWin32 || platform.isDarwin ? `#${systemPreferences.getAccentColor()}` : '#353535')}>
								<rect fill="none" width="9" height="9" x="1.5" y="1.5" />
							</svg>
						</WindowButton>
						<WindowButton isClose={true} isWindowsOrLinux={platform.isWin32 || (!platform.isWin32 && !platform.isDarwin)} title={lang.window.titleBar.buttons.close} onClick={() => { this.closeWindow(); }}>
							<svg name="TitleBarClose" width="12" height="12" viewBox="0 0 12 12" fill={this.getForegroundColor(platform.isWin32 || platform.isDarwin ? `#${systemPreferences.getAccentColor()}` : '#353535')}>
								<polygon fill-rule="evenodd" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1" />
							</svg>
						</WindowButton>
					</WindowButtons>
				</Titlebar>
				<WindowContent>
					{this.state.tabs.map((tab, i) => {
						return (
							<TabContent isActive={tab.id === this.state.current}>
								<BrowserView key={i} windowId={this.props.match.params.windowId} index={tab.id} url={tab.url}
									closeWindow={() => { this.closeWindow(); }}
									addTab={(url) => { this.addTab(url); }}
									updateTab={() => { this.getTab(tab.id); }} />
							</TabContent>
						);
					})}
				</WindowContent>
			</Window>
		);
	}
}

export default MainWindow;