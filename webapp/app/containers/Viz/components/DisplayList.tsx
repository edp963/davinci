import React from 'react'
import classnames from 'classnames'
import { createStructuredSelector } from 'reselect'
import { makeSelectProjectRoles } from 'containers/Projects/selectors'
import { connect } from 'react-redux'
import {compose} from 'redux'
import { Col, Tooltip, Icon, Popconfirm, Row } from 'antd'
import { IconProps } from 'antd/lib/icon'
const styles = require('../Viz.less')

import DisplayFormModal from './DisplayFormModal'
import ModulePermission from 'containers/Account/components/checkModulePermission'
import { IProject } from 'containers/Projects/types'
import { IExludeRoles } from 'containers/Viz/components/PortalList'
import { IProjectRoles } from 'containers/Organizations/component/ProjectRole'
import { Display, DisplayFormType } from './types'

export interface IDisplayEvent {
  onDisplayClick: (displayId: number) => () => void
  onAdd: (display: Display, resolve: () => void) => void
  onEdit: (display: Display, resolve: () => void) => void
  onCopy: (display: Display, resolve: () => void) => void
  onDelete: (displayId: number) => void
}

interface IDisplayListProps extends IDisplayEvent {
  projectId: number
  displays: Display[],
  currentProject?: IProject
  projectRoles: IProjectRoles[]
  onCheckName: (type, data, resolve, reject) => void
  onExcludeRoles: (type: string, id: number, resolve?: any) => any
}

interface IDisplayListStates {
  editingDisplay: Display
  modalLoading: boolean
  formType: DisplayFormType
  formVisible: boolean
  exludeRoles: IExludeRoles[]
}

export class DisplayList extends React.PureComponent<IDisplayListProps, IDisplayListStates> {

  constructor (props: IDisplayListProps) {
    super(props)
    this.state = {
      editingDisplay: null,
      modalLoading: false,
      formType: 'add',
      formVisible: false,
      exludeRoles: []
    }
  }

  private stopPPG = (e) => {
    e.stopPropagation()
  }

  public componentWillReceiveProps (nextProps) {
    if (nextProps && nextProps.projectRoles) {
      this.setState({
        exludeRoles: nextProps.projectRoles.map((role) => {
          return {
            ...role,
            permission: false
          }
        })
      })
    }
  }


  private saveDisplay = (display: Display, type: DisplayFormType) => {
    this.setState({ modalLoading: true })
    const { onAdd, onEdit, onCopy } = this.props
    const val = {
      ...display,
      roleIds: this.state.exludeRoles.filter((role) => !role.permission).map((p) => p.id)
    }
    if (typeof display.config === 'string' && display.config) {
      val.config = JSON.parse(display.config)
    }
    switch (type) {
      case 'add':
        onAdd({
          ...val
        }, () => { this.hideDisplayFormModal() })
        break
      case 'edit':
        onEdit({
          ...val
        }, () => { this.hideDisplayFormModal() })
        break
      case 'copy':
        onCopy({
          ...val
        }, () => { this.hideDisplayFormModal() })
        break
    }
  }

  private cancel = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    })
  }

  private showDisplayFormModal = (formType: DisplayFormType, display?: Display) => (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    this.setState({
      editingDisplay: formType === 'copy'
        ? {
          ...display,
          name: `${display.name}_copy`
        }
        : display,
      formType,
      formVisible: true
    })
    const { onExcludeRoles, projectRoles } = this.props
    if (onExcludeRoles && display) {
      onExcludeRoles('display', display.id, (result: number[]) => {
        this.setState({
          exludeRoles:  projectRoles.map((role) => {
            return result.some((re) => re === role.id) ? role : {...role, permission: true}
          })
        })
      })
    } else {
      this.setState({
        exludeRoles: this.state.exludeRoles.map((role) => {
          return {
            ...role,
            permission: true
          }
        })
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

  private changePermission = (scope: IExludeRoles, event) => {
    scope.permission = event.target.checked
    this.setState({
      exludeRoles: this.state.exludeRoles.map((role) => role && role.id === scope.id ? scope : role)
    })
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

  private renderDisplay (display: Display) {
    const coverStyle: React.CSSProperties = {
      backgroundImage: `url(${display.avatar})`
    }
    const { onDisplayClick, onDelete, currentProject } = this.props

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
        onClick={onDisplayClick(display.id)}
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
                <AdminIcon className={styles.copy} type="copy" onClick={this.showDisplayFormModal('copy', display)} />
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
          exludeRoles={this.state.exludeRoles}
          onChangePermission={this.changePermission}
          type={formType}
          onCheckName={onCheckName}
          onSave={this.saveDisplay}
          onCancel={this.cancel}
        />
      </div>
    )
  }
}


const mapStateToProps = createStructuredSelector({
  projectRoles: makeSelectProjectRoles()
})

const withConnect = connect(mapStateToProps, null)


export default compose(
  withConnect
)(DisplayList)
