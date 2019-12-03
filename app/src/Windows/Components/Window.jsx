import styled from 'styled-components';

const borderColor = '#8b8b8b';

const Window = styled.div`
  width: 100vw;
  height: 100vh;
  border: ${props => props.isMaximized ? 'none' : (props.isCustomTitlebar ? (props.isActive ? `solid 1px ${props.color !== undefined ? props.color : borderColor}` : `solid 1px ${borderColor}`) : 'none')};
`;

export default Window;