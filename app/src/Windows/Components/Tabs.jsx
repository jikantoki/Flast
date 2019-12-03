import styled from 'styled-components';

const windowsAndLinux = 220;
const macOS = 74;

const Tabs = styled.div`
  width: fit-content;
  max-width: ${props => props.isCustomTitlebar ? `calc(100% - ${props.isWindowsOrLinux ? windowsAndLinux : macOS}px)` : '100%'};
  height: 100%;
  position: relative;
  display: flex;
  left: ${props => !props.isWindowsOrLinux ? `${macOS}px` : '0px'};
  border-left: ${props => !props.isWindowsOrLinux ? `solid 0.5px #8b8b8b` : 'none'};
  background: initial;
  -webkit-app-region: no-drag;
`;

export default Tabs;