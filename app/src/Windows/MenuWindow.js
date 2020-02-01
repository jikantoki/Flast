import React, { Component } from 'react';
import styled from 'styled-components';
import { parse, format } from 'url';

import DarkBackIcon from './Resources/dark/arrow_back.svg';
import LightBackIcon from './Resources/light/arrow_back.svg';

const { remote, ipcRenderer, shell } = window.require('electron');
const { app, systemPreferences, Menu, MenuItem, dialog, nativeTheme } = remote;

const pkg = window.require(`${app.getAppPath()}/package.json`);
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const platform = require('electron-platform');

const Config = window.require('electron-store');
const config = new Config();

const lang = window.require(`${app.getAppPath()}/langs/${config.get('language') != undefined ? config.get('language') : 'ja'}.js`);

const buttonHeight = 27;

const Window = styled.div`
  width: auto;
  height: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 'auto' : '100%'};
  margin: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? '0px 4px 2px' : '0px'};
  padding: 5px 0px;
  display: flex;
  flex-direction: column;
  border-radius: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 2 : 0}px;
  border: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 'none' : (props => !props.isDarkModeOrPrivateMode ? 'solid 1px #e1e1e1' : 'solid 1px #8b8b8b')};
  background-color: ${props => !props.isDarkModeOrPrivateMode ? '#f9f9fa' : '#353535'};
  color: ${props => !props.isDarkModeOrPrivateMode ? '#353535' : '#f9f9fa'};
  box-shadow: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? '0px 2px 4px rgba(0, 0, 0, 0.16), 0px 2px 4px rgba(0, 0, 0, 0.23)' : 'none'};
  box-sizing: border-box;
`;

const Button = styled.div`
  width: 100%;
  height: ${buttonHeight}px;
  margin: 0px;
  padding: 0px 7px;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  background: none;
  transition: 0.2s background-color;
  box-sizing: border-box;
  &:hover {
    background-color: rgba(196, 196, 196, 0.4);
  }
`;

const ButtonTitle = styled.span`
  width: auto;
  margin-left: ${props => props.hasIcon !== null && props.hasIcon ? 7 : 25}px;
`;

const ButtonAccelerator = styled.span`
  width: auto;
  margin-left: auto;
  margin-right: 20px;
`;

const Divider = styled.div`
  background-color: initial;
  width: ${props => props.isVertical ? '1px' : '100%'};
  height: ${props => props.isVertical ? `${buttonHeight}px` : '1px'};
  margin-top: ${props => props.isVertical ? 0 : 5}px;
  margin-bottom: ${props => props.isVertical ? 0 : 5}px;
  margin-left: ${props => props.isVertical ? 5 : 0}px;
  margin-right: ${props => props.isVertical ? 5 : 0}px;
  ${props => props.isVertical ? 'border-left' : 'border-top'}: solid 1px ${props => !props.isDarkModeOrPrivateMode ? '#e1e1e1' : '#8b8b8b'};
`;

const Dialog = styled.div`
  width: -webkit-fill-available;
  height: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? '505px' : '100%'};
  margin: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? '0px 4px 2px' : '0px'};
  padding: 0px;
  position: fixed;
  top: 0px;
  transform: translateX(${props => props.isOpen ? '0%' : '105%'});
  display: flex;
  flex-flow: column nowrap;
  border-radius: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 2 : 0}px;
  border: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 'none' : (props => !props.isDarkModeOrPrivateMode ? 'solid 1px #e1e1e1' : 'solid 1px #8b8b8b')};
  background-color: ${props => !props.isDarkModeOrPrivateMode ? '#f9f9fa' : '#353535'};
  color: ${props => !props.isDarkModeOrPrivateMode ? '#353535' : '#f9f9fa'};
  transition: 0.2s transform;
  box-sizing: border-box;
`;

const DialogHeader = styled.div`
  width: 100%;
  height: 35px;
  margin: 0px;
  padding: 0px;
  display: flex;
  background-color: gray;
  border-top-left-radius: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 2 : 0}px;
  border-top-right-radius: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 2 : 0}px;
  box-sizing: border-box;
`;

