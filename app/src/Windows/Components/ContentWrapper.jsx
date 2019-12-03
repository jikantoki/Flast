import styled from 'styled-components';

const ContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${props => props.isLoading ? (!props.isDarkModeOrPrivateMode ? '#f9f9fa' : '#353535') : 'initial'};
  box-sizing: border-box;
`;

export default ContentWrapper;