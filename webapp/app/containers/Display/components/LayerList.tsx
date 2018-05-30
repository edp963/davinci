import * as React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { makeSelectLayers, makeSelectLayerStatus } from '../selectors'
import {
  updateLayerStatus,
  deleteLayers
} from '../actions'

const Icon = require('antd/lib/icon')
const Tooltip = require('antd/lib/tooltip')
const Popconfirm = require('antd/lib/popconfirm')
const Checkbox = require('antd/lib/checkbox')
const CheckboxGroup = Checkbox.Group

const styles = require('../Display.less')

interface ILayerListProps {
  layers: any[]
  layerStatus: object,
  onUpdateLayerStatus?: (obj: { id: any, selected: boolean }) => void,
  onDeleteLayers?: (ids: any[]) => void
}

export class LayerList extends React.Component <ILayerListProps, {}> {
  constructor (props) {
    super(props)
  }

  private deleteLayers = () => {
    const { layerStatus, onDeleteLayers } = this.props
    const ids = Object.keys(layerStatus).filter((id) => layerStatus[id])
    onDeleteLayers(ids)
  }

  private commands = [{
    title: '上移一层',
    icon: 'icon-bring-upper'
  }, {
    title: '下移一层',
    icon: 'icon-send-next'
  }, {
    title: '置顶',
    icon: 'icon-bring-front'
  }, {
    title: '置底',
    icon: 'icon-send-bottom'
  }]

  private changeLayerStatus = (layerId) => () => {
    const { layerStatus, onUpdateLayerStatus } = this.props
    onUpdateLayerStatus({ id: layerId, selected: !layerStatus[layerId]})
  }

  public render () {
    const {
      layers,
      layerStatus
    } = this.props

    const header = <div>图层</div>
    const  cmds = this.commands.map((cmd, idx) => (
      <li key={idx}><Tooltip placement="bottom" title={cmd.title}><i className={`iconfont ${cmd.icon}`}/></Tooltip></li>))

    const layerItems = layers.map((layer) => (
      <li key={layer.id}>
        <i onClick={this.changeLayerStatus(layer.id)} className={`iconfont ${layerStatus[layer.id] ? 'icon-selected' : 'icon-unselected'}`}/>
        <span>{layer.name}</span>
      </li>
    ))
    const footer = (
      <div className={styles.footer}>
        <Popconfirm
            title="确定删除？"
            placement="bottom"
            onConfirm={this.deleteLayers}
        >
          <Tooltip title="删除" placement="right">
            <Icon className={styles.delete} type="delete" />
          </Tooltip>
        </Popconfirm>
      </div>)
    return (
      <div className={`${styles.sidebar} ${styles.left}`}>
        <h2 className={styles.formTitle}>图层</h2>
        <div className={styles.commands}>
          <ul className={styles.commandGroup}>{cmds}</ul>
        </div>
        <div className={styles.layerList}>
          <ul>{layerItems}</ul>
        </div>
        {footer}
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  layers: makeSelectLayers(),
  layerStatus: makeSelectLayerStatus()
})

function mapDispatchToProps (dispatch) {
  return {
    onUpdateLayerStatus: ({ id, selected }) => dispatch(updateLayerStatus({ id, selected })),
    onDeleteLayers: (ids) => dispatch(deleteLayers(ids))
  }
}

export default connect<{}, {}, ILayerListProps>(mapStateToProps, mapDispatchToProps)(LayerList)
