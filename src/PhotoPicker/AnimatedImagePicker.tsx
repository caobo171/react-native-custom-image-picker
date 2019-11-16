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
    PanResponder,
    SafeAreaView
} from 'react-native';

import { RecyclerListView, LayoutProvider, DataProvider } from "recyclerlistview";
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


const AnimatedImagePicker = (props: PhotoPickerModalProps) => {

    const [images, setImages] = useState<ImagePickerResponse[]>([])

    const [mode, setMode] = useState<'small' | 'big'>('small')
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

    let panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (evt, getstureState) => true,
        onPanResponderMove: (evt, gestureState) => {
            position.setValue(gestureState.dy)

        },

        onPanResponderRelease: (evt, gestureState) => {
            if (-gestureState.dy > 120 && mode === 'small') {
                Animated.timing(position, {
                    toValue: -height / 2
                    , duration: 200
                }).start(() => {
                    setMode('big')
                })
            } else if (gestureState.dy > 120 && mode === 'big') {
                Animated.timing(position, {
                    toValue: height / 2
                    , duration: 200
                }).start(() => {
                    setMode('small')
                })
            } else {
                Animated.timing(position, {
                    toValue: 0
                    , duration: 200
                }).start()
            }
        }
    })

    let position = new Animated.Value(1)


    let heightView: any = 250;
    let headerOpacity: any = 0;
    let headerHeight: any = 40;
    if (mode === 'small') {
        heightView = position.interpolate({
            inputRange: [-height / 2, 0],
            outputRange: [height, 250]
        })


        headerOpacity = position.interpolate({
            inputRange: [-height / 2, 0],
            outputRange: [1, 0]
        })

        headerHeight = position.interpolate({
            inputRange: [-height / 2, 0],
            outputRange: [40, 15]
        })
    } else {
        heightView = position.interpolate({
            inputRange: [0, height / 2],
            outputRange: [height, 250]
        })


        headerOpacity = position.interpolate({
            inputRange: [0, height / 2],
            outputRange: [1, 0]
        })

        headerHeight = position.interpolate({
            inputRange: [0, height / 2],
            outputRange: [40, 15]
        })
    }


    const decreaseHeightView = () => {
        Animated.timing(position, {
            toValue: height / 2
            , duration: 300
        }).start(() => {
            setMode('small')
        })
    }



    return (
        <SafeAreaView>
            <Animated.View
                style={{
                    margin: 0,
                    padding: 0,
                    width: '100%',
                    height: heightView
                }}
            >
                {/**  Header Begin */}
                <Animated.View
                    style={[{
                        width: '100%',
                        backgroundColor: '#FFFFFF',
                        height: headerHeight,
                    }]}

                    {...panResponder.panHandlers}
                >
                    <Animated.View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            opacity: headerOpacity
                        }}
                    >
                        <TouchableOpacity onPress={() => {
                            props.onCancelHandle()
                            decreaseHeightView()
                        }
                        }>
                            <StyledIconImage
                                source={require('../assets/IconImages/icon_close.png')}
                            />
                        </TouchableOpacity>

                        <StyledDescription>{'Photos'} </StyledDescription>
                    </Animated.View>
                </Animated.View>

                {/**  Header End */}

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
        </SafeAreaView>

        // </Animatable.View>

    );
};


export default AnimatedImagePicker;
