import styled from 'styled-components';

const Toolbar = styled.div`
  width: 100%;
  height: 40px;
  display: flex;
  align-content: space-around;
  background-color: ${props => !props.isDarkModeOrPrivateMode ? '#f9f9fa' : '#353535'};
  border-bottom: ${props => !props.isBookmarkBar ? `solid 1px ${!props.isDarkModeOrPrivateMode ? '#e1e1e1' : '#8b8b8b'}` : 'none'};
  box-sizing: border-box;
`;

export default Toolbar;