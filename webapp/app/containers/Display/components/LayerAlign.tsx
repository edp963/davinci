import * as React from 'react'

import { Icon, Tooltip } from 'antd'
const styles = require('../Display.less')

export enum AlignTypes {
  Left,
  HorizontalCenter,
  VerticalCenter,
  Right,
  Top,
  Bottom
}

interface ILayerAlignProps {
  layers: any[],
  onEditDisplayLayers: (layers: any[]) => void
  onCollapseChange: () => void
}

interface ILayerAlignStates {
  collapse: boolean
}

export class LayerAlign extends React.Component<ILayerAlignProps, ILayerAlignStates> {

  constructor (props: ILayerAlignProps) {
    super(props)
    this.state = {
      collapse: false
    }
  }

  private getLayersRect = (layers) => {
    return layers.map((layer) => {
      const { id, params } = layer
      const { positionX, positionY, width, height } = JSON.parse(params)
      return {
        id,
        positionX,
        positionY,
        width,
        height
      }
    })
  }

  private setAlign = (alignType: AlignTypes) => () => {
    const { layers } = this.props
    const layersRect = this.getLayersRect(layers)
    const minPosX = layersRect.reduce((minPosX, pos) => Math.min(minPosX, pos.positionX), Infinity)
    const minPosY = layersRect.reduce((minPosY, pos) => Math.min(minPosY, pos.positionY), Infinity)
    const rightRect = layersRect.reduce((rightRect, rect) => (
      rightRect.positionX + rightRect.width > rect.positionX + rect.width ?
        rightRect : rect
    ), layers[0])
    const bottomRect = layersRect.reduce((bottomRect, rect) => (
      bottomRect.positionY + bottomRect.height > rect.positionY + rect.height ?
        bottomRect : rect
    ), layers[0])

    switch (alignType) {
      case AlignTypes.Top:
        this.spreadPositions((layerParams) => (
          {
            positionX: layerParams.positionX,
            positionY: minPosY
          }
        ))
        break
      case AlignTypes.Left:
        this.spreadPositions((layerParams) => (
          {
            positionX: minPosX,
            positionY: layerParams.positionY
          }
        ))
        break

      case AlignTypes.Bottom:
        const { positionY, height } = bottomRect
        this.spreadPositions((layerParams) => (
          {
            positionX: layerParams.positionX,
            positionY: (positionY + height - layerParams.height)
          }
        ))
        break
      case AlignTypes.Right:
        const { positionX, width } = rightRect
        this.spreadPositions((layerParams) => (
          {
            positionX: (positionX + width - layerParams.width),
            positionY: layerParams.positionY
          }
        ))
        break

      case AlignTypes.HorizontalCenter:
        const midPosX = (minPosX + rightRect.positionX + rightRect.width) / 2
        this.spreadPositions((layerParams) => ({
          positionX: (midPosX - layerParams.width / 2),
          positionY: layerParams.positionY
        }))
        break
      case AlignTypes.VerticalCenter:
        const midPosY = (minPosY + bottomRect.positionY + bottomRect.height) / 2
        this.spreadPositions((layerParams) => ({
          positionX: layerParams.positionX,
          positionY: (midPosY - layerParams.height / 2)
        }))
        break
    }
  }

  private spreadPositions = (posHandler: (layerParams) => ({ positionX: number, positionY: number })) => {
    const { layers, onEditDisplayLayers } = this.props
    const newLayers = layers.map((layer) => {
      const layerParams = JSON.parse(layer.params)
      return {
        ...layer,
        params: JSON.stringify({
          ...layerParams,
          ...posHandler(layerParams)
        })
      }
    })
    onEditDisplayLayers(newLayers)
  }

  private toggleCollapse = () => {
    const { onCollapseChange } = this.props
    const { collapse } = this.state
    this.setState({ collapse: !collapse }, () => {
      onCollapseChange()
    })
  }

  public render () {
    const { collapse } = this.state
    if (collapse) {
      return (
        <div className={styles.collapse}>
          <h2 className={styles.formTitle}>
            <Tooltip title="显示/隐藏设置">
              <Icon onClick={this.toggleCollapse} type="left-square-o" />
            </Tooltip>
          </h2>
          <div className={styles.title}>
            <label>图层对齐</label>
          </div>
        </div>
      )
    }

    return (
      <div className={styles.right}>
        <h2 className={styles.formTitle}>
          <span>图层对齐</span>
          <Tooltip title="显示/隐藏设置">
            <Icon onClick={this.toggleCollapse} type="right-square-o" />
          </Tooltip>
        </h2>
        <div className={styles.alignList}>
          <div className={styles.category}>
            <Tooltip placement="bottom" title="上对齐">
              <i onClick={this.setAlign(AlignTypes.Top)} className="iconfont icon-align-top"/>
            </Tooltip>
          </div>
          <div className={styles.category}>
            <Tooltip placement="bottom" title="左对齐">
              <i onClick={this.setAlign(AlignTypes.Left)} className="iconfont icon-align-left"/>
            </Tooltip>
            <Tooltip placement="bottom" title="水平居中">
              <i onClick={this.setAlign(AlignTypes.HorizontalCenter)} className="iconfont icon-horizontal-center"/>
            </Tooltip>
            <Tooltip placement="bottom" title="垂直居中">
              <i onClick={this.setAlign(AlignTypes.VerticalCenter)} className="iconfont icon-vertical-center"/>
            </Tooltip>
            <Tooltip placement="bottom" title="右对齐">
              <i onClick={this.setAlign(AlignTypes.Right)} className="iconfont icon-align-right"/>
            </Tooltip>
          </div>
          <div className={styles.category}>
            <Tooltip placement="bottom" title="下对齐">
              <i onClick={this.setAlign(AlignTypes.Bottom)} className="iconfont icon-align-bottom"/>
            </Tooltip>
          </div>
        </div>
      </div>
    )
  }
}

export default LayerAlign
