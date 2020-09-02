import { IMigrationRecorder } from '.'
import { ILayerParams } from 'app/containers/Display/components/types'
import { buildLabelRichTextConetntChildren, buildLabelRichTextContent } from 'app/containers/Display/components/Layer/RichText/util'
import { buildLabelRichTextStyles } from 'app/containers/Display/components/Layer/RichText/util'

const displayLabelText: IMigrationRecorder<ILayerParams> = {
  versions: ['beta6'],
  recorder: {
    beta6(layerParams) {
      const { innerStyles, wrapStyles } = buildLabelRichTextStyles(layerParams)
      if(!layerParams.richText){
        layerParams.richText = buildLabelRichTextContent()
        layerParams.richText.content = buildLabelRichTextConetntChildren(innerStyles, Reflect.get(layerParams,'contentText'), wrapStyles)
        Reflect.deleteProperty(layerParams, 'contentText')
      }
      return layerParams
    }
  }
}

export default displayLabelText
