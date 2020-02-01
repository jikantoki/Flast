import styled from 'styled-components';

export const Titlebar = styled.div`
  width: 100%;
  height: 33px;
  box-sizing: border-box;
  background: ${props => props.isActive ? (props.color !== undefined ? props.color : '#202340') : '#c7c7c7'};
  border-bottom: solid 0.5px #8b8b8b;
  -webkit-app-region: drag;
`;

export const Menubar = styled.div`
  width: fit-content;
  height: 33px;
  box-sizing: border-box;
  background: ${props => props.color !== undefined ? props.color : '#202340'};
  border-bottom: solid 0.5px #8b8b8b;
  opacity: 1;
  display: flex;
  flex-flow: row nowrap;
  -webkit-app-region: no-drag;
`;

export const MenuButton = styled.div`
  width: auto;
  height: 100%;
  padding: 4px 12px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-around;
  align-items: center;
	align-content: space-around;
`;
