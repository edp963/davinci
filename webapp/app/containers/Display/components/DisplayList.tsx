import * as React from 'react'
import { WrappedFormUtils } from 'antd/lib/form/Form'

const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Button = require('antd/lib/button')
const Tooltip = require('antd/lib/tooltip')
const Icon = require('antd/lib/icon')
const Popconfirm = require('antd/lib/popconfirm')
const Modal = require('antd/lib/modal')

const styles = require('../Display.less')

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
  displays: IDisplay[],
  rows?: number
}

interface IDisplayListStates {
  modalLoading: boolean
  formType: 'edit' | 'add'
  formVisible: boolean,
  screenWidth: number,
  withEllipsis: boolean
}

export class DisplayList extends React.PureComponent<IDisplayListProps, IDisplayListStates> {

  private displayForm: WrappedFormUtils

  private layoutSetting = {
    xs: {
      minWidth: 0,
      cols: 1
    },
    sm: {
      minWidth: 768,
      cols: 2
    },
    md: {
      minWidth: 992,
      cols: 3
    },
    lg: {
      minWidth: 1200,
      cols: 4
    },
    xl: {
      minWidth: 1600,
      cols: 6
    }
  }

  constructor (props: IDisplayListProps) {
    super(props)
    this.state = {
      modalLoading: false,
      formType: 'add',
      formVisible: false,
      screenWidth: 0,
      withEllipsis: true
    }
  }

  public componentWillMount () {
    this.setState({ screenWidth: document.documentElement.clientWidth })
  }

  public componentWillReceiveProps (nextProps: IDisplayListProps) {
    if (nextProps.rows) {
      window.onresize = () => this.setState({ screenWidth: document.documentElement.clientWidth })
    }
  }

  private getColumns = () => {
    const { screenWidth } = this.state
    let cols = 0
    Object.keys(this.layoutSetting).every((item) => {
      const setting = this.layoutSetting[item]
      const pass = screenWidth >= setting.minWidth
      if (pass) { cols = setting.cols }
      return pass
    })
    return cols
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

  private renderEmpty = () => {
    return (
      <Col
        xl={4}
        lg={6}
        md={8}
        sm={12}
        xs={24}
        key="empty"
      >
        <div className={styles.display}>
          <Tooltip title="点击查看全部">
            <div onClick={this.showAll} className={styles.moreContainer}>
              <div className={styles.more}/>
              <div className={styles.more}/>
              <div className={styles.more}/>
            </div>
          </Tooltip>
        </div>
      </Col>
    )
  }

  private showAll = () => {
    this.setState({
      withEllipsis: false
    })
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
    const { displays, projectId, rows } = this.props
    if (!Array.isArray(displays)) { return null }

    const { formType, formVisible, modalLoading, withEllipsis } = this.state

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

    let shownDisplays = [...displays]
    if (rows && withEllipsis) {
      const cols = this.getColumns()
      shownDisplays = shownDisplays.slice(0, rows * cols - 1)
    }

    return (
      <Row gutter={20}>
        {shownDisplays.map((d) => this.renderDisplay(d))}
        {rows && withEllipsis ? this.renderEmpty() : null}
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
      </Row>
    )
  }
}

export default DisplayList
