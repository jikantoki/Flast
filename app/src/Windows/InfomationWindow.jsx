import React, { Component } from 'react';
import styled from 'styled-components';
import { parse, format } from 'url';

import Button from './Components/Button';

const { remote, ipcRenderer, shell } = window.require('electron');
const { app, systemPreferences, Menu, MenuItem, dialog, nativeTheme } = remote;

const platform = window.require('electron-platform');
const path = window.require('path');

const Config = window.require('electron-store');
const config = new Config();
const userConfig = new Config({
    cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

const lang = window.require(`${app.getAppPath()}/langs/${userConfig.get('language') != undefined ? userConfig.get('language') : 'ja'}.js`);

const Window = styled.div`
  width: auto;
  height: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 'auto' : '100%'};
  margin: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? '0px 4px' : '0px'};
  padding: 6px;
  display: flex;
  flex-direction: column;
  border-radius: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 2 : 0}px;
  border: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 'none' : (props => !props.isDarkModeOrPrivateMode ? 'solid 1px #e1e1e1' : 'solid 1px #8b8b8b')};
  background-color: ${props => !props.isDarkModeOrPrivateMode ? '#f9f9fa' : '#353535'};
  color: ${props => !props.isDarkModeOrPrivateMode ? '#353535' : '#f9f9fa'};
  box-shadow: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? '0px 2px 4px rgba(0, 0, 0, 0.16), 0px 2px 4px rgba(0, 0, 0, 0.23)' : 'none'};
  box-sizing: border-box;
`;

class InfomationWindow extends Component {

	constructor(props) {
		super(props);
		this.state = {
			title: '',
			description: '',
			url: '',
			isButton: false
		};

		window.addEventListener('blur', () => {
			ipcRenderer.send(`infoWindow-close-${this.props.match.params.windowId}`, {});
		});

		ipcRenderer.on('window-change-settings', (e, args) => {
			this.forceUpdate();
		});

		ipcRenderer.on(`infoWindow-${this.props.match.params.windowId}`, (e, args) => {
			this.setState({ title: args.title, description: args.description, url: args.url, isButton: args.isButton });
		});
	}

	getTheme = () => {
		if (userConfig.get('design.theme') === -1)
			return nativeTheme.shouldUseDarkColors;
		else if (userConfig.get('design.theme') === 0)
			return false;
		else if (userConfig.get('design.theme') === 1)
			return true;
	}

	isDisabledSite = (url) => {
		for (const item of userConfig.get('adBlock.disabledSites')) {
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

	getForegroundColor = (hexColor) => {
		var r = parseInt(hexColor.substr(1, 2), 16);
		var g = parseInt(hexColor.substr(3, 2), 16);
		var b = parseInt(hexColor.substr(5, 2), 16);

		return ((((r * 299) + (g * 587) + (b * 114)) / 1000) < 128) ? '#ffffff' : '#000000';
	}

	sendResult = (result) => {
		ipcRenderer.send(`infoWindow-result-${this.props.match.params.windowId}`, result);
	}

	render() {
		return (
			<Window isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')} onMouseEnter={(e) => { remote.getCurrentWindow().setIgnoreMouseEvents(false); }} onMouseLeave={(e) => { remote.getCurrentWindow().setIgnoreMouseEvents(true, { forward: true }); }}>
				<div style={{ display: 'flex', justifyContent: 'space-around' }}>
					<h5 style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: this.state.title }} />
					<Button style={{ margin: 0, width: 20, height: 20, marginLeft: 'auto', border: 'none' }} onClick={() => ipcRenderer.send(`infoWindow-close-${this.props.match.params.windowId}`, {})}>
						<svg name="TitleBarClose" width="12" height="12" viewBox="0 0 12 12" fill={this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? '#f9f9fa' : '#353535'}>
							<polygon fill-rule="evenodd" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1" />
						</svg>
					</Button>
				</div>
				<p style={{ margin: 0, marginTop: String(this.state.description).length > 0 ? 11 : 0, marginBottom: this.state.isButton ? 7 : 0 }} dangerouslySetInnerHTML={{ __html: this.state.description }} />
				<div style={{ display: this.state.isButton ? 'flex' : 'none', justifyContent: 'space-around' }}>
					<Button onClick={() => this.sendResult(true)}>はい</Button>
					<Button onClick={() => this.sendResult(false)}>いいえ</Button>
				</div>
			</Window>
		);
	}
}

export default InfomationWindow;