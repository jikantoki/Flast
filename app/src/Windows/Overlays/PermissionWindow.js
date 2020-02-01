import React, { Component } from 'react';
import styled from 'styled-components';
import { parse, format } from 'url';

import Button from './Components/Button';

const { remote, ipcRenderer, shell } = window.require('electron');
const { app, systemPreferences, Menu, MenuItem, dialog, nativeTheme } = remote;

const platform = require('electron-platform');
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const Config = window.require('electron-store');
const config = new Config();

const lang = window.require(`${app.getAppPath()}/langs/${config.get('language') != undefined ? config.get('language') : 'ja'}.js`);

const Window = styled.div`
  width: auto;
  height: ${platform.isWin32 || platform.isDarwin ? 'auto' : '100%'};
  margin: ${platform.isWin32 || platform.isDarwin ? '0px 4px' : '0px'};
  padding: 6px;
  display: flex;
  flex-direction: column;
  border-radius: ${platform.isWin32 || platform.isDarwin ? 2 : 0}px;
  border: ${platform.isWin32 || platform.isDarwin ? 'none' : (props => !props.isDarkModeOrPrivateMode ? 'solid 1px #e1e1e1' : 'solid 1px #8b8b8b')};
  background-color: ${props => !props.isDarkModeOrPrivateMode ? '#f9f9fa' : '#353535'};
  color: ${props => !props.isDarkModeOrPrivateMode ? '#353535' : '#f9f9fa'};
  box-shadow: ${platform.isWin32 || platform.isDarwin ? '0px 2px 4px rgba(0, 0, 0, 0.16), 0px 2px 4px rgba(0, 0, 0, 0.23)' : 'none'};
  box-sizing: border-box;
`;

class PermissionWindow extends Component {
	constructor(props) {
		super(props);
		this.state = {
			permission: null,
			url: '',
			isButton: false
		};

		ipcRenderer.on('window-change-settings', (e, args) => {
			this.forceUpdate();
		});

		ipcRenderer.on(`permissionWindow-${this.props.match.params.windowId}`, (e, args) => {
			this.setState({ permission: args.permission, url: args.url });
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

	getForegroundColor = (hexColor) => {
		var r = parseInt(hexColor.substr(1, 2), 16);
		var g = parseInt(hexColor.substr(3, 2), 16);
		var b = parseInt(hexColor.substr(5, 2), 16);

		return ((((r * 299) + (g * 587) + (b * 114)) / 1000) < 128) ? '#ffffff' : '#000000';
	}

	sendResult = (result) => {
		ipcRenderer.send(`permissionWindow-result-${this.props.match.params.windowId}`, { result, isChecked: false });
	}

	render() {
		return (
			<Window isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')} onMouseEnter={(e) => { remote.getCurrentWindow().setIgnoreMouseEvents(false); }} onMouseLeave={(e) => { remote.getCurrentWindow().setIgnoreMouseEvents(true, { forward: true }); }}>
				<div style={{ display: 'flex', justifyContent: 'space-around' }}>
					<h5 style={{ margin: 0 }}>{String(lang.window.toolBar.addressBar.permission.title).replace(/{replace}/, (parse(this.state.url).protocol === `${protocolStr}:` ? `${parse(this.state.url).protocol}//${parse(this.state.url).hostname}` : parse(this.state.url).hostname))}</h5>
					<Button style={{ margin: 0, width: 20, height: 20, marginLeft: 'auto', border: 'none' }} onClick={() => ipcRenderer.send(`permissionWindow-close-${this.props.match.params.windowId}`, {})}>
						<svg name="TitleBarClose" width="12" height="12" viewBox="0 0 12 12" fill={this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? '#f9f9fa' : '#353535'}>
							<polygon fill-rule="evenodd" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1" />
						</svg>
					</Button>
				</div>
				<p style={{ margin: 0, marginBottom: 7 }}>
					{String(lang.window.toolBar.addressBar.permission.description).replace(/{replace}/, this.state.permission)}
				</p>
				<div style={{ display: 'flex', justifyContent: 'space-around' }}>
					<Button onClick={() => this.sendResult(true)}>{lang.window.toolBar.addressBar.permission.buttons.yes}</Button>
					<Button onClick={() => this.sendResult(false)}>{lang.window.toolBar.addressBar.permission.buttons.no}</Button>
				</div>
			</Window>
		);
	}
}

export default PermissionWindow;