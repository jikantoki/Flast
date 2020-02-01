import React, { Component } from 'react';

import styled from 'styled-components';

import DarkFileIcon from './Resources/dark/file.svg';
import LightFileIcon from './Resources/light/file.svg';

import DarkSearchIcon from './Resources/dark/search.svg';
import LightSearchIcon from './Resources/light/search.svg';

import * as http from 'http';
import * as https from 'https';
import { parse } from 'url';

import { isURL, prefixHttp } from '../Utils/URL';

const { remote, ipcRenderer, shell } = window.require('electron');
const { app, systemPreferences, Menu, MenuItem, dialog, nativeTheme } = remote;

const platform = require('electron-platform');

const Config = window.require('electron-store');
const config = new Config();

const request = window.require('request');

const lang = window.require(`${app.getAppPath()}/langs/${config.get('language') != undefined ? config.get('language') : 'ja'}.js`);

const Window = styled.div`
  width: auto;
  height: ${platform.isWin32 || platform.isDarwin ? 'auto' : '100%'};
  margin: ${platform.isWin32 || platform.isDarwin ? '0px 4px' : '0px'};
  padding: 0px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  border-radius: ${platform.isWin32 || platform.isDarwin ? 2 : 0}px;
  border: ${platform.isWin32 || platform.isDarwin ? 'none' : (props => !props.isDarkModeOrPrivateMode ? 'solid 1px #e1e1e1' : 'solid 1px #8b8b8b')};
  background-color: ${props => !props.isDarkModeOrPrivateMode ? '#f9f9fa' : '#353535'};
  color: ${props => !props.isDarkModeOrPrivateMode ? '#353535' : '#f9f9fa'};
  box-shadow: ${platform.isWin32 || platform.isDarwin ? '0px 2px 4px rgba(0, 0, 0, 0.16), 0px 2px 4px rgba(0, 0, 0, 0.23)' : 'none'};
  box-sizing: border-box;
`;

const SuggestListContainer = styled.ul`
  margin: 5px;
  padding: 0px;
  box-sizing: border-box;
`;

const SuggestListItem = styled.li`
  padding: ${`4px ${40 * (config.get('design.isHomeButton') ? 5 : 4) - 40}`}px;
  list-style: none;
  transition: 0.2s background-color;
  border-radius: 2px;
  box-sizing: border-box;
  &:hover {
    background-color: rgba(196, 196, 196, 0.4);
  }
`;

const SuggestListItemSecondaryText = styled.span`
  margin-left: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  box-sizing: border-box;
  
  ${SuggestListItem}:hover & {
	opacity: 1;
  }
`;

const SuggestListItemIcon = styled.div`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  margin-right: 5px;
  display: inline-block;
  vertical-align: sub;
  background-image: url(${props => props.src});
  background-size: ${props => props.size}px;
  background-position: center;
  background-repeat: no-repeat;
  box-sizing: border-box;
`;

const Button = styled.li`
  background: transparent;
  transition: 0.2s background-color;
  box-sizing: border-box;
  &:hover {
    background-color: rgba(196, 196, 196, 0.4);
  }
`;

class SuggestWindow extends Component {
	constructor(props) {
		super(props);
		this.state = {
			id: '',
			text: '',
			suggestions: [],
			searchEngines: []
		};

		ipcRenderer.on('window-change-settings', (e, args) => {
			this.forceUpdate();
		});

		ipcRenderer.on(`suggestWindow-${this.props.match.params.windowId}`, async (e, args) => {
			const data = JSON.parse((await this.requestURL(`http://google.com/complete/search?client=chrome&hl=ja&ie=utf_8&oe=utf_8&q=${encodeURIComponent(args.text)}`)).data);

			let suggestions = [];

			for (const item of data[1])
				if (suggestions.indexOf(item) === -1)
					suggestions.push(String(item).toLowerCase());

			this.setState({
				id: args.id,
				text: args.text,
				suggestions: suggestions.sort((a, b) => a.length - b.length).slice(0, 5)
			});
		});
	}

	componentDidMount = () => {
		config.get('searchEngine.searchEngines').forEach((item, i) => {
			this.setState(state => { return { searchEngines: [...state.searchEngines, item] }; });
		});
	}

	requestURL = (url) =>
		new Promise((resolve, reject) => {
			const options = parse(url);

			let { request } = http;

			if (options.protocol === 'https:')
				request = https.request;

			const req = request(options, res => {
				let data = '';
				res.setEncoding('utf8');

				res.on('data', chunk => {
					data += chunk;
				});

				res.on('end', () => {
					const d = { ...res, data };
					resolve(d);
				});
			});

			req.on('error', e => {
				reject(e);
			});

			req.end();
		});