const DialogHeaderButton = styled.div`
  width: 25px;
  height: 25px;
  margin: 5px;
  padding: 3px;
  position: relative;
  flex-grow: 0;
  background-image: url(${props => props.src});
  background-size: ${props => props.size}px;
  background-position: center;
  background-repeat: no-repeat;
  background-color: initial;
  border: none;
  border-radius: 2px;
  transition: 0.2s background-color;
  outline: none;
  &:hover {
    background-color: ${props => !props.isDarkModeOrPrivateMode ? 'rgba(0, 0, 0, 0.06)' : 'rgba(130, 130, 130, 0.3)'};
  }
`;

const DialogHeaderTitle = styled.span`
  display: flex;
  align-items: center;
  margin: 0 auto;
`;

const DialogContainer = styled.div`
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 5px 0px;
  display: flex;
  flex-direction: column;
  border-bottom-left-radius: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 2 : 0}px;
  border-bottom-right-radius: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 2 : 0}px;
  border: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 'none' : (props => !props.isDarkModeOrPrivateMode ? 'solid 1px #e1e1e1' : 'solid 1px #8b8b8b')};
  background-color: ${props => !props.isDarkModeOrPrivateMode ? '#f9f9fa' : '#353535'};
  color: ${props => !props.isDarkModeOrPrivateMode ? '#353535' : '#f9f9fa'};
  box-sizing: border-box;
`;

class MoreIcon extends Component {
	render() {
		return (
			<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 59.414 59.414">
				<g>
					<polygon fill={this.props.isDarkModeOrPrivateMode ? '#e1e1e1' : '#8b8b8b'} points="15.561,59.414 14.146,58 42.439,29.707 14.146,1.414 15.561,0 45.268,29.707"></polygon>
				</g>
			</svg>
		);
	}
}

