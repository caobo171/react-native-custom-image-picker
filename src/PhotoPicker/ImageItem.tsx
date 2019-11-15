import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
} from 'react-native';

import * as Animatable from 'react-native-animatable'

import FastImage from 'react-native-fast-image'
import { ImagePickerResponse } from '../types'
import styled from 'styled-components/native'


const { width, height } = Dimensions.get('window')


interface Props {
    image: ImagePickerResponse,
    onSelect: (image: ImagePickerResponse) => void;
    selected: boolean,
    order: null | number
}

const StyleNumberIndicator = styled(View)`
  height: 32px;
  width: 32px;
  border-radius: 16px;
  background-color: #1f96ff;
  align-items: center;
  justify-content: center;
  opacity: 1;
 
`
const StyledView = styled(TouchableOpacity)`
  width: 100%;
  position: relative;


`
const StyledImage = styled(FastImage)`
  width: ${width / 3};
  height: ${width / 3};
  background-color: orange;
`
const StyledOverlay = styled(View)`
  position: absolute;
  left: 0 ;
  top: 0 ;
  width: 100%;
  height: 100%;
  background-color: rgba(255,255,255,0.4);
  align-items: center;
  justify-content: center;
`

const StyledText = styled(Text)`
  color: #ffffff;
`

const ImageItem = React.memo((props: Props) => {



    return (
        <StyledView onPress={() => props.onSelect(props.image)}>
            <StyledImage source={{ uri: props.image.uri }} />
            {
                props.selected && <StyledOverlay>
                    <StyleNumberIndicator>

                        <StyledText>{props.order}</StyledText>
                    </StyleNumberIndicator>
                </StyledOverlay>
            }
        </StyledView>

    )
})

export default ImageItem