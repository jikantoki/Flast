import styled from 'styled-components';

const Titlebar = styled.div`
  width: 100%;
  height: 33px;
  background: ${props => props.isActive ? (props.color !== undefined ? props.color : '#202340') : '#c7c7c7'};
  border-bottom: solid 0.5px #8b8b8b;
  -webkit-app-region: drag;
`;

export default Titlebar;