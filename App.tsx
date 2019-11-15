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

`
const App = () => {

  const [visible , setVisible ] = useState(false)
  return (
    <StyledWrapper>

      <StyledView>

      </StyledView>
      <AnimatedImagePicker
        isVisible = {visible}
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