import * as React from 'react'
import { WrappedFormUtils } from 'antd/lib/form/Form'

const Col = require('antd/lib/col')
const Button = require('antd/lib/button')
const Tooltip = require('antd/lib/tooltip')
const Icon = require('antd/lib/icon')
const Popconfirm = require('antd/lib/popconfirm')
const Modal = require('antd/lib/modal')

const styles = require('../Display.less')

import EllipsisList from '../../../components/EllipsisList'
import DisplayForm from './DisplayForm'

export interface IDisplay {
  id: number
  name: string
  projectId: number
  publish: boolean
  avatar: string
  description: string
}

export interface IDisplayEvent {
  onDisplayClick: (display: IDisplay) => void
  onAdd: (display: IDisplay, resolve: () => void) => void
  onEdit: (display: IDisplay, resolve: () => void) => void
  onCopy: (display: IDisplay) => void
  onDelete: (displayId: number) => void
}

interface IDisplayListProps extends IDisplayEvent {
  projectId: number
  displays: IDisplay[]
}

interface IDisplayListStates {
  modalLoading: boolean
  formType: 'edit' | 'add'
  formVisible: boolean
}

export class DisplayList extends React.PureComponent<IDisplayListProps, IDisplayListStates> {

  private displayForm: WrappedFormUtils

  constructor (props: IDisplayListProps) {
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

  private showDisplayForm = (formType: 'edit' | 'add', display?: IDisplay) => {
    this.setState({
      formType,
      formVisible: true
    }, () => {
      if (display) {
        this.displayForm.setFieldsValue(display)
      }
    })
  }

  private hideDisplayForm = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    }, () => {
      this.displayForm.resetFields()
    })
  }

  private onModalOk = () => {
    const { onAdd, onEdit, projectId } = this.props
    this.displayForm.validateFieldsAndScroll((err, values) => {
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

  private delegate = (func: (...args) => void, ...args) => (e: MouseEvent) => {
    func.apply(this, args)
    e.stopPropagation()
  }

  private renderDisplay (display: IDisplay) {
    const coverStyle: React.CSSProperties = {
      backgroundImage: `url(${display.avatar})`
    }
    const { onDisplayClick, onCopy, onDelete } = this.props

    return (
      <Col
        xl={4}
        lg={6}
        md={8}
        sm={12}
        xs={24}
        key={display.id}
        onClick={onDisplayClick(display)}
      >
        <div className={styles.display}>
          <div className={styles.container}>
            <div>
              <h3 className={styles.title}>{display.name}</h3>
              <p className={styles.content}>{display.description}</p>
            </div>
            <Tooltip title="编辑">
              <Icon className={styles.edit} type="setting" onClick={this.delegate(this.showDisplayForm, 'edit', display)} />
            </Tooltip>
            <Tooltip title="复制">
              <Icon className={styles.copy} type="copy" onClick={this.delegate(onCopy, display)} />
            </Tooltip>
            <Popconfirm
              title="确定删除？"
              placement="bottom"
              onConfirm={this.delegate(onDelete, display.id)}
            >
              <Tooltip title="删除">
                <Icon className={styles.delete} type="delete" onClick={this.stopPPG} />
              </Tooltip>
            </Popconfirm>
            <div className={styles.cover} style={coverStyle}/>
          </div>
        </div>
      </Col>
    )
  }

  public render () {
    const { displays, projectId } = this.props
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

    return (
      <div>
        <EllipsisList rows={2}>
          {displays.map((d) => this.renderDisplay(d))}
        </EllipsisList>
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
            ref={(f) => { this.displayForm = f }}
          />
        </Modal>
      </div>
    )
  }
}

export default DisplayList
