import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Tippy from '@tippy.js/react';
import Sortable from 'sortablejs';

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
import { ToolbarTextBoxWrapper, ToolbarTextBox } from './Components/ToolbarTextBox';
import BookmarkBar from './Components/BookmarkBar';
import ContentWrapper from './Components/ContentWrapper';

import WindowMinimizeIcon from './Resources/windows/minimize.svg';
import WindowMaximizeIcon from './Resources/windows/maximize.svg';
import WindowCloseIcon from './Resources/windows/close.svg';

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

import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import 'tippy.js/themes/light-border.css';
import 'tippy.js/themes/material.css';
import 'tippy.js/themes/translucent.css';

import { isURL, prefixHttp } from '../Utils/URL';

const { remote, ipcRenderer, shell } = window.require('electron');
const { app, systemPreferences, Menu, MenuItem, dialog, nativeImage, clipboard } = remote;

const pkg = window.require(`${app.getAppPath()}/package.json`);
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const platform = window.require('electron-platform');
const { parse, format } = window.require('url');
const path = window.require('path');
const process = window.require('process');

const Config = window.require('electron-store');
const config = new Config();

const lang = window.require(`${app.getAppPath()}/langs/${config.get('language')}`);

class ApplicationWindow extends Component {
	constructor(props) {
		super(props);

		ipcRenderer.on(`window-focus-${this.props.match.params.windowId}`, (e, args) => {
			this.forceUpdate();
		});
		ipcRenderer.on(`window-blur-${this.props.match.params.windowId}`, (e, args) => {
			this.forceUpdate();
		});

		ipcRenderer.on('window-change-settings', (e, args) => {
			this.forceUpdate();
		});
	}

	componentDidMount = () => {
		let webView = this.webView;

		webView.addEventListener('did-finish-load', (e) => {
			document.title = webView.getTitle();
			this.forceUpdate();
		}, false);

		webView.addEventListener('page-title-updated', (e) => {
			document.title = webView.getTitle();
			this.forceUpdate();
		}, false);

		webView.addEventListener('new-window', (e) => {
			webView.loadURL(e.url);
		});

		webView.addEventListener('context-menu', (e) => {
			if (webView.isDestroyed()) return;

			const params = e.params;

			let menu = Menu.buildFromTemplate(
				[
					{
						label: lang.window.view.contextMenu.back,
						icon: `${app.getAppPath()}/static/${!webView.canGoBack() ? 'arrow_back_inactive' : 'light/arrow_back'}.png`,
						accelerator: 'Alt+Left',
						enabled: webView.canGoBack(),
						click: () => {
							const url = webView.getURL();

							webView.goBack();
							if (url.startsWith(`${protocolStr}://error`)) {
								if (webView.canGoBack())
									webView.goBack();
							}
						}
					},
					{
						label: lang.window.view.contextMenu.forward,
						icon: `${app.getAppPath()}/static/${!webView.canGoForward() ? 'arrow_forward_inactive' : 'light/arrow_forward'}.png`,
						accelerator: 'Alt+Right',
						enabled: webView.canGoForward(),
						click: () => {
							const url = webView.getURL();

							webView.goForward();
							if (url.startsWith(`${protocolStr}://error`)) {
								if (webView.canGoForward())
									webView.goForward();
							}
						}
					},
					{
						label: !webView.isLoadingMainFrame() ? lang.window.view.contextMenu.reload.reload : lang.window.view.contextMenu.reload.stop,
						icon: `${app.getAppPath()}/static/light/${!webView.isLoadingMainFrame() ? 'refresh' : 'close'}.png`,
						accelerator: 'CmdOrCtrl+R',
						click: () => { !webView.isLoadingMainFrame() ? webView.reload() : webView.stop(); }
					},
					...(params.mediaType === 'audio' || params.mediaType === 'video' || webView.isCurrentlyAudible() ? [
						{ type: 'separator' },
						{
							label: webView.isAudioMuted() ? lang.window.view.contextMenu.media.audioMuteExit : lang.window.view.contextMenu.media.audioMute,
							icon: `${app.getAppPath()}/static/light/${webView.isAudioMuted() ? 'volume_up' : 'volume_off'}.png`,
							click: () => {
								webView.setAudioMuted(!webView.isAudioMuted());

								this.getViews();
							}
						}
					] : []),
					{ type: 'separator' },
					{
						label: lang.window.view.contextMenu.savePage,
						icon: `${app.getAppPath()}/static/light/save.png`,
						accelerator: 'CmdOrCtrl+S',
						enabled: !webView.getURL().startsWith(`${protocolStr}://`),
						click: () => {
							dialog.showSaveDialog({
								defaultPath: `${app.getPath('downloads')}/${webView.getTitle()}.html`,
								filters: [
									{ name: 'HTML', extensions: ['htm', 'html'] },
									{ name: 'All Files', extensions: ['*'] }
								]
							}, (fileName) => {
								if (fileName === undefined || fileName === null) return;
								webView.savePage(fileName, 'HTMLComplete', (err) => {
									if (!err) console.log('Page Save successfully');
								});
							});
						}
					},
					{
						label: lang.window.view.contextMenu.print,
						icon: `${app.getAppPath()}/static/light/print.png`,
						accelerator: 'CmdOrCtrl+P',
						enabled: !webView.getURL().startsWith(`${protocolStr}://`),
						click: () => { webView.print(); }
					},
					{ type: 'separator' },
					{
						label: lang.window.view.contextMenu.devTool,
						accelerator: 'CmdOrCtrl+Shift+I',
						enabled: !webView.getURL().startsWith(`${protocolStr}://`),
						click: () => { webView.openDevTools(); }
					}
				]
			);

			menu.popup(remote.getCurrentWindow());
		}, false);
	}

