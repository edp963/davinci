import React from 'react'
import { OrderDirection } from './util'

import { Icon, Tooltip } from 'antd'

const styles = require('../Display.less')

interface ILayerListProps {
  layers: any[]
  layersStatus: object,
  selectedLayers: any[]
  onSelectLayer?: (obj: { id: any, selected: boolean, exclusive: boolean }) => void
  onEditDisplayLayers: (layers: any[]) => void
  onCollapseChange: () => void
}

interface ILayerListStates {
  collapse: boolean
}

export class LayerList extends React.Component <ILayerListProps, ILayerListStates> {

  public static displayName = 'LayerList'

  constructor (props) {
    super(props)
    this.state = {
      collapse: false
    }
  }

  private sortLayers = (layers, orderDirection: OrderDirection): any[] => {
    if (!Array.isArray(layers)) { return [] }

    const sortedLayers = [...layers]
    switch (orderDirection) {
      case OrderDirection.Asc:
        sortedLayers.sort((item1, item2) => (item1.index - item2.index))
        break
      case OrderDirection.Desc:
        sortedLayers.sort((item1, item2) => (item2.index - item1.index))
        break
      default:
        break
    }
    return sortedLayers
  }

  private swapLayerIndex = (orderedSelectedLayers: any[], orderedLayers: any[]) => {
    const updateLayers = []
    orderedSelectedLayers.forEach((layer) => {
      const idx = orderedLayers.findIndex((l) => l.id === layer.id)
      if (idx === 0 || orderedSelectedLayers.findIndex((l) => l.id === orderedLayers[idx - 1].id) >= 0) {
        return
      }

      const tempIndex = orderedLayers[idx].index
      orderedLayers[idx].index = orderedLayers[idx - 1].index
      orderedLayers[idx - 1].index = tempIndex
      const temp = orderedLayers[idx]
      orderedLayers[idx] = orderedLayers[idx - 1]
      orderedLayers[idx - 1] = temp

      const currentLayers = [orderedLayers[idx], orderedLayers[idx - 1]]
      currentLayers.forEach((item) => {
        const exists = updateLayers.findIndex((l) => l.id === item.id)
        if (exists < 0) {
          updateLayers.push({ ...item })
        } else {
          updateLayers.splice(exists, 1, { ...item })
        }
      })
    })

    if (updateLayers.length <= 0) { return }

    this.props.onEditDisplayLayers(updateLayers)
  }

  private bringToUpper = () => {
    const {
      selectedLayers,
      layers } = this.props
    const descSelectedLayers = this.sortLayers(selectedLayers, OrderDirection.Desc)
    const descLayers = this.sortLayers(layers, OrderDirection.Desc)
    this.swapLayerIndex(descSelectedLayers, descLayers)
  }

  private sendToNext = () => {
    const {
      selectedLayers,
      layers
    } = this.props
    const ascSelectedLayers = this.sortLayers(selectedLayers, OrderDirection.Asc)
    const ascLayers = this.sortLayers(layers, OrderDirection.Asc)
    this.swapLayerIndex(ascSelectedLayers, ascLayers)
  }

  private bringToFront = () => {
    const {
      selectedLayers,
      layers,
      onEditDisplayLayers
    } = this.props
    if (selectedLayers.length <= 0) { return }

    const maxLayerIndex = layers.reduce((acc, layer) => Math.max(layer.index, acc), -Infinity)
    const updateLayers = this.sortLayers(selectedLayers, OrderDirection.Asc).map((layer, idx) => ({
      ...layer,
      index: maxLayerIndex + idx + 1
    }))
    onEditDisplayLayers(updateLayers)
  }

  private sendToBottom = () => {
    const {
      selectedLayers,
      layers,
      onEditDisplayLayers
    } = this.props
    if (selectedLayers.length <= 0) { return }

    const minLayerIndex = layers.reduce((acc, layer) => Math.min(layer.index, acc), Infinity)
    const updateLayers = this.sortLayers(selectedLayers, OrderDirection.Desc).map((layer, idx) => ({
      ...layer,
      index: minLayerIndex - idx - 1
    }))
    onEditDisplayLayers(updateLayers)
  }

  private commands = [{
    title: '上移一层',
    icon: 'icon-bring-upper',
    handler: this.bringToUpper
  }, {
    title: '下移一层',
    icon: 'icon-send-next',
    handler: this.sendToNext
  }, {
    title: '置顶',
    icon: 'icon-bring-front',
    handler: this.bringToFront
  }, {
    title: '置底',
    icon: 'icon-send-bottom',
    handler: this.sendToBottom
  }]

  private changeLayerStatus = (layerId) => (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    const { altKey, metaKey } = e
    const { layersStatus, onSelectLayer } = this.props
    const exclusive = !altKey && !metaKey
    onSelectLayer({ id: layerId, selected: !layersStatus[layerId].selected, exclusive})
  }

  private getLayersByIndexDesc = (layers: any[]) => {
    if (!Array.isArray(layers)) { return [] }

    return [...layers].sort((item1, item2) => (item2.index - item1.index))
  }

  private toggleCollapse = () => {
    const { onCollapseChange } = this.props
    const { collapse } = this.state
    this.setState({ collapse: !collapse }, () => {
      onCollapseChange()
    })
  }

  public render () {
    const {
      layers,
      layersStatus
    } = this.props
    const { collapse } = this.state

    if (collapse) {
      return (
        <div className={styles.collapse}>
          <h2 className={styles.formTitle}>
            <Tooltip title="显示/隐藏图层">
              <Icon onClick={this.toggleCollapse} type="left-square-o" />
            </Tooltip>
          </h2>
          <div className={styles.title}>
            <label>图层</label>
          </div>
        </div>
      )
    }

    const cmds = this.commands.map((cmd, idx) => (
      <li key={idx} onClick={cmd.handler}>
        <Tooltip placement="bottom" title={cmd.title}>
          <i className={`iconfont ${cmd.icon}`}/>
        </Tooltip>
      </li>))

    const layerItems = this.getLayersByIndexDesc(layers)
      .map((layer) => (
        <li key={layer.id}>
          <i
            onClick={this.changeLayerStatus(layer.id)}
            className={`iconfont ${layersStatus[layer.id].selected ? 'icon-selected' : 'icon-unselected'}`}
          />
          <span title={layer.name}>{layer.name}</span>
        </li>
      ))
    return (
      <div className={styles.left}>
        <h2 className={styles.formTitle}>
          <span>图层</span>
          <Tooltip title="显示/隐藏图层">
            <Icon onClick={this.toggleCollapse} type="right-square-o" />
          </Tooltip>
        </h2>
        <div className={styles.commands}>
          <ul className={styles.commandGroup}>{cmds}</ul>
        </div>
        <div className={styles.layerList}>
          <ul>{layerItems}</ul>
        </div>
      </div>
    )
  }
}


export default LayerList
