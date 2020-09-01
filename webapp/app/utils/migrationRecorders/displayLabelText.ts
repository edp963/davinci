import { ILayerParams } from 'app/containers/Display/components/types'
import { IMigrationRecorder } from '.'
import { buildLabelText } from 'app/containers/Display/components/Layer/RichText/util'
import { useRecorderLabelStyle } from 'app/containers/Display/components/Layer/RichText/hooks'

const displayLabelText: IMigrationRecorder<ILayerParams> = {
  versions: ['beta6'],
  recorder: {
    beta6(layerParams) {
      const { richText } = layerParams as ILayerParams
      const { innerStyles, wrapStyles } = useRecorderLabelStyle(layerParams)
      if(!richText){
        const newText = buildLabelText(innerStyles, Reflect.get(layerParams,'contentText'), wrapStyles)
        const success = Reflect.set(layerParams, 'richText', newText)
        if(success){
          Reflect.deleteProperty(layerParams, 'contentText')
        }
      }
      return layerParams
    }
  }
}

export default displayLabelText
