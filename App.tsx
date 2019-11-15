import React , {useState} from 'react'
import { Button } from 'react-native'
import PhotoPickerModal from './src/PhotoPicker/PhotoPickerModal'



const App = () => {

  const [visible , setVisible ] = useState(false)
  return (
    <React.Fragment>
      <Button title={"Pick Image"} onPress={() => { setVisible(true) }}>

      </Button>
      <PhotoPickerModal
        isVisible = {visible}
        onCancelHandle = {()=> {
          setVisible(false)
        }}
        endingPickImageHandle = {(results)=>{
          console.log('check results', results)
          setVisible(false)
        }}
      />
    </React.Fragment>



  )
}

export default App