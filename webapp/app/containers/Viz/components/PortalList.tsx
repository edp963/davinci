import React from 'react'
import classnames from 'classnames'
import { createStructuredSelector } from 'reselect'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Icon, Col, Button, Tooltip, Popconfirm, Modal, Row } from 'antd'
import { IconProps } from 'antd/lib/icon'
import AntdFormType from 'antd/lib/form/Form'
const styles = require('../Viz.less')

import PortalForm from './PortalForm'
import ModulePermission from 'containers/Account/components/checkModulePermission'
import { IProject } from 'containers/Projects/types'
import { IPortal } from 'containers/Viz/types'
import { makeSelectProjectRoles } from 'containers/Projects/selectors'
import {IProjectRoles} from 'containers/Organizations/component/ProjectRole'

interface IPortalListProps {
  projectId: number
  portals: IPortal[]
  projectRoles: IProjectRoles[]
  currentProject: IProject
  onPortalClick: (portalId: number) => () => void
  onAdd: (portal, resolve) => void
  onEdit: (portal, resolve) => void
  onDelete: (portalId: number) => void
  onExcludeRoles: (type: string, id: number, resolve?: any) => any
  onCheckUniqueName: (pathname: string, data: any, resolve: () => any, reject: (error: string) => any) => any
}

export interface IExludeRoles extends IProjectRoles {
  permission?: boolean
}

interface IPortalListStates {
  modalLoading: boolean
  formType: 'edit' | 'add'
  formVisible: boolean
  exludeRoles: IExludeRoles[]
}

export class PortalList extends React.Component<IPortalListProps, IPortalListStates> {

  private portalForm: AntdFormType
  private refHandlers = {
    portalForm: (ref) => this.portalForm = ref
  }

  constructor (props: IPortalListProps) {
    super(props)
    this.state = {
      modalLoading: false,
      formType: 'add',
      formVisible: false,
      exludeRoles: []
    }
  }

  private stopPPG = (e) => {
    e.stopPropagation()
  }

  private delegate = (func: (...args) => void, ...args) => (e: React.MouseEvent) => {
    func.apply(this, args)
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

  private hidePortalForm = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    }, () => {
      this.portalForm.props.form.resetFields()
    })
  }

  private onModalOk = () => {
    this.portalForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {  projectId, onAdd, onEdit } = this.props
        const { formType } = this.state
        const { id, name, description, publish, avatar } = values
        const val = {
          description,
          name,
          publish,
          roleIds: this.state.exludeRoles.filter((role) => !role.permission).map((p) => p.id),
          avatar: formType === 'add' ? `${Math.ceil(Math.random() * 19)}` : avatar
        }

        if (formType === 'add') {
          onAdd({
            ...val,
            projectId: Number(projectId)
          }, () => {
            this.hidePortalForm()
          })
        } else {
          onEdit({
            ...val,
            id
          }, () => {
            this.hidePortalForm()
          })
        }
      }
    })
  }

  private showPortalForm = (formType: 'edit' | 'add', portal?: any) => (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    this.setState({
      formType,
      formVisible: true
    }, () => {
      setTimeout(() => {
        if (portal) {
          this.portalForm.props.form.setFieldsValue(portal)
        }
      }, 0)
      const { onExcludeRoles, projectRoles } = this.props
      if (onExcludeRoles && portal) {
        onExcludeRoles('portal', portal.id, (result: number[]) => {
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
    })
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
        key="createPortal"
        xxl={4}
        xl={6}
        lg={8}
        md={12}
        sm={24}
      >
        <div className={styles.unit} onClick={this.showPortalForm('add')}>
            <div className={styles.central}>
              <div className={`${styles.item} ${styles.add}`}><Icon type="plus-circle-o" /></div>
              <div className={`${styles.item} ${styles.text}`}>创建新 Dashboard</div>
            </div>
        </div>
      </Col>
    )
  }

  private renderPortal = (portal: any) => {
    const { onPortalClick, onDelete, currentProject } = this.props

    const editHint = !portal.publish && '(编辑中…)'
    const itemClass = classnames({
      [styles.unit]: true,
      [styles.editing]: !portal.publish
    })

    const EditIcon = ModulePermission<IconProps>(currentProject, 'viz', false)(Icon)
    const AdminIcon = ModulePermission<IconProps>(currentProject, 'viz', true)(Icon)
    return (
      <Col
        key={portal.id}
        xxl={4}
        xl={6}
        lg={8}
        md={12}
        sm={24}
        onClick={onPortalClick(portal.id)}
      >
        <div
          className={itemClass}
          style={{ backgroundImage: `url(${require(`assets/images/bg${portal.avatar}.png`)}` }}
        >
          <header>
            <h3 className={styles.title}>
              {portal.name} {editHint}
            </h3>
            <p className={styles.content}>
              {portal.description}
            </p>
          </header>
          <div className={styles.portalActions}>
            <Tooltip title="编辑">
              <EditIcon className={styles.edit} type="setting" onClick={this.showPortalForm('edit', portal)} />
            </Tooltip>
            <Popconfirm
              title="确定删除？"
              placement="bottom"
              onConfirm={this.delegate(onDelete, portal.id)}
            >
              <Tooltip title="删除">
                <AdminIcon className={styles.delete} type="delete" onClick={this.stopPPG} />
              </Tooltip>
            </Popconfirm>
          </div>
        </div>
      </Col>
    )
  }

  public render () {
    const {
      projectId,
      portals,
      currentProject,
      onCheckUniqueName
    } = this.props
    if (!Array.isArray(portals)) { return null }

    const {
      formType,
      formVisible,
      modalLoading
    } = this.state

    const modalButtons = [(
      <Button
        key="back"
        size="large"
        onClick={this.hidePortalForm}
      >
        取 消
      </Button>
    ), (
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={modalLoading}
        disabled={modalLoading}
        onClick={this.onModalOk}
      >
        保 存
      </Button>
    )]

    let addAction
    if (currentProject && currentProject.permission) {
      const vizPermission = currentProject.permission.vizPermission
      addAction = vizPermission === 3
        ? [this.renderCreate(), ...portals.map((p) => this.renderPortal(p))]
        : [...portals.map((p) => this.renderPortal(p))]
    }

    return (
      <div>
        <Row
          gutter={20}
        >
          {addAction}
        </Row>
        <Modal
          title={`${formType === 'add' ? '新增' : '修改'} Portal`}
          wrapClassName="ant-modal-small"
          visible={formVisible}
          footer={modalButtons}
          onCancel={this.hidePortalForm}
        >
          <PortalForm
            type={formType}
            onCheckUniqueName={onCheckUniqueName}
            projectId={projectId}
            exludeRoles={this.state.exludeRoles}
            onChangePermission={this.changePermission}
            wrappedComponentRef={this.refHandlers.portalForm}
          />
        </Modal>
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
)(PortalList)

