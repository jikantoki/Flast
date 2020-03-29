import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { parse, format } from 'url';
import QRCode from 'qrcode.react';

import DarkBackIcon from './Resources/dark/arrow_back.svg';
import LightBackIcon from './Resources/light/arrow_back.svg';

const { remote, ipcRenderer, shell } = window.require('electron');
const { app, systemPreferences, Menu, MenuItem, dialog, nativeTheme, clipboard } = remote;

const platform = window.require('electron-platform');
const path = window.require('path');

const pkg = window.require(`${app.getAppPath()}/package.json`);
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const Config = window.require('electron-store');
const config = new Config();
const userConfig = new Config({
	cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

const lang = window.require(`${app.getAppPath()}/langs/${userConfig.get('language') != undefined ? userConfig.get('language') : 'ja'}.js`);

const buttonHeight = 30;

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

const StyledButton = styled.div`
  width: 100%;
  height: ${buttonHeight}px;
  margin: 0px;
  padding: 0px 7px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  background: none;
  transition: 0.2s background-color;
  font-family: 'Noto Sans', 'Noto Sans JP';

  &:hover {
    background-color: rgba(196, 196, 196, 0.4);
  }
`;

const StyledButtonIcon = styled.img`
  width: 18px;
  height: 18px;
`;

const StyledButtonIconSkeleton = styled.div`
  width: 18px;
  height: 18px;
`;

const StyledButtonTitle = styled.span`
  width: auto;
  margin-left: 5px;
`;

const StyledButtonAccelerator = styled.span`
  width: auto;
  margin-left: auto;
  margin-right: ${props => props.isMoreIcon ? 8 : 20}px;
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
  height: ${platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? '581px' : '100%'};
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
  margin: 0 auto;
  display: flex;
  align-items: center;
  font-family: 'Noto Sans', 'Noto Sans JP';
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
			<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 59.414 59.414" style={{ display: this.props.isShowing ? 'block' : 'none' }}>
				<g>
					<polygon fill={this.props.isDarkModeOrPrivateMode ? '#e1e1e1' : '#8b8b8b'} points="15.561,59.414 14.146,58 42.439,29.707 14.146,1.414 15.561,0 45.268,29.707"></polygon>
				</g>
			</svg>
		);
	}
}

class Button extends Component {

	getTheme = () => {
		if (userConfig.get('design.theme') === -1)
			return nativeTheme.shouldUseDarkColors;
		else if (userConfig.get('design.theme') === 0)
			return false;
		else if (userConfig.get('design.theme') === 1)
			return true;
	}

	render() {
		return (
			<StyledButton onClick={this.props.onClick}>
				{this.props.icon ? <StyledButtonIcon src={this.props.icon} /> : <StyledButtonIconSkeleton />}
				<StyledButtonTitle>{this.props.title}</StyledButtonTitle>
				<StyledButtonAccelerator isMoreIcon={this.props.isMoreIcon}>{this.props.accelerator}</StyledButtonAccelerator>
				<MoreIcon isDarkModeOrPrivateMode={this.getTheme() || String(this.props.windowId).startsWith('private')} isShowing={this.props.isMoreIcon} />
			</StyledButton>
		);
	}
}

class MenuWindow extends Component {

	constructor(props) {
		super(props);

		this.state = {
			windowId: '',
			tabId: '',
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

		ipcRenderer.on(`menuWindow-${remote.getCurrentWindow().id}`, (e, args) => {
			this.setState({ windowId: args.windowId, tabId: args.tabId, isOpen: null, url: args.url, zoomSize: args.zoomSize });
			this.forceUpdate();
		});

		ipcRenderer.on(`browserView-zoom-menu-${remote.getCurrentWindow().id}`, (e, args) => {
			this.setState({ zoomSize: args.result });
			this.forceUpdate();
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

	getForegroundColor = (hexColor) => {
		var r = parseInt(hexColor.substr(1, 2), 16);
		var g = parseInt(hexColor.substr(3, 2), 16);
		var b = parseInt(hexColor.substr(5, 2), 16);

		return ((((r * 299) + (g * 587) + (b * 114)) / 1000) < 128) ? '#ffffff' : '#000000';
	}

	addTab = (url = (userConfig.get('homePage.isDefaultHomePage') ? `${protocolStr}://home/` : userConfig.get('homePage.defaultPage')), isInternal = false) => {
		if (isInternal) {
			const u = parse(this.state.url);

			u.protocol === `${protocolStr}:` ? ipcRenderer.send(`browserView-loadURL-${this.state.windowId}`, { id: this.state.tabId, url }) : ipcRenderer.send(`tab-add-${this.state.windowId}`, { url, isActive: true });
		} else {
			ipcRenderer.send(`tab-add-${this.state.windowId}`, { url, isActive: true });
		}
	}

	closeMenu = () => {
		this.setState({ isOpen: null });
		ipcRenderer.send(`menuWindow-close-${remote.getCurrentWindow().id}`, {});
	}

	getIconDirectory = () => {
		return `${app.getAppPath()}/static/${this.getTheme() || String(this.state.windowId).startsWith('private') ? 'dark' : 'light'}`;
	}

	render() {
		return (
			<div style={{ boxSizing: 'border-box', width: '100%', height: platform.isWin32 && systemPreferences.isAeroGlassEnabled() || platform.isDarwin ? 'auto' : '100%' }}>
				<Window isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')}>
					<Button icon={`${this.getIconDirectory()}/account.png`} isMoreIcon title={lang.window.toolBar.menu.menus.userInfo} onClick={() => { this.setState({ isOpen: 'userInfo' }); }} windowId={this.state.windowId} />
					<Divider isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')} />
					<Button title={lang.window.toolBar.menu.menus.newTab} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+T`} isMoreIcon={false} onClick={() => { this.closeMenu(); this.addTab(); }} />
					<Button title={lang.window.toolBar.menu.menus.newWindow} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+N`} isMoreIcon={false} onClick={() => { this.closeMenu(); ipcRenderer.send(`window-add`, { isPrivate: false }); }} windowId={this.state.windowId} />
					<Button title={lang.window.toolBar.menu.menus.openPrivateWindow} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+Shift+N`} isMoreIcon={false} onClick={() => { this.closeMenu(); ipcRenderer.send(`window-add`, { isPrivate: true }); }} windowId={this.state.windowId} />
					<Divider style={{ marginBottom: 0 }} isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')} windowId={this.state.windowId} />
					<div style={{ display: 'flex', paddingLeft: 7 }}>
						<span style={{ width: 'auto', marginLeft: 25, display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', fontFamily: '"Noto Sans", "Noto Sans JP"' }}>{lang.window.toolBar.menu.menus.zoom.name}</span>
						<div style={{ display: 'flex', marginLeft: 'auto' }}>
							<StyledButton title={lang.window.toolBar.menu.menus.zoom.zoomIn} onClick={() => { ipcRenderer.send(`browserView-zoomIn-${this.state.windowId}`, { id: this.state.tabId }); this.forceUpdate(); }}
								style={{ width: 50, height: 32, padding: '4px 16px', display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', WebkitBoxPack: 'center', justifyContent: 'center', borderLeft: `solid 1px ${this.getTheme() || String(this.state.windowId).startsWith('private') ? '#8b8b8b' : '#e1e1e1'}` }}>
								<img src={`${this.getIconDirectory()}/zoom_in.png`} style={{ verticalAlign: 'middle' }} />
							</StyledButton>
							<div style={{ width: 60, height: 32, padding: '4px 16px', display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', WebkitBoxPack: 'center', justifyContent: 'center', background: 'none', fontFamily: '"Noto Sans", "Noto Sans JP"', fontSize: 14 }}>
								{(this.state.zoomSize * 100).toFixed(0)}%
							</div>
							<StyledButton title={lang.window.toolBar.menu.menus.zoom.zoomOut} onClick={() => { ipcRenderer.send(`browserView-zoomOut-${this.state.windowId}`, { id: this.state.tabId }); this.forceUpdate(); }}
								style={{ width: 50, height: 32, padding: '4px 16px', display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', WebkitBoxPack: 'center', justifyContent: 'center' }}>
								<img src={`${this.getIconDirectory()}/zoom_out.png`} style={{ verticalAlign: 'middle' }} />
							</StyledButton>
							<StyledButton title={lang.window.toolBar.menu.menus.zoom.fullScreen} onClick={() => { this.closeMenu(); ipcRenderer.send(`window-fullScreen-${this.state.windowId}`, {}); }}
								style={{ width: 50, height: 32, padding: '4px 16px', display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', WebkitBoxPack: 'center', justifyContent: 'center', borderLeft: `solid 1px ${this.getTheme() || String(this.state.windowId).startsWith('private') ? '#8b8b8b' : '#e1e1e1'}` }}>
								<img src={`${this.getIconDirectory()}/fullscreen.png`} style={{ verticalAlign: 'middle' }} />
							</StyledButton>
						</div>
					</div>
					<Divider style={{ marginTop: 0, marginBottom: 0 }} isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')} />
					<div style={{ display: 'flex', paddingLeft: 7 }}>
						<span style={{ width: 'auto', marginLeft: 25, display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', fontFamily: '"Noto Sans", "Noto Sans JP"' }}>{lang.window.toolBar.menu.menus.edit.name}</span>
						<div style={{ display: 'flex', marginLeft: 'auto' }}>
							<StyledButton style={{ width: 70, height: 32, display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', WebkitBoxPack: 'center', justifyContent: 'center', borderLeft: `solid 1px ${this.getTheme() || String(this.state.windowId).startsWith('private') ? '#8b8b8b' : '#e1e1e1'}` }}>
								{lang.window.toolBar.menu.menus.edit.cut}
							</StyledButton>
							<StyledButton style={{ width: 70, height: 32, display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', WebkitBoxPack: 'center', justifyContent: 'center', borderLeft: `solid 1px ${this.getTheme() || String(this.state.windowId).startsWith('private') ? '#8b8b8b' : '#e1e1e1'}` }}>
								{lang.window.toolBar.menu.menus.edit.copy}
							</StyledButton>
							<StyledButton style={{ width: 70, height: 32, display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', WebkitBoxPack: 'center', justifyContent: 'center', borderLeft: `solid 1px ${this.getTheme() || String(this.state.windowId).startsWith('private') ? '#8b8b8b' : '#e1e1e1'}` }}>
								{lang.window.toolBar.menu.menus.edit.paste}
							</StyledButton>
						</div>
					</div>
					<Divider style={{ marginTop: 0 }} isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')} />
					<Button icon={`${this.getIconDirectory()}/bookmarks.png`} title={lang.window.toolBar.menu.menus.bookmarks} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+B`} isMoreIcon={false} onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://bookmarks`, true); }} windowId={this.state.windowId} />
					<Button icon={`${this.getIconDirectory()}/history.png`} title={lang.window.toolBar.menu.menus.history} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+H`} isMoreIcon={false} onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://history`, true); }} windowId={this.state.windowId} />
					<Button icon={`${this.getIconDirectory()}/download.png`} title={lang.window.toolBar.menu.menus.downloads} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+D`} isMoreIcon={false} onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://downloads`, true); }} windowId={this.state.windowId} />
					<Button title={lang.window.toolBar.menu.menus.app.name} isMoreIcon={true} onClick={() => { this.setState({ isOpen: 'app' }); }} windowId={this.state.windowId} />
					<Divider isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')} />
					<Button icon={`${this.getIconDirectory()}/print.png`} title={lang.window.toolBar.menu.menus.print} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+P`} isMoreIcon={false} onClick={() => { this.closeMenu(); ipcRenderer.send(`browserView-print-${this.state.windowId}`, { id: this.state.tabId }); }} windowId={this.state.windowId} />
					<Button icon={`${this.getIconDirectory()}/find.png`} title={lang.window.toolBar.menu.menus.find} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+F`} isMoreIcon={false} onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://downloads`, true); }} windowId={this.state.windowId} />
					<Button icon={`${this.getIconDirectory()}/share.png`} title={lang.window.toolBar.menu.menus.share.name} isMoreIcon={true} onClick={() => { this.setState({ isOpen: 'share' }); }} windowId={this.state.windowId} />
					<Button title={lang.window.toolBar.menu.menus.otherTools.name} isMoreIcon={true} onClick={() => { this.setState({ isOpen: 'otherTools' }); }} windowId={this.state.windowId} />
					<Divider isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')} />
					<Button icon={`${this.getIconDirectory()}/settings.png`} title={lang.window.toolBar.menu.menus.settings} isMoreIcon={false} onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://settings`, true); }} windowId={this.state.windowId} />
					<Button icon={`${this.getIconDirectory()}/help_outline.png`} title={lang.window.toolBar.menu.menus.help.name} isMoreIcon={true} onClick={() => { this.setState({ isOpen: 'help' }); }} windowId={this.state.windowId} />
					<Divider isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')} windowId={this.state.windowId} />
					<Button title={lang.window.toolBar.menu.menus.close} isMoreIcon={false} accelerator={platform.isDarwin ? 'Cmd+Q' : 'Alt+F4'} windowId={this.state.windowId} />
				</Window>
				<Dialog isOpen={this.state.isOpen === 'userInfo'} isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')}>
					<DialogHeader>
						<DialogHeaderButton src={this.getTheme() || String(this.state.windowId).startsWith('private') ? DarkBackIcon : LightBackIcon} size={18} onClick={() => { this.setState({ isOpen: null }); }} />
						<DialogHeaderTitle>{lang.window.toolBar.menu.menus.userInfo}</DialogHeaderTitle>
					</DialogHeader>
					<DialogContainer isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')}>
					</DialogContainer>
				</Dialog>
				<Dialog isOpen={this.state.isOpen === 'app'} isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')}>
					<DialogHeader>
						<DialogHeaderButton src={this.getTheme() || String(this.state.windowId).startsWith('private') ? DarkBackIcon : LightBackIcon} size={18} onClick={() => { this.setState({ isOpen: null }); }} />
						<DialogHeaderTitle>{lang.window.toolBar.menu.menus.app.name}</DialogHeaderTitle>
					</DialogHeader>
					<DialogContainer isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')}>
						<Button icon={`${this.getIconDirectory()}/apps.png`} title={lang.window.toolBar.menu.menus.app.list} isMoreIcon={false} onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://apps/`); }} windowId={this.state.windowId} />
						<Divider isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')} />
						<Button title={'Open with Column View'} isMoreIcon={false} onClick={() => { this.closeMenu(); ipcRenderer.send(`appWindow-add`, { url: `${protocolStr}://column` }); }} windowId={this.state.windowId} />
						{parse(this.state.url).protocol !== `${protocolStr}:` &&
							<Fragment>
								<Divider isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')} />
								<Button title={String(lang.window.toolBar.menu.menus.app.run).replace(/{title}/, lang.window.toolBar.menu.menus.app.name)} isMoreIcon={false} onClick={() => { this.closeMenu(); ipcRenderer.send(`appWindow-add`, { url: this.state.url }); }} windowId={this.state.windowId} />
							</Fragment>
						}
					</DialogContainer>
				</Dialog>
				<Dialog isOpen={this.state.isOpen === 'share'} isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')}>
					<DialogHeader>
						<DialogHeaderButton src={this.getTheme() || String(this.state.windowId).startsWith('private') ? DarkBackIcon : LightBackIcon} size={18} onClick={() => { this.setState({ isOpen: null }); }} />
						<DialogHeaderTitle>{lang.window.toolBar.menu.menus.share.name}</DialogHeaderTitle>
					</DialogHeader>
					<DialogContainer isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')}>
						<Button icon={`${this.getIconDirectory()}/copy.png`} title={lang.window.toolBar.menu.menus.share.linkCopy} isMoreIcon={false} onClick={() => { this.closeMenu(); clipboard.writeText(this.state.url); }} windowId={this.state.windowId} />
						{parse(this.state.url).protocol !== `${protocolStr}:` &&
							<Fragment>
								<Divider isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')} />
								<div style={{ display: 'flex', WebkitBoxAlign: 'center', alignItems: 'center', WebkitBoxPack: 'center', justifyContent: 'center' }}>
									<QRCode value={this.state.url} size={200} />
								</div>
							</Fragment>
						}
					</DialogContainer>
				</Dialog>
				<Dialog isOpen={this.state.isOpen === 'otherTools'} isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')}>
					<DialogHeader>
						<DialogHeaderButton src={this.getTheme() || String(this.state.windowId).startsWith('private') ? DarkBackIcon : LightBackIcon} size={18} onClick={() => { this.setState({ isOpen: null }); }} />
						<DialogHeaderTitle>{lang.window.toolBar.menu.menus.otherTools.name}</DialogHeaderTitle>
					</DialogHeader>
					<DialogContainer isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')}>
						<Button icon={`${this.getIconDirectory()}/save.png`} title={lang.window.toolBar.menu.menus.otherTools.savePage} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+S`} isMoreIcon={false} onClick={() => { this.closeMenu(); ipcRenderer.send(`browserView-savePage-${this.state.windowId}`, { id: this.state.tabId }); }} windowId={this.state.windowId} />
						<Divider isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')} />
						<Button title={lang.window.toolBar.menu.menus.otherTools.viewSource} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+U`} isMoreIcon={false} onClick={() => { this.closeMenu(); ipcRenderer.send(`browserView-viewSource-${this.state.windowId}`, { id: this.state.tabId }); }} windowId={this.state.windowId} />
						<Button title={lang.window.toolBar.menu.menus.otherTools.devTool} accelerator={`${platform.isDarwin ? 'Cmd' : 'Ctrl'}+Shift+I`} isMoreIcon={false} onClick={() => { this.closeMenu(); ipcRenderer.send(`browserView-devTool-${this.state.windowId}`, { id: this.state.tabId }); }} windowId={this.state.windowId} />
					</DialogContainer>
				</Dialog>
				<Dialog isOpen={this.state.isOpen === 'help'} isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')}>
					<DialogHeader>
						<DialogHeaderButton src={this.getTheme() || String(this.state.windowId).startsWith('private') ? DarkBackIcon : LightBackIcon} size={18} onClick={() => { this.setState({ isOpen: null }); }} />
						<DialogHeaderTitle>{lang.window.toolBar.menu.menus.help.name}</DialogHeaderTitle>
					</DialogHeader>
					<DialogContainer isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')}>
						<Button icon={`${this.getIconDirectory()}/help_outline.png`} title={lang.window.toolBar.menu.menus.help.name} accelerator="F1" isMoreIcon={false} onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://settings/about`, true); }} windowId={this.state.windowId} />
						<Divider isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')} />
						<Button title={lang.window.toolBar.menu.menus.help.feedback} accelerator={`${platform.isDarwin ? 'Option' : 'Alt'}+Shift+I`} isMoreIcon={false} onClick={() => { this.closeMenu(); ipcRenderer.send(`feedbackWindow-open`, {}); }} windowId={this.state.windowId} />
						<Divider isVertical={false} isDarkModeOrPrivateMode={this.getTheme() || String(this.state.windowId).startsWith('private')} />
						<Button title={lang.window.toolBar.menu.menus.help.about} isMoreIcon={false} onClick={() => { this.closeMenu(); this.addTab(`${protocolStr}://settings/about`, true); }} windowId={this.state.windowId} />
					</DialogContainer>
				</Dialog>
			</div>
		);
	}
}

export default MenuWindow;