class MenuWindow extends Component {
	constructor(props) {
		super(props);
		this.state = {
			url: '',
			zoomSize: 1,
			isOpen: null
		};

		window.addEventListener('blur', () => {
			ipcRenderer.send(`dialogView-close-${remote.getCurrentWebContents().id}`);
		});

		ipcRenderer.on('window-change-settings', (e, args) => {
			this.forceUpdate();
		});

		ipcRenderer.on(`menuWindow-${this.props.match.params.windowId}`, (e, args) => {
			this.setState({ url: args.url, zoomSize: args.zoomSize, isOpen: null });
			this.forceUpdate();
		});

		ipcRenderer.on(`browserView-zoom-${this.props.match.params.windowId}`, (e, args) => {
			this.setState({ zoomSize: args.result });
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

	addTab = (url = (config.get('homePage.isDefaultHomePage') ? `${protocolStr}://home/` : config.get('homePage.defaultPage')), isInternal = false) => {
		if (isInternal) {
			const u = parse(this.state.url);
			console.log(u.protocol);

			if (u.protocol === `${protocolStr}:`)
				ipcRenderer.send(`browserView-loadURL-${this.props.match.params.windowId}`, { id: this.props.match.params.tabId, url });
			else
				ipcRenderer.send(`tab-add-${this.props.match.params.windowId}`, { url, isActive: true });
		} else {
			ipcRenderer.send(`tab-add-${this.props.match.params.windowId}`, { url, isActive: true });
		}
	}

	closeMenu = () => {
		ipcRenderer.send(`menuWindow-close-${this.props.match.params.windowId}`, {});
	}

	getIconDirectory = () => {
		return `${app.getAppPath()}/static/${this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? 'dark' : 'light'}`;
	}

	render() {
		return (
			<div style={{ boxSizing: 'border-box', width: '100%', height: platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 'auto' : '100%' }}>
				<Window isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')}>
					<Button onClick={() => { this.setState({ isOpen: 'userInfo' }); }}>
						<img src={`${this.getIconDirectory()}/account.png`} style={{ verticalAlign: 'middle' }} />
						<ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.userInfo}</ButtonTitle>
						<ButtonAccelerator></ButtonAccelerator>
						<MoreIcon isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')} />
					</Button>
					<Divider isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')} />
					<Button onClick={() => { this.closeMenu(); this.addTab(); }}>
						<ButtonTitle hasIcon={false}>{lang.window.toolBar.menu.menus.newTab}</ButtonTitle>
						<ButtonAccelerator>{platform.isDarwin ? 'Cmd+T' : 'Ctrl+T'}</ButtonAccelerator>
					</Button>
					<Button onClick={() => { this.closeMenu(); ipcRenderer.send(`window-add`, { isPrivate: false }); }}>
						<ButtonTitle hasIcon={false}>{lang.window.toolBar.menu.menus.newWindow}</ButtonTitle>
						<ButtonAccelerator>{platform.isDarwin ? 'Cmd+N' : 'Ctrl+N'}</ButtonAccelerator>
					</Button>
					<Button onClick={() => { this.closeMenu(); ipcRenderer.send(`window-add`, { isPrivate: true }); }}>
						<ButtonTitle hasIcon={false}>{lang.window.toolBar.menu.menus.openPrivateWindow}</ButtonTitle>
						<ButtonAccelerator>{platform.isDarwin ? 'Cmd+Shift+N' : 'Ctrl+Shift+N'}</ButtonAccelerator>
					</Button>
					<Divider style={{ marginBottom: 0 }} isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')} />
					<div style={{ display: 'flex', paddingLeft: 7 }}>
						<span style={{ width: 'auto', marginLeft: 25, display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center' }}>{lang.window.toolBar.menu.menus.zoom.name}</span>
						<div style={{ display: 'flex', marginLeft: 'auto' }}>
							<Button title={lang.window.toolBar.menu.menus.zoom.zoomIn} onClick={() => { ipcRenderer.send(`browserView-zoomIn-${this.props.match.params.windowId}`, { id: this.props.match.params.tabId }); this.forceUpdate(); }}
								style={{ width: 50, height: 30, padding: '4px 16px', display: 'inline-table', borderLeft: `solid 1px ${this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? '#8b8b8b' : '#e1e1e1'}` }}>
								<img src={`${this.getIconDirectory()}/zoom_in.png`} style={{ verticalAlign: 'middle' }} />
							</Button>
							<div style={{ width: 50, height: 30, padding: '4px 16px', display: 'inline-table', borderLeft: `solid 1px ${this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? '#8b8b8b' : '#e1e1e1'}` }}>
								{(this.state.zoomSize * 100).toFixed(0)}%
							</div>
							<Button title={lang.window.toolBar.menu.menus.zoom.zoomOut} onClick={() => { ipcRenderer.send(`browserView-zoomOut-${this.props.match.params.windowId}`, { id: this.props.match.params.tabId }); this.forceUpdate(); }}
								style={{ width: 50, height: 30, padding: '4px 16px', display: 'inline-table', borderLeft: `solid 1px ${this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? '#8b8b8b' : '#e1e1e1'}` }}>
								<img src={`${this.getIconDirectory()}/zoom_out.png`} style={{ verticalAlign: 'middle' }} />
							</Button>
							<Button title={lang.window.toolBar.menu.menus.zoom.fullScreen} onClick={() => { this.closeMenu(); ipcRenderer.send(`window-fullScreen-${this.props.match.params.windowId}`, {}); }}
								style={{ width: 50, height: 30, padding: '4px 16px', display: 'inline-table', borderLeft: `solid 1px ${this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? '#8b8b8b' : '#e1e1e1'}` }}>
								<img src={`${this.getIconDirectory()}/fullscreen.png`} style={{ verticalAlign: 'middle' }} />
							</Button>
						</div>
					</div>
					<Divider style={{ marginTop: 0, marginBottom: 0 }} isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')} />
					<div style={{ display: 'flex', paddingLeft: 7 }}>
						<span style={{ width: 'auto', marginLeft: 25, display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center' }}>{lang.window.toolBar.menu.menus.edit.name}</span>
						<div style={{ display: 'flex', marginLeft: 'auto' }}>
							<Button style={{ width: 70, height: 30, borderLeft: `solid 1px ${this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? '#8b8b8b' : '#e1e1e1'}` }}>
								{lang.window.toolBar.menu.menus.edit.cut}
							</Button>
							<Button style={{ width: 70, height: 30, borderLeft: `solid 1px ${this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? '#8b8b8b' : '#e1e1e1'}` }}>
								{lang.window.toolBar.menu.menus.edit.copy}
							</Button>
							<Button style={{ width: 70, height: 30, borderLeft: `solid 1px ${this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? '#8b8b8b' : '#e1e1e1'}` }}>
								{lang.window.toolBar.menu.menus.edit.paste}
							</Button>
						</div>
					</div>
					<Divider style={{ marginTop: 0 }} isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')} />
					<Button onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://bookmarks`, true); }}>
						<img src={`${this.getIconDirectory()}/bookmarks.png`} style={{ verticalAlign: 'middle' }} />
						<ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.bookmarks}</ButtonTitle>
						<ButtonAccelerator>{platform.isDarwin ? 'Cmd+B' : 'Ctrl+B'}</ButtonAccelerator>
					</Button>
					<Button onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://history`, true); }}>
						<img src={`${this.getIconDirectory()}/history.png`} style={{ verticalAlign: 'middle' }} />
						<ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.history}</ButtonTitle>
						<ButtonAccelerator>{platform.isDarwin ? 'Cmd+H' : 'Ctrl+H'}</ButtonAccelerator>
					</Button>
					<Button onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://downloads`, true); }}>
						<img src={`${this.getIconDirectory()}/download.png`} style={{ verticalAlign: 'middle' }} />
						<ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.downloads}</ButtonTitle>
						<ButtonAccelerator>{platform.isDarwin ? 'Cmd+D' : 'Ctrl+D'}</ButtonAccelerator>
					</Button>
					<Button onClick={() => { this.setState({ isOpen: 'app' }); }}>
						<ButtonTitle hasIcon={false}>{lang.window.toolBar.menu.menus.app.name}</ButtonTitle>
						<ButtonAccelerator></ButtonAccelerator>
						<MoreIcon isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')} />
					</Button>
					<Divider isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')} />
					<Button onClick={() => { this.closeMenu(); ipcRenderer.send(`browserView-print-${this.props.match.params.windowId}`, { id: this.props.match.params.tabId }); }}>
						<img src={`${this.getIconDirectory()}/print.png`} style={{ verticalAlign: 'middle' }} />
						<ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.print}</ButtonTitle>
						<ButtonAccelerator>{platform.isDarwin ? 'Cmd+P' : 'Ctrl+P'}</ButtonAccelerator>
					</Button>
					<Button>
						<img src={`${this.getIconDirectory()}/find.png`} style={{ verticalAlign: 'middle' }} />
						<ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.find}</ButtonTitle>
						<ButtonAccelerator>{platform.isDarwin ? 'Cmd+F' : 'Ctrl+F'}</ButtonAccelerator>
					</Button>
					<Button onClick={() => { this.setState({ isOpen: 'otherTools' }); }}>
						<ButtonTitle hasIcon={false}>{lang.window.toolBar.menu.menus.otherTools.name}</ButtonTitle>
						<ButtonAccelerator></ButtonAccelerator>
						<MoreIcon isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')} />
					</Button>
					<Divider isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')} />
					<Button onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://settings`, true); }}>
						<img src={`${this.getIconDirectory()}/settings.png`} style={{ verticalAlign: 'middle' }} />
						<ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.settings}</ButtonTitle>
						<ButtonAccelerator></ButtonAccelerator>
					</Button>
					<Button onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://help`, true); }}>
						<img src={`${this.getIconDirectory()}/help_outline.png`} style={{ verticalAlign: 'middle' }} />
						<ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.help}</ButtonTitle>
						<ButtonAccelerator></ButtonAccelerator>
					</Button>
					<Divider isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')} />
					<Button>
						<ButtonTitle hasIcon={false}>{lang.window.toolBar.menu.menus.close}</ButtonTitle>
						<ButtonAccelerator>{platform.isDarwin ? 'Cmd+Q' : 'Alt+F4'}</ButtonAccelerator>
					</Button>
				</Window>
				<Dialog isOpen={this.state.isOpen === 'userInfo'} isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')}>
					<DialogHeader>
						<DialogHeaderButton src={this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? DarkBackIcon : LightBackIcon} size={18} onClick={() => { this.setState({ isOpen: null }); }} />
						<DialogHeaderTitle>{lang.window.toolBar.menu.menus.userInfo}</DialogHeaderTitle>
					</DialogHeader>
					<DialogContainer isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')}>
					</DialogContainer>
				</Dialog>
				<Dialog isOpen={this.state.isOpen === 'app'} isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')}>
					<DialogHeader>
						<DialogHeaderButton src={this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? DarkBackIcon : LightBackIcon} size={18} onClick={() => { this.setState({ isOpen: null }); }} />
						<DialogHeaderTitle>{lang.window.toolBar.menu.menus.app.name}</DialogHeaderTitle>
					</DialogHeader>
					<DialogContainer isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')}>
						<Button onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://apps/`); }}>
							<img src={`${this.getIconDirectory()}/apps.png`} style={{ verticalAlign: 'middle' }} />
							<ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.app.list}</ButtonTitle>
							<ButtonAccelerator></ButtonAccelerator>
						</Button>
						<Divider isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')} />
						<Button onClick={() => { this.closeMenu(); ipcRenderer.send(`appWindow-add`, { url: this.state.url }); }}>
							<ButtonTitle hasIcon={false}>{String(lang.window.toolBar.menu.menus.app.run).replace(/{title}/, lang.window.toolBar.menu.menus.app.name)}</ButtonTitle>
							<ButtonAccelerator></ButtonAccelerator>
						</Button>
					</DialogContainer>
				</Dialog>
				<Dialog isOpen={this.state.isOpen === 'otherTools'} isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')}>
					<DialogHeader>
						<DialogHeaderButton src={this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? DarkBackIcon : LightBackIcon} size={18} onClick={() => { this.setState({ isOpen: null }); }} />
						<DialogHeaderTitle>{lang.window.toolBar.menu.menus.otherTools.name}</DialogHeaderTitle>
					</DialogHeader>
					<DialogContainer isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')}>
						<Button onClick={() => { this.closeMenu(); ipcRenderer.send(`browserView-savePage-${this.props.match.params.windowId}`, { id: this.props.match.params.tabId }); }}>
							<img src={`${this.getIconDirectory()}/save.png`} style={{ verticalAlign: 'middle' }} />
							<ButtonTitle hasIcon={true}>{lang.window.toolBar.menu.menus.otherTools.savePage}</ButtonTitle>
							<ButtonAccelerator>{platform.isDarwin ? 'Cmd+S' : 'Ctrl+S'}</ButtonAccelerator>
						</Button>
						<Divider isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')} />
						<Button onClick={() => { this.closeMenu(); ipcRenderer.send(`browserView-viewSource-${this.props.match.params.windowId}`, { id: this.props.match.params.tabId }); }}>
							<ButtonTitle hasIcon={false}>{lang.window.toolBar.menu.menus.otherTools.viewSource}</ButtonTitle>
							<ButtonAccelerator>{platform.isDarwin ? 'Cmd+U' : 'Ctrl+U'}</ButtonAccelerator>
						</Button>
						<Button onClick={() => { this.closeMenu(); ipcRenderer.send(`browserView-devTool-${this.props.match.params.windowId}`, { id: this.props.match.params.tabId }); }}>
							<ButtonTitle hasIcon={false}>{lang.window.toolBar.menu.menus.otherTools.devTool}</ButtonTitle>
							<ButtonAccelerator>{platform.isDarwin ? 'Cmd+Shift+I' : 'Ctrl+Shift+I'}</ButtonAccelerator>
						</Button>
					</DialogContainer>
				</Dialog>
			</div>
		);
	}
}

export default MenuWindow;