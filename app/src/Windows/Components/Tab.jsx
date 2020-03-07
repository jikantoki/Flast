import styled from 'styled-components';
import TabButton from './TabButton';

const { remote, ipcRenderer, shell } = window.require('electron');
const { app, systemPreferences, Menu, MenuItem, dialog, nativeTheme } = remote;

const path = window.require('path');

const Config = window.require('electron-store');
const config = new Config();
const userConfig = new Config({
  cwd: path.join(app.getPath('userData'), 'Users', config.get('currentUser'))
});

const lang = window.require(`${app.getAppPath()}/langs/${userConfig.get('language') != undefined ? userConfig.get('language') : 'ja'}.js`);

const buttonSize = 18;
const paddingSize = 8;

export const TabContainer = styled.div`
  width: calc(100% - (26px + 3px * 2));
  height: 100%;
  display: flex;
  box-sizing: border-box;
  -webkit-app-region: no-drag;
`;

export const Tab = styled.div`
  width: ${props => props.isFixed ? '35px' : '225px'};
  height: 103%;
  padding: 6px ${paddingSize}px;
  position: relative;
  background-color: ${props => props.isActive ? (!props.isDarkModeOrPrivateMode ? '#f9f9fa' : '#353535') : 'initial'};
  border-top: ${props => `solid ${props.isMaximized ? 3 : 2}px ${props.isActive ? props.accentColor !== undefined ? props.accentColor : userConfig.get('design.tabAccentColor') : 'transparent'}`};
  border-right: solid 0.5px #8b8b8b;
  color: ${props => props.isActive ? (!props.isDarkModeOrPrivateMode ? 'black' : 'white') : props.inActiveColor};
  font-size: 11px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition: 0.2s background-color;
  box-sizing: border-box;
  -webkit-app-region: no-drag;
  &:hover {
    background-color: ${props => !props.isActive ? 'rgba(196, 196, 196, 0.4)' : (!props.isDarkModeOrPrivateMode ? '#f9f9fa' : '#353535')};
    border-top: ${props => `solid ${props.isMaximized ? 3 : 2}px ${props.isActive ? props.accentColor !== undefined ? props.accentColor : userConfig.get('design.tabAccentColor') : 'rgba(130, 130, 130, 0.6)'}`};
  }
  &:active {
    background-color: ${props => !props.isActive ? 'rgba(130, 130, 130, 0.6)' : (!props.isDarkModeOrPrivateMode ? '#f9f9fa' : '#353535')};
  }
`;

export const TabIcon = styled.img`
  width: ${buttonSize}px;
  height: ${buttonSize}px;
  -webkit-user-drag: none;
`;

export const TabTitle = styled.div`
  width: ${props => `calc(100% - (${paddingSize}px * ${props.isShowing ? 3 : 2} + (${buttonSize}px * ${props.isShowing ? 3 : 2} + 3px * ${props.isShowing ? 3 : 2})))`};
  left: 32px;
  display: ${props => props.isFixed ? 'none' : 'block'};
  top: 5px;
  position: absolute;
  font-size: 12px;
  font-family: 'Noto Sans', 'Noto Sans JP';
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const TabStatusIcon = styled.div`
  width: ${buttonSize}px;
  height: ${buttonSize}px;
  display: ${props => !props.isFixed && props.isShowing ? 'block' : 'none'};
  margin: 0px;
  padding: 3px;
  top: 6px;
  position: absolute;
  right: 30px;
  color: ${props => props.isActive ? 'black' : 'white'};
  background-image: url(${props => props.src});
  background-size: 14px;
  background-position: center;
  background-repeat: no-repeat;
  box-sizing: border-box;
`;

export const TabCloseButton = styled(TabButton)`
  width: ${buttonSize}px;
  height: ${buttonSize}px;
  display: ${props => !props.isFixed ? 'block' : 'none'};
  margin: 0px;
  padding: 3px;
  top: 6px;
  right: 8px;
  background-size: 14px;
  position: absolute;
  float: none;
`;