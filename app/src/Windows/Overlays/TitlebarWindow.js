import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Tippy from '@tippy.js/react';
import Sortable from 'sortablejs';
import { parse, format } from 'url';

import Window from '../Components/Window';
import WindowButtons from '../Components/WindowButtons';
import WindowButton from '../Components/WindowButton';
import WindowContent from '../Components/WindowContent';
import { Titlebar, Menubar, MenuButton } from '../Components/Titlebar';

import { isURL, prefixHttp } from '../../Utils/URL';

const { remote, ipcRenderer, shell } = window.require('electron');
const { app, systemPreferences, Menu, MenuItem, dialog, nativeTheme } = remote;

const platform = window.require('electron-platform');
const path = window.require('path');
const process = window.require('process');

const pkg = window.require(`${app.getAppPath()}/package.json`);
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const Config = window.require('electron-store');
const config = new Config();
const userConfig = new Config({
    cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

const lang = window.require(`${app.getAppPath()}/langs/${userConfig.get('language') != undefined ? userConfig.get('language') : 'ja'}.js`);

class TitlebarWindow extends Component {

	constructor(props) {
		super(props);

		remote.getCurrentWindow().setIgnoreMouseEvents(false);
	}

	getTheme = () => {
		if (userConfig.get('design.theme') === -1)
			return nativeTheme.shouldUseDarkColors;
		else if (userConfig.get('design.theme') === 0)
			return false;
		else if (userConfig.get('design.theme') === 1)
			return true;
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

	render() {
		return (
			<Window isActive={remote.getCurrentWindow().isFocused()} isMaximized={remote.getCurrentWindow().isMaximized()} color={this.getColor()} isCustomTitlebar={userConfig.get('design.isCustomTitlebar')}>
				<Menubar color={this.getColor()} onMouseEnter={(e) => { remote.getCurrentWindow().setIgnoreMouseEvents(false); }} onMouseLeave={(e) => {
					remote.getCurrentWindow().setIgnoreMouseEvents(true, { forward: true });
					ipcRenderer.send(`infoWindow-close-${remote.getCurrentWindow().id}`, {});
				}}>
					<MenuButton>ファイル (F)</MenuButton>
					<MenuButton>編集 (E)</MenuButton>
					<MenuButton>表示 (V)</MenuButton>
				</Menubar>
			</Window>
		);
	}
}

export default TitlebarWindow;