	getSearchEngine = () => {
		for (var i = 0; i < config.get('searchEngine.searchEngines').length; i++)
			if (config.get('searchEngine.searchEngines')[i].name == config.get('searchEngine.defaultEngine'))
				return config.get('searchEngine.searchEngines')[i];
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

	loadURL = (value) => {
		ipcRenderer.send(`window-hideSuggest-${this.props.match.params.windowId}`, {});

		if (isURL(value) && !value.includes('://')) {
			ipcRenderer.send(`suggestWindow-loadURL-${this.props.match.params.windowId}`, { id: this.state.id, url: `http://${value}` });
		} else if (!value.includes('://')) {
			ipcRenderer.send(`suggestWindow-loadURL-${this.props.match.params.windowId}`, { id: this.state.id, url: this.getSearchEngine().url.replace('%s', encodeURIComponent(value)) });
		} else {
			const pattern = /^(file:\/\/\S.*)\S*$/;

			if (pattern.test(value)) {
				ipcRenderer.send(`browserView-loadFile-${this.props.match.params.windowId}`, { id: this.state.id, url: value.replace('file:///', '') });
			} else {
				ipcRenderer.send(`suggestWindow-loadURL-${this.props.match.params.windowId}`, { id: this.state.id, url: value });
			}
		}
	}

	getSuggestIcon = () => {
		const value = this.state.text;

		if (isURL(value) && !value.includes('://')) {
			return this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? DarkFileIcon : LightFileIcon;
		} else if (!value.includes('://')) {
			return this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? DarkSearchIcon : LightSearchIcon;
		} else {
			return this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? DarkFileIcon : LightFileIcon;
		}
	}

	getSuggestSecondaryText = () => {
		const value = this.state.text;

		if (isURL(value) && !value.includes('://')) {
			return lang.window.toolBar.addressBar.textBox.suggest.open;
		} else if (!value.includes('://')) {
			return String(lang.window.toolBar.addressBar.textBox.suggest.search).replace(/{replace}/, this.getSearchEngine().name);
		} else {
			return lang.window.toolBar.addressBar.textBox.suggest.open;
		}
	}

	render() {
		return (
			<Window isDarkModeOrPrivateMode={this.getTheme() || String(this.props.match.params.windowId).startsWith('private')} onMouseEnter={(e) => { remote.getCurrentWindow().setIgnoreMouseEvents(false); }} onMouseLeave={(e) => { remote.getCurrentWindow().setIgnoreMouseEvents(true, { forward: true }); }}>
				<SuggestListContainer>
					<SuggestListItem style={{ borderBottom: this.state.suggestions.length > 0 ? 'solid 1px #c1c1c1' : 'none', padding: 4, color: this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? '#f9f9fa' : '#353535' }} windowId={this.props.match.params.windowId} onClick={() => { this.loadURL(this.state.text); }}>
						<SuggestListItemIcon src={this.getSuggestIcon()} size={16} />
						{this.state.text}
						<SuggestListItemSecondaryText>
							<span style={{ margin: '0px 4px' }}>&mdash;</span>
							{this.getSuggestSecondaryText()}
						</SuggestListItemSecondaryText>
					</SuggestListItem>
					{this.state.suggestions.map((item, i) => {
						return (
							<SuggestListItem key={i} style={{ padding: 4, color: this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? '#f9f9fa' : '#353535' }} windowId={this.props.match.params.windowId} onClick={() => { ipcRenderer.send(`suggestWindow-loadURL-${this.props.match.params.windowId}`, { id: this.state.id, url: this.getSearchEngine().url.replace('%s', encodeURIComponent(item)) }); }}>
								<SuggestListItemIcon src={this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? DarkSearchIcon : LightSearchIcon} size={16} />
								{item}
								<SuggestListItemSecondaryText>
									<span style={{ margin: '0px 4px' }}>&mdash;</span>
									{String(lang.window.toolBar.addressBar.textBox.suggest.search).replace(/{replace}/, this.getSearchEngine().name)}
								</SuggestListItemSecondaryText>
							</SuggestListItem>
						);
					})}
				</SuggestListContainer>
				<ul style={{ margin: 0, padding: 0, backgroundColor: this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? '#5a5a5a' : '#eaeaea', borderTop: 'solid 1px #c1c1c1', borderBottomLeftRadius: 2, borderBottomRightRadius: 2 }}>
					<Button style={{ listStyle: 'none', borderRight: 'solid 1px #c1c1c1', padding: '5px 15px', display: 'inline-table' }} title={this.getSearchEngine().name} onClick={() => { ipcRenderer.send(`suggestWindow-loadURL-${this.props.match.params.windowId}`, { id: this.state.id, url: this.getSearchEngine().url.replace('%s', encodeURIComponent(this.state.text)) }); }}>
						<img src={`https://www.google.com/s2/favicons?domain=${parse(this.getSearchEngine().url).protocol}//${parse(this.getSearchEngine().url).hostname}`} alt={this.getSearchEngine().name} style={{ verticalAlign: 'middle' }} />
						<span style={{ marginLeft: 8, verticalAlign: 'middle' }}>{String(lang.window.toolBar.addressBar.textBox.suggest.search).replace(/{replace}/, this.getSearchEngine().name)}</span>
					</Button>
					{this.state.searchEngines.map((item, i) => {
						if (this.getSearchEngine().url !== item.url) {
							const parsed = parse(item.url);
							return (
								<Button key={i} style={{ listStyle: 'none', borderRight: 'solid 1px #c1c1c1', padding: '5px 15px', display: 'inline-table' }} title={String(lang.window.toolBar.addressBar.textBox.suggest.search).replace(/{replace}/, item.name)} onClick={() => { ipcRenderer.send(`suggestWindow-loadURL-${this.props.match.params.windowId}`, { id: this.state.id, url: item.url.replace('%s', encodeURIComponent(this.state.text)) }); }}>
									<img src={`https://www.google.com/s2/favicons?domain=${parsed.protocol}//${parsed.hostname}`} alt={item.name} style={{ verticalAlign: 'middle' }} />
								</Button>
							);
						}
					})}

					<Button style={{ listStyle: 'none', float: 'right', padding: '5px 10px', display: 'inline-table' }} onClick={() => ipcRenderer.send(`suggestWindow-close-${this.props.match.params.windowId}`, {})}>
						<svg name="TitleBarClose" width="12" height="12" viewBox="0 0 12 12" fill={this.getTheme() || String(this.props.match.params.windowId).startsWith('private') ? '#f9f9fa' : '#353535'} style={{ verticalAlign: 'middle' }}>
							<polygon fill-rule="evenodd" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1" />
						</svg>
					</Button>
				</ul>
			</Window>
		);
	}
}

export default SuggestWindow;