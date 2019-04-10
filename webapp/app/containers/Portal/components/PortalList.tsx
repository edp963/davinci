import React from 'react'
import classnames from 'classnames'

import { Icon, Col, Button, Tooltip, Popconfirm, Modal, Row } from 'antd'
import { IconProps } from 'antd/lib/icon'
import AntdFormType from 'antd/lib/form/Form'
const styles = require('../Portal.less')

import PortalForm from './PortalForm'
import ModulePermission from '../../Account/components/checkModulePermission'
import { IProject } from '../../Projects'
import { IPortal } from '../../Portal'
import { toListBF } from '../../Bizlogic/components/viewUtil'

interface IPortalListProps {
  projectId: number
  portals: IPortal[]
  currentProject: IProject
  viewTeam: any[]
  selectTeams: any[]
  onPortalClick: (portal: any) => () => void
  onAdd: (portal, resolve) => void
  onEdit: (portal, resolve) => void
  onDelete: (portalId: number) => void
  onCheckUniqueName: (pathname: string, data: any, resolve: () => any, reject: (error: string) => any) => any
  onLoadViewTeam: (projectId: number, resolve?: any) => any
  onLoadSelectTeams: (type: string, projectId: number, resolve?: any) => any
}

interface IPortalListStates {
  modalLoading: boolean
  formType: 'edit' | 'add'
  formVisible: boolean
  checkedKeys: any[]
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
      checkedKeys: []
    }
  }

  private stopPPG = (e) => {
    e.stopPropagation()
  }

  private delegate = (func: (...args) => void, ...args) => (e: React.MouseEvent) => {
    func.apply(this, args)
    e.stopPropagation()
  }

  private hidePortalForm = () => {
    this.setState({
      formVisible: false,
      modalLoading: false,
      checkedKeys: []
    }, () => {
      this.portalForm.props.form.resetFields()
    })
  }

  private onModalOk = () => {
    this.portalForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {  projectId, onAdd, onEdit, viewTeam } = this.props
        const { formType, checkedKeys } = this.state
        const { id, name, description, publish, avatar } = values
        const val = {
          description,
          name,
          publish,
          avatar: formType === 'add' ? `${Math.ceil(Math.random() * 19)}` : avatar,
          teamIds: toListBF(viewTeam).map((t) => t.id).filter((item) => !checkedKeys.includes(item))
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
      const { onLoadViewTeam, projectId } = this.props
      const { formType } = this.state
      if (formType === 'edit') {
        const { onLoadSelectTeams } = this.props
        new Promise((resolve) => {
          onLoadViewTeam(projectId, (teams) => {
            resolve(teams)
          })
        }).then((teams) => {
          onLoadSelectTeams('portal', portal.id, (result) => {
            this.setState({
              checkedKeys: toListBF(teams).map((t) => t.id).filter((item) => !result.includes(item))
            })
          })
        })
      } else if (formType === 'add') {
        onLoadViewTeam(projectId, (result) => {
          this.setState({
            checkedKeys: toListBF(result).map((t) => t.id)
          })
        })
      }
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

  private initCheckNodes = (checkedKeys) => {
    this.setState({
      checkedKeys
    })
  }

  public render () {
    const {
      projectId,
      portals,
      currentProject,
      onCheckUniqueName,
      viewTeam,
      selectTeams
    } = this.props
    if (!Array.isArray(portals)) { return null }

    const {
      formType,
      formVisible,
      modalLoading,
      checkedKeys
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
        {/* <EllipsisList rows={2}>
          {addAction}
        </EllipsisList> */}
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
            onCheckUniqueName={onCheckUniqueName}
            projectId={projectId}
            type={formType}
            initCheckNodes={this.initCheckNodes}
            checkedKeys={checkedKeys}
            selectTeams={selectTeams}
            viewTeam={viewTeam}
            wrappedComponentRef={this.refHandlers.portalForm}
          />
        </Modal>
      </div>
    )
  }
}

export default PortalList
