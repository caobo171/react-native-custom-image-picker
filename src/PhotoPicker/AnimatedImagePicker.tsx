/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    PermissionsAndroid,
    Dimensions,
    TouchableOpacity,
    Animated,

} from 'react-native';

import * as Animatable from 'react-native-animatable'



import { RecyclerListView, LayoutProvider, DataProvider } from "recyclerlistview";

import Modal from 'react-native-modal'

import CameraRoll from '@react-native-community/cameraroll'
import styled from 'styled-components/native'
import useEffectOnce from 'react-use/lib/useEffectOnce'
import { ImagePickerResponse } from '../types'
import FastImage from 'react-native-fast-image'
import ImageItem from './ImageItem';


const { width, height } = Dimensions.get('window')



const PAGINATION = 15

const StyledView = styled(View)`
  margin: 0 ;
  padding: 0;
  background-color: #FFFFFF;
  width: 100%;
  height: ${height * 0.4}px;
`

const StyledHeaderWrapper = styled(TouchableOpacity)`
  width: 100%;
  flex-direction: row;
  align-items: center;
  background-color: yellow;
`

const StyledDescription = styled(Text)`
  margin-left: 8px;
`

const StyledIconImage = styled(FastImage)`

  height: 14px;
  width: 14px;
  margin: 12px;

`

const StyledSendText = styled(Text)`
  letter-spacing: 2;
  color: #ffffff;
`



const StyledButton = styled(TouchableOpacity)`
  height: 40px;
  position: absolute;
  background-color: #1f96ff;
  border-radius: 20px;
  margin: auto;
  width: ${width * 80 / 100}px;
  align-items: center;
  justify-content: center;

  bottom: 10px;
  left : ${width * 10 / 100}px;
  margin-left: auto;
  margin-right: auto;
`

interface PhotoPickerModalProps {
    endingPickImageHandle: (images: ImagePickerResponse[]) => void,
    isVisible: boolean,
    onCancelHandle: () => void;
    sendButtonTitle?: string,
    limitImageNumber?: number,
    overLimitedImageNumberHandle?: () => void
}

let loginHeight = new Animated.Value(250);





const AnimatedImagePicker = (props: PhotoPickerModalProps) => {

    const [images, setImages] = useState<ImagePickerResponse[]>([])

    const [_, forceUpdate] = useState(1)
    const [selectItemsObject, setSelectItemsObject] = useState<{
        [key: string]: {
            image: ImagePickerResponse,
            order: number
        }
    }>({})

    const [pageInfo, setPageInfo] = useState({
        has_next_page: true,
        end_cursor: null
    })


    const requestPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    title: 'Photos Permissions',
                    message:
                        'We need to access your photos !',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('You can access the folder');
            } else {
                console.log('Folder permission denied');
            }
        } catch (err) {
            console.warn(err);
        }
    }



    const loadMoreImages = async () => {
        let res: any = null
        if (pageInfo.has_next_page && pageInfo.end_cursor === null) {
            res = await CameraRoll.getPhotos({
                first: 30,
            })
        } else if (pageInfo.has_next_page) {
            res = await CameraRoll.getPhotos({
                first: PAGINATION,
                after: pageInfo.end_cursor
            })
        }
        if (res) {
            await setPageInfo(res.page_info)

            const resImages: ImagePickerResponse[] = res.edges.map(e => {
                return {
                    groupName: e.node.group_name,
                    uri: e.node.image.uri,
                    height: e.node.image.height,
                    width: e.node.image.width,
                    fileName: e.node.image.filename,
                    timestamp: e.node.timestamp
                }
            })

            let listData = images;
            let data = listData.concat(resImages)

            setImages(data)
        }
    }

    useEffectOnce(() => {
        (async () => {
            requestPermission()
            await loadMoreImages()
            await loadMoreImages()
        })()

    })

    const reset = () => {
        setSelectItemsObject({})
    }

    const onSelectHandle = useCallback((image: ImagePickerResponse) => {

        const length = Object.keys(selectItemsObject).length

        let data = { ...selectItemsObject }
        if (data[image.uri]) {
            const keys = Object.keys(data)
            for (let i = 0; i < keys.length; i++) {
                if (data[keys[i]].order > data[image.uri].order) {
                    data[keys[i]].order -= 1;
                }
            }

            delete data[image.uri]
        } else {

            if (props.limitImageNumber && length >= props.limitImageNumber) {
                props.overLimitedImageNumberHandle && props.overLimitedImageNumberHandle();
                return
            }

            data[image.uri] = {
                order: length + 1,
                image: image
            }
        }
        setSelectItemsObject(data)
    }, [selectItemsObject])


    const numberSelectedItem = Object.keys(selectItemsObject).length


    // useEffectOnce(()=>{

    // })

    const increaseHeightOfLogin = () => {
        Animated.timing(loginHeight, {
            toValue: height - 10,
            duration: 500
        }).start(() => {
            loadMoreImages()
        })
    }

    const decreaseHeightOfLogin = () => {
        Animated.timing(loginHeight, {
            toValue: 250,
            duration: 500
        }).start()
    }

    const headerHeight = loginHeight.interpolate({
        inputRange: [250, height - 10],
        outputRange: [30, 40]
    })

    const headerOpacity = loginHeight.interpolate({
        inputRange: [250, height - 10],
        outputRange: [0, 1]
    })


    return (
        <Animated.View
            style={{
                margin: 0,
                padding: 0,
                width: '100%',
                height: loginHeight
            }}
        >
            <TouchableOpacity
                onPress={() => {
                    increaseHeightOfLogin()
                }}>
                <Animated.View
                    style={{
                        width: '100%',
                  
                        backgroundColor: 'yellow',
                        height: headerHeight
                    }}
                >
                    <Animated.View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            opacity: headerOpacity
                        }}
                    >
                        <TouchableOpacity onPress={()=>{
                            props.onCancelHandle()
                            decreaseHeightOfLogin()
                        }
                        }>
                            <StyledIconImage
                                source={require('../assets/IconImages/icon_close.png')}
                            />
                        </TouchableOpacity>

                        <StyledDescription>{'Photos'} </StyledDescription>
                    </Animated.View>


                </Animated.View>


            </TouchableOpacity>

            {
                images.length > 0 && <RecyclerListView
                    dataProvider={new DataProvider((cell1: ImagePickerResponse, cell2: ImagePickerResponse) => {
                        return cell1.uri !== cell2.uri
                    }).cloneWithRows(images)}

                    onScroll={loadMoreImages}

                    rowRenderer={(type, data: ImagePickerResponse) => {
                        return <ImageItem image={data}
                            onSelect={onSelectHandle}
                            selected={selectItemsObject[data.uri] ? true : false}
                            order={selectItemsObject[data.uri] ? selectItemsObject[data.uri].order : null}

                        />
                    }}

                    layoutProvider={new LayoutProvider(index => {
                        return 'NORMAL'
                    }, (type, dim) => {
                        dim.width = Dimensions.get('window').width / 3;
                        dim.height = Dimensions.get('window').width / 3;
                    })}

                    renderAheadOffset={400}
                />
            }

            {numberSelectedItem > 0 &&
                <StyledButton onPress={() => {
                    props.endingPickImageHandle(Object.keys(selectItemsObject)
                        .map(item => selectItemsObject[item].image))

                    reset()
                }}>
                    <StyledSendText>
                        {`${props.sendButtonTitle ? props.sendButtonTitle : 'Send'}`.toUpperCase()
                            + ` ${numberSelectedItem > 1 ? numberSelectedItem : ''}`}
                    </StyledSendText>

                </StyledButton>}
        </Animated.View>
        // </Animatable.View>

    );
};


export default AnimatedImagePicker;
