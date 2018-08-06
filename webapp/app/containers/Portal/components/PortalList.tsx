import * as React from 'react'
import * as classnames from 'classnames'
import { WrappedFormUtils } from 'antd/lib/form/Form'

const Icon = require('antd/lib/icon')
const Col = require('antd/lib/col')
const Button = require('antd/lib/button')
const Tooltip = require('antd/lib/tooltip')
const Popconfirm = require('antd/lib/popconfirm')
const Modal = require('antd/lib/modal')

const styles = require('../Portal.less')

import EllipsisList from '../../../components/EllipsisList'
import PortalForm from './PortalForm'

interface IPortalListProps {
  projectId: number
  portals: any[]
  onPortalClick: (portal: any) => void
  onDelete: (portalId: number) => void
}

interface IPortalListStates {
  modalLoading: boolean
  formType: 'edit' | 'add'
  formVisible: boolean
}

export class PortalList extends React.Component<IPortalListProps, IPortalListStates> {

  private portalForm: WrappedFormUtils

  private stopPPG = (e) => {
    e.stopPropagation()
  }

  private delegate = (func: (...args) => void, ...args) => (e: MouseEvent) => {
    func.apply(this, args)
    e.stopPropagation()
  }

  private showPortalForm = (formType: 'edit' | 'add', portal?: any) => {
    this.setState({
      formType,
      formVisible: true
    }, () => {
      if (portal) {
        this.portalForm.setFieldsValue(portal)
      }
    })
  }

  private renderPortal = (portal: any) => {
    const { onPortalClick, onDelete } = this.props

    const editHint = !portal.publish && '(编辑中…)'
    const itemClass = classnames({
      [styles.unit]: true,
      [styles.editing]: !portal.publish
    })

    return (
      <Col
        key={portal.id}
        xl={4}
        lg={6}
        md={8}
        sm={12}
        xs={24}
        onClick={onPortalClick(portal)}
      >
        <div
          className={itemClass}
          style={{ backgroundImage: `url(${require(`../../../assets/images/bg${portal.avatar}.png`)}` }}
        >
          <header>
            <h3 className={styles.title}>
              {portal.name} {editHint}
            </h3>
            <p className={styles.content}>
              {portal.description}
            </p>
          </header>
          <Tooltip title="编辑">
            <Icon className={styles.edit} type="setting" onClick={this.delegate(this.showPortalForm, 'edit', portal)} />
          </Tooltip>
          <Popconfirm
            title="确定删除？"
            placement="bottom"
            onConfirm={this.delegate(onDelete, portal.id)}
          >
            <Tooltip title="删除">
              <Icon className={styles.delete} type="delete" onClick={this.stopPPG} />
            </Tooltip>
          </Popconfirm>
        </div>
      </Col>
    )
  }

  public render () {
    const { portals } = this.props
    if (!Array.isArray(portals)) { return null }

    return (
      <div>
        <EllipsisList rows={2}>
          {portals.map((d) => this.renderPortal(d))}
        </EllipsisList>
      </div>
    )
  }
}

export default PortalList
