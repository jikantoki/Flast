import styled from 'styled-components';

const WindowButtons = styled.div`
  ${props => props.isWindowsOrLinux ? `
    width: auto;
    height: 32px;
    display: ${props.isCustomTitlebar ? 'flex' : 'none'};
    position: absolute;
    top: ${props.isMaximized ? 0 : 1}px;
    right: 0px;
    box-sizing: border-box;
  ` : `
    width: 74px;
    height: 32px;
    box-sizing: border-box;
  `}
`;

export default WindowButtons;