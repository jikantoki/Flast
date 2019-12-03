import styled from 'styled-components';

import ContentEditable from './ContentEditable';
import { Component } from 'react';

const buttonSize = 30;
const radiusSize = 2;

export const ToolbarTextBoxWrapper = styled.div`
  /* width: calc((100% - 40px * ${props => props.buttonCount}) - 25px); */
  height: 30px;
  margin: 5px;
  padding: 0px;
  flex-grow: 4;
  position: relative;
  font-size: 14.5px;
  background-color: ${props => !props.isDarkModeOrPrivateMode ? 'white' : '#252525'};
  border: solid 1px #c1c1c1;
  border-radius: ${radiusSize}px;
  outline: none;
  color: ${props => !props.isDarkModeOrPrivateMode ? 'black' : 'white'};
  box-sizing: border-box;
  &:hover, &:focus {
    box-shadow: 0 5px 10px -3px rgba(0,0,0,.15), 0 0 3px rgba(0,0,0,.1);
    transition: 0.2s;
  }

  div {
    width: ${buttonSize}px;
    height: 100%;
    margin: 0px;
    position: absolute;
  }

  div:first-child {
    left: 0px;
    border-top-left-radius: ${radiusSize}px;
    border-bottom-left-radius: ${radiusSize}px;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
  }

  div:last-child {
    right: 0px;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    border-top-right-radius: ${radiusSize}px;
    border-bottom-right-radius: ${radiusSize}px;
  }
`;

export const ToolbarTextBox = styled.input`
  width: calc(100% - (${buttonSize}px * ${props => props.buttonCount}));
  height: 100%;
  margin: 0px;
  padding: 3px 5px;
  left: ${buttonSize}px;
  right: ${buttonSize}px;
  position: absolute;
  box-sizing: border-box;
  outline: none;
  cursor: initial;
  background: unset;
  border: none;
  /* border-left: solid 1px #c1c1c1; */
  /* border-right: solid 1px #c1c1c1; */
`;