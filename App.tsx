import React , {useState} from 'react'
import { Button } from 'react-native'
import PhotoPickerModal from './src/PhotoPicker/PhotoPickerModal'
import AnimatedImagePicker from './src/PhotoPicker/AnimatedImagePicker'
import styled from 'styled-components/native'


const StyledWrapper = styled.View`
  width: 100%;
  height: 100%;
  justify-content: flex-end;
`

const StyledView = styled.View`
  height: 400px;
  width: 100%;
  justify-content: flex-end;
`
const App = () => {

  const [visible , setVisible ] = useState(false)

  const [modalVisible , setModalVisible ] = useState(false)
  return (
    <StyledWrapper>


      <StyledView>
        <Button title = {"Pick Image Modal"} onPress = {()=> {
          setModalVisible(!modalVisible)
        }}></Button>

        <Button title = {"Pick Image"} onPress = {()=> {
          setVisible(!visible)
        }}></Button>
      </StyledView>
      <AnimatedImagePicker
        // backgroundColor="red"
        // buttonColor= "yellow"
        // textColor = "green"

        isVisible = {visible}
        onCancelHandle = {()=> {
          setVisible(false)
        }}
        endingPickImageHandle = {(results)=>{
          console.log('check')
        }}
      />

      <PhotoPickerModal
        backgroundColor="red"
        buttonColor= "yellow"
        textColor = "green"

        isVisible = {modalVisible}
        onCancelHandle = {()=> {
          setVisible(false)
        }}
        endingPickImageHandle = {(results)=>{
          console.log('check')
        }}
      
      />
    </StyledWrapper>



  )
}

export default App