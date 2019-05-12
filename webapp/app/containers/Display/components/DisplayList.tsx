import React from 'react'
import classnames from 'classnames'

import { Col, Tooltip, Icon, Popconfirm, Row } from 'antd'
import { IconProps } from 'antd/lib/icon'
const styles = require('../Display.less')

import DisplayFormModal from './DisplayFormModal'
import ModulePermission from '../../Account/components/checkModulePermission'
import { IProject } from '../../Projects'

export interface IDisplay {
  id: number
  name: string
  projectId: number
  publish: boolean
  avatar: string
  description: string
}

export interface IDisplayEvent {
  onDisplayClick: (display: IDisplay) => () => void
  onAdd: (display: IDisplay, resolve: () => void) => void
  onEdit: (display: IDisplay, resolve: () => void) => void
  onCopy: (display: IDisplay) => void
  onDelete: (displayId: number) => void
}

interface IDisplayListProps extends IDisplayEvent {
  projectId: number
  displays: IDisplay[],
  currentProject?: IProject
  onCheckName: (type, data, resolve, reject) => void
  onExcludeRoles: (type: string, id: number, resolve?: any) => any
}

interface IDisplayListStates {
  editingDisplay: IDisplay
  modalLoading: boolean
  formType: 'edit' | 'add'
  formVisible: boolean
}

export class DisplayList extends React.PureComponent<IDisplayListProps, IDisplayListStates> {

  constructor (props: IDisplayListProps) {
    super(props)
    this.state = {
      editingDisplay: null,
      modalLoading: false,
      formType: 'add',
      formVisible: false
    }
  }

  private stopPPG = (e) => {
    e.stopPropagation()
  }

  private saveDisplay = (display: IDisplay, type: 'edit' | 'add') => {
    this.setState({ modalLoading: true })
    const { onAdd, onEdit } = this.props
    if (type === 'add') {
      onAdd({
        ...display
      }, () => { this.hideDisplayFormModal() })
    } else {
      onEdit({
        ...display
      }, () => { this.hideDisplayFormModal() })
    }
  }

  private cancel = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    })
  }

  private showDisplayFormModal = (formType: 'edit' | 'add', display?: IDisplay) => (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    this.setState({
      editingDisplay: display,
      formType,
      formVisible: true
    })
    const { onExcludeRoles } = this.props
    if (onExcludeRoles && display) {
      onExcludeRoles('display', display.id, (result) => {
        console.log(result)
      })
    }
  }

  private hideDisplayFormModal = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    })
  }

  private delegate = (func: (...args) => void, ...args) => (e: React.MouseEvent<any>) => {
    func.apply(this, args)
    e.stopPropagation()
  }

  private renderCreate () {
    return (
      <Col
        xxl={4}
        xl={6}
        lg={8}
        md={12}
        sm={24}
        key="createDisplay"
      >
        <div className={styles.display}>
          <div className={styles.container} onClick={this.showDisplayFormModal('add')}>
            <div className={styles.central}>
              <div className={`${styles.item} ${styles.icon}`}><Icon type="plus-circle-o" /></div>
              <div className={`${styles.item} ${styles.text}`}>创建新 Display</div>
            </div>
          </div>
        </div>
      </Col>
    )
  }

  private renderDisplay (display: IDisplay) {
    const coverStyle: React.CSSProperties = {
      backgroundImage: `url(${display.avatar})`
    }
    const { onDisplayClick, onCopy, onDelete, currentProject } = this.props

    const editHint = !display.publish && '(编辑中…)'
    const displayClass = classnames({
      [styles.display]: true,
      [styles.editing]: !display.publish
    })

    const EditIcon = ModulePermission<IconProps>(currentProject, 'viz', false)(Icon)
    const AdminIcon = ModulePermission<IconProps>(currentProject, 'viz', true)(Icon)

    return (
      <Col
        xxl={4}
        xl={6}
        lg={8}
        md={12}
        sm={24}
        key={display.id}
        onClick={onDisplayClick(display)}
      >
        <div className={displayClass} style={coverStyle}>
          <div className={styles.container}>
            <header>
              <h3 className={styles.title}>{display.name} {editHint}</h3>
              <p className={styles.content}>{display.description}</p>
            </header>
            <div className={styles.displayActions}>
              <Tooltip title="编辑">
                <EditIcon className={styles.edit} type="setting" onClick={this.showDisplayFormModal('edit', display)} />
              </Tooltip>
              <Tooltip title="复制">
                <AdminIcon className={styles.copy} type="copy" onClick={this.delegate(onCopy, display)} />
              </Tooltip>
              <Popconfirm
                title="确定删除？"
                placement="bottom"
                onConfirm={this.delegate(onDelete, display.id)}
              >
                <Tooltip title="删除">
                  <AdminIcon className={styles.delete} type="delete" onClick={this.stopPPG} />
                </Tooltip>
              </Popconfirm>
            </div>
          </div>
        </div>
      </Col>
    )
  }

  public render () {
    const { displays, projectId, currentProject, onCheckName } = this.props
    if (!Array.isArray(displays)) { return null }

    const { editingDisplay, formType, formVisible, modalLoading } = this.state

    let addAction
    if (currentProject && currentProject.permission) {
      const vizPermission = currentProject.permission.vizPermission
      addAction = vizPermission === 3
        ? [this.renderCreate(), ...displays.map((d) => this.renderDisplay(d))]
        : [...displays.map((d) => this.renderDisplay(d))]
    }

    return (
      <div>
        {/* <EllipsisList rows={2}>
          {addAction}
        </EllipsisList> */}
        <Row
          gutter={20}
        >
          {addAction}
        </Row>
        <DisplayFormModal
          projectId={projectId}
          display={editingDisplay}
          visible={formVisible}
          loading={modalLoading}
          type={formType}
          onCheckName={onCheckName}
          onSave={this.saveDisplay}
          onCancel={this.cancel}
        />
      </div>
    )
  }
}

export default DisplayList
