import { IMigrationRecorder } from '.'
import { ILayerParams } from 'app/containers/Display/components/types'
import { buildLabelRichTextContentChildren, buildLabelRichTextContent } from 'app/containers/Display/components/Layer/RichText/util'
import { buildLabelRichTextStyles } from 'app/containers/Display/components/Layer/RichText/util'

const displayLabelText: IMigrationRecorder<ILayerParams> = {
  versions: ['beta6'],
  recorder: {
    beta6(layerParams) {
      const { fontStyles, textStyles } = buildLabelRichTextStyles(layerParams)
      if(!layerParams.richText){
        const content = buildLabelRichTextContentChildren(fontStyles, Reflect.get(layerParams,'contentText'), textStyles)
        layerParams.richText = buildLabelRichTextContent(content)
        Reflect.deleteProperty(layerParams, 'contentText')
      }
      return layerParams
    }
  }
}

export default displayLabelText
