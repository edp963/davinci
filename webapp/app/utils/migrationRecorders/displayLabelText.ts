import { ILayerParams, IRichTextConfig } from 'app/containers/Display/components/types'
import { IMigrationRecorder } from '.'
import { buildLabelText } from 'app/containers/Display/components/Layer/RichText/util'

const displayLabelText: IMigrationRecorder<ILayerParams> = {
  versions: ['beta6'],
  recorder: {
    beta6(layerParams) {
      const { richText } = layerParams as ILayerParams
      if(!richText){
        const oldText: string = Reflect.get(layerParams,'contentText')
        const newText = buildLabelText( { fontSize: 40 },  oldText)
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
