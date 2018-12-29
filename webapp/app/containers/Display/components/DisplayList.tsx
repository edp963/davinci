import React from 'react'
import classnames from 'classnames'
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
import DisplayFormModal from './DisplayFormModal'
import ModulePermission from '../../Account/components/checkModulePermission'
import {IProject} from '../../Projects'
import { toListBF } from '../../Bizlogic/viewUtil'

export interface IDisplay {
  id: number
  name: string
  projectId: number
  publish: boolean
  avatar: string
  description: string
  teamIds: any[]
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
  viewTeam: any[]
  selectTeams: any[]
  onCheckName: (type, data, resolve, reject) => void
  onLoadViewTeam: (projectId: number, resolve?: any) => any
  onLoadSelectTeams: (type: string, id: number, resolve?: any) => any
}

interface IDisplayListStates {
  editingDisplay: IDisplay
  modalLoading: boolean
  formType: 'edit' | 'add'
  formVisible: boolean
  checkedKeys: any[]
}

export class DisplayList extends React.PureComponent<IDisplayListProps, IDisplayListStates> {

  constructor (props: IDisplayListProps) {
    super(props)
    this.state = {
      editingDisplay: null,
      modalLoading: false,
      formType: 'add',
      formVisible: false,
      checkedKeys: []
    }
  }

  private stopPPG = (e) => {
    e.stopPropagation()
  }

  private saveDisplay = (display: IDisplay, type: 'edit' | 'add') => {
    this.setState({ modalLoading: true })
    const { onAdd, onEdit, viewTeam } = this.props
    const { checkedKeys } = this.state
    const teamIds = toListBF(viewTeam).map((t) => t.id).filter((item) => !checkedKeys.includes(item))
    if (type === 'add') {
      onAdd({
        ...display, teamIds
      }, () => { this.hideDisplayFormModal() })
    } else {
      onEdit({
        ...display, teamIds
      }, () => { this.hideDisplayFormModal() })
    }
  }

  private cancel = () => {
    this.setState({
      formVisible: false,
      modalLoading: false,
      checkedKeys: []
    })
  }

  private showDisplayFormModal = (formType: 'edit' | 'add', display?: IDisplay) => (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    this.setState({
      editingDisplay: display,
      formType,
      formVisible: true
    }, () => {
      const { onLoadViewTeam, projectId } = this.props
      const { formType } = this.state
      if (formType === 'edit') {
        const { onLoadSelectTeams } = this.props
        new Promise((resolve) => {
          onLoadViewTeam(projectId, (teams) => {
            resolve(teams)
          })
        }).then((teams) => {
          onLoadSelectTeams('display', display.id, (result) => {
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

  private initCheckNodes = (checkedKeys) => {
    this.setState({
      checkedKeys
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
    const { displays, projectId, currentProject, onCheckName, viewTeam } = this.props
    const { checkedKeys } = this.state
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
          viewTeam={viewTeam}
          checkedKeys={checkedKeys}
          initCheckNodes={this.initCheckNodes}
        />
      </div>
    )
  }
}

export default DisplayList