	getForegroundColor = (hexColor) => {
		var r = parseInt(hexColor.substr(1, 2), 16);
		var g = parseInt(hexColor.substr(3, 2), 16);
		var b = parseInt(hexColor.substr(5, 2), 16);

		return ((((r * 299) + (g * 587) + (b * 114)) / 1000) < 128) ? '#ffffff' : '#000000';
	}

	isDarkModeOrPrivateMode = () => {
		return config.get('design.isDarkTheme') || String(this.props.match.params.windowId).startsWith('private');
	}

	isDarkModeOrPrivateMode = (lightMode, darkMode) => {
		return !(config.get('design.isDarkTheme') || String(this.props.match.params.windowId).startsWith('private')) ? lightMode : darkMode;
	}

	render() {
		return (
			<Window isCustomTitlebar={config.get('design.isCustomTitlebar')}>
				<Titlebar isActive={remote.getCurrentWindow().isFocused()} color={platform.isWin32 || platform.isDarwin ? `#${systemPreferences.getAccentColor()}` : '#353535'} style={{ display: 'flex' }}>
					<WindowButtons isCustomTitlebar={config.get('design.isCustomTitlebar')} isWindowsOrLinux={platform.isWin32 || !(platform.isWin32 && platform.isDarwin)}>
						<WindowButton isClose={true} isMinimize={false} isWindowsOrLinux={platform.isWin32 || !(platform.isWin32 && platform.isDarwin)} title={lang.window.titleBar.buttons.close} onClick={() => { this.closeWindow(); }} />
						<WindowButton isClose={false} isMinimize={true} isWindowsOrLinux={platform.isWin32 || !(platform.isWin32 && platform.isDarwin)} title={lang.window.titleBar.buttons.minimize} onClick={() => { remote.getCurrentWindow().minimize(); }} />
						<WindowButton isClose={false} isMinimize={false} isWindowsOrLinux={platform.isWin32 || !(platform.isWin32 && platform.isDarwin)} title={remote.getCurrentWindow().isMaximized() ? lang.window.titleBar.buttons.maximize.restore : lang.window.titleBar.buttons.maximize.maximize} onClick={() => { remote.getCurrentWindow().isMaximized() ? remote.getCurrentWindow().unmaximize() : remote.getCurrentWindow().maximize(); this.forceUpdate(); }} />
					</WindowButtons>
					<Toolbar style={{ width: 'fit-content', height: '100%', background: 'transparent', border: 'none', WebkitAppRegion: 'no-drag' }} isDarkModeOrPrivateMode={config.get('design.isDarkTheme')}>
						<ToolbarButton isDarkModeOrPrivateMode={config.get('design.isDarkTheme')} style={{ height: 'auto' }} src={DarkBackIcon} size={24}
							isShowing={true} isRight={false} isMarginLeft={true} isEnabled={this.webView != undefined ? this.webView.getWebContents().canGoBack() : false} title={lang.window.toolBar.back} onClick={() => { this.webView.getWebContents().goBack(); this.forceUpdate(); }} />
						<ToolbarButton isDarkModeOrPrivateMode={config.get('design.isDarkTheme')} style={{ height: 'auto' }} src={DarkForwardIcon} size={24}
							isShowing={this.webView != undefined ? this.webView.getWebContents().canGoForward() : false} isRight={false} isMarginLeft={false} isEnabled={this.webView != undefined ? this.webView.getWebContents().canGoForward() : false} title={lang.window.toolBar.forward} onClick={() => { this.webView.getWebContents().goForward(); this.forceUpdate(); }} />
						<ToolbarButton isDarkModeOrPrivateMode={config.get('design.isDarkTheme')} style={{ height: 'auto' }} src={this.webView != undefined && this.webView.getWebContents().isLoadingMainFrame() ? DarkCloseIcon : DarkReloadIcon} size={24}
							isShowing={true} isRight={false} isMarginLeft={false} isEnabled={true} title={this.webView != undefined && this.webView.getWebContents().isLoadingMainFrame() ? lang.window.toolBar.reload.stop : lang.window.toolBar.reload.reload} onClick={() => { if (this.webView.getWebContents().isLoadingMainFrame()) { this.webView.getWebContents().stop(); } else { this.webView.getWebContents().reload(); } this.forceUpdate(); }} />
					</Toolbar>
					<span style={{ color: this.getForegroundColor(platform.isWin32 || platform.isDarwin ? `#${systemPreferences.getAccentColor()}` : '#353535'), marginLeft: 10, display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', WebkitBoxPack: 'center', justifyContent: 'center' }}>{this.webView != undefined ? this.webView.getWebContents().getTitle() : 'Application'}</span>
					<WindowButtons isCustomTitlebar={config.get('design.isCustomTitlebar')} isWindowsOrLinux={platform.isWin32 || !(platform.isWin32 && platform.isDarwin)}>
						<WindowButton isClose={false} isWindowsOrLinux={platform.isWin32 || !(platform.isWin32 && platform.isDarwin)} title={lang.window.titleBar.buttons.minimize} onClick={() => { remote.getCurrentWindow().minimize(); }}>
							<svg name="TitleBarMinimize" width="12" height="12" viewBox="0 0 12 12" fill={this.getForegroundColor(platform.isWin32 || platform.isDarwin ? `#${systemPreferences.getAccentColor()}` : '#353535')}>
								<rect width="10" height="1" x="1" y="6" />
							</svg>
						</WindowButton>
						<WindowButton isClose={false} isWindowsOrLinux={platform.isWin32 || !(platform.isWin32 && platform.isDarwin)} title={remote.getCurrentWindow().isMaximized() ? lang.window.titleBar.buttons.maximize.restore : lang.window.titleBar.buttons.maximize.maximize} onClick={() => { remote.getCurrentWindow().isMaximized() ? remote.getCurrentWindow().unmaximize() : remote.getCurrentWindow().maximize(); this.forceUpdate(); }}>
							<svg name="TitleBarMaximize" width="12" height="12" viewBox="0 0 12 12" stroke={this.getForegroundColor(platform.isWin32 || platform.isDarwin ? `#${systemPreferences.getAccentColor()}` : '#353535')}>
								<rect fill="none" width="9" height="9" x="1.5" y="1.5" />
							</svg>
						</WindowButton>
						<WindowButton isClose={true} isWindowsOrLinux={platform.isWin32 || !(platform.isWin32 && platform.isDarwin)} title={lang.window.titleBar.buttons.close} onClick={() => { remote.getCurrentWindow().close(); }}>
							<svg name="TitleBarClose" width="12" height="12" viewBox="0 0 12 12" fill={this.getForegroundColor(platform.isWin32 || platform.isDarwin ? `#${systemPreferences.getAccentColor()}` : '#353535')}>
								<polygon fill-rule="evenodd" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1" />
							</svg>
						</WindowButton>
					</WindowButtons>
				</Titlebar>
				<WindowContent>
					<webview ref={ref => { this.webView = ref; }} style={{ height: '100%' }} src={decodeURIComponent(this.props.match.params.url)} preload={`${app.getAppPath()}/electron/Preload`} />
				</WindowContent>
			</Window>
		);
	}
}

export default ApplicationWindow;