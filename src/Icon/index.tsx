import * as React from 'react';
import styled from 'styled-components/native';

//@ts-ignore
import iconFont from '../assets/BaseSharp.ttf';
import FontMap_BaseSharp from './fontmap-BaseSharp'
import { Text } from 'react-native';


const SText = styled(Text)`
  font-family: ${require('../assets/BaseSharp.ttf')};
`;

const Icon = ({name, ...props}: any)=>{
return <SText {...props} >{FontMap_BaseSharp[name]}</SText>
} 


export default Icon
