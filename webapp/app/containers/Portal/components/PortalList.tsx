import * as React from 'react'
import * as classnames from 'classnames'

const Icon = require('antd/lib/icon')
const Col = require('antd/lib/col')
const Button = require('antd/lib/button')
const Tooltip = require('antd/lib/tooltip')
const Popconfirm = require('antd/lib/popconfirm')
const Modal = require('antd/lib/modal')

const styles = require('../Portal.less')

import AntdFormType from 'antd/lib/form/Form'
import EllipsisList from '../../../components/EllipsisList'
import PortalForm from './PortalForm'

interface IPortalListProps {
  projectId: number
  portals: any[]
  onPortalClick: (portal: any) => void
  onAdd: (portal, resolve) => void
  onEdit: (portal, resolve) => void
  onDelete: (portalId: number) => void
}

interface IPortalListStates {
  modalLoading: boolean
  formType: 'edit' | 'add'
  formVisible: boolean
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
      formVisible: false
    }
  }

  private stopPPG = (e) => {
    e.stopPropagation()
  }

  private delegate = (func: (...args) => void, ...args) => (e: MouseEvent) => {
    func.apply(this, args)
    e.stopPropagation()
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
          projectId,
          avatar: formType === 'add' ? Math.ceil(Math.random() * 19) : Number(avatar)
        }
        if (formType === 'add') {
          onAdd(val, () => {
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

  private showPortalForm = (formType: 'edit' | 'add', portal?: any) => {
    this.setState({
      formType,
      formVisible: true
    }, () => {
      if (portal) {
        this.portalForm.props.form.setFieldsValue(portal)
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
    const { projectId, portals } = this.props
    if (!Array.isArray(portals)) { return null }

    const { formType, formVisible, modalLoading } = this.state

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

    return (
      <div>
        <EllipsisList rows={2}>
          {portals.map((p) => this.renderPortal(p))}
        </EllipsisList>
        <Modal
          title={`${formType === 'add' ? '新增' : '修改'} Portal`}
          wrapClassName="ant-modal-small"
          visible={formVisible}
          footer={modalButtons}
          onCancel={this.hidePortalForm}
        >
          <PortalForm
            projectId={projectId}
            type={formType}
            wrappedComponentRef={this.refHandlers.portalForm}
          />
        </Modal>
      </div>
    )
  }
}

export default PortalList
