import * as React from 'react'
import * as classnames from 'classnames'
import AntdFormType from 'antd/lib/form/Form'

import Col from 'antd/lib/col'
import Button from 'antd/lib/button'
import Tooltip from 'antd/lib/tooltip'
import Icon, { IconProps } from 'antd/lib/icon'
import Popconfirm from 'antd/lib/popconfirm'
import Modal from 'antd/lib/modal'
import Row from 'antd/lib/row'
const styles = require('../Display.less')

import EllipsisList from '../../../components/EllipsisList'
import DisplayForm from './DisplayForm'
import ModulePermission from '../../Account/components/checkModulePermission'
import {IProject} from '../../Projects'

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
}

interface IDisplayListStates {
  modalLoading: boolean
  formType: 'edit' | 'add'
  formVisible: boolean
}

export class DisplayList extends React.PureComponent<IDisplayListProps, IDisplayListStates> {

  private refHandlers: { displayForm: (ref: AntdFormType) => void }
  private displayForm: AntdFormType

  constructor (props: IDisplayListProps) {
    super(props)
    this.state = {
      modalLoading: false,
      formType: 'add',
      formVisible: false
    }
    this.refHandlers = {
      displayForm: (ref) => this.displayForm = ref
    }
  }

  private stopPPG = (e) => {
    e.stopPropagation()
  }

  private showDisplayForm = (formType: 'edit' | 'add', display?: IDisplay) => (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    this.setState({
      formType,
      formVisible: true
    }, () => {
      if (display) {
        this.displayForm.props.form.setFieldsValue(display)
      }
    })
  }

  private hideDisplayForm = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    }, () => {
      this.displayForm.props.form.resetFields()
    })
  }

  private onModalOk = () => {
    const { onAdd, onEdit, projectId } = this.props
    this.displayForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ modalLoading: true })
        if (this.state.formType === 'add') {
          onAdd({
            ...values,
            projectId
          }, () => { this.hideDisplayForm() })
        } else {
          onEdit(values, () => { this.hideDisplayForm() })
        }
      }
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
          <div className={styles.container} onClick={this.showDisplayForm('add')}>
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
                <EditIcon className={styles.edit} type="setting" onClick={this.showDisplayForm('edit', display)} />
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
    const { displays, projectId, currentProject } = this.props
    if (!Array.isArray(displays)) { return null }

    const { formType, formVisible, modalLoading } = this.state

    const modalButtons = [(
      <Button
        key="back"
        size="large"
        onClick={this.hideDisplayForm}
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
        <Modal
          title={`${formType === 'add' ? '新增' : '修改'} Display`}
          wrapClassName="ant-modal-small"
          visible={formVisible}
          footer={modalButtons}
          onCancel={this.hideDisplayForm}
        >
          <DisplayForm
            projectId={projectId}
            type={formType}
            wrappedComponentRef={this.refHandlers.displayForm}
          />
        </Modal>
      </div>
    )
  }
}

export default DisplayList
