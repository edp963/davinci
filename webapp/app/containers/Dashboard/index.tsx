/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import * as React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link, InjectedRouter, routerShape } from 'react-router'

import { compose } from 'redux'
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import Container from '../../components/Container'
import DashboardForm from './components/DashboardForm'
import DashboardAction from './components/DashboardAction'
import AntdFormType from 'antd/lib/form/Form'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Button = require('antd/lib/button')
const Icon = require('antd/lib/icon')
import {IconProps} from 'antd/lib/icon/index'
const Tooltip = require('antd/lib/tooltip')
const Popover = require('antd/lib/popover')
const Modal = require('antd/lib/modal')
const Breadcrumb = require('antd/lib/breadcrumb')
const Popconfirm = require('antd/lib/popconfirm')
const Input = require('antd/lib/input')
const Menu = require('antd/lib/menu')

const Tree = require('antd/lib/tree').default
const TreeNode = Tree.TreeNode

const Search = Input.Search

import {
  loadDashboards,
  addDashboard,
  editDashboard,
  deleteDashboard,
  loadDashboardDetail
} from './actions'
import { makeSelectDashboards, makeSelectModalLoading } from './selectors'
import { hideNavigator, checkNameUniqueAction } from '../App/actions'
import { listToTree, findFirstLeaf } from './components/localPositionUtil'

const utilStyles = require('../../assets/less/util.less')
const styles = require('./Dashboard.less')
const widgetStyles = require('../Widget/Widget.less')
import {makeSelectCurrentProject} from '../Projects/selectors'
import ModulePermission from '../Account/components/checkModulePermission'
import { initializePermission } from '../Account/components/checkUtilPermission'
import { IProject } from '../Projects'

interface IDashboardProps {
  modalLoading: boolean
  dashboards: IDashboard[]
  router: InjectedRouter
  params: any
  currentProject: IProject
  onLoadDashboards: (portalId: number, resolve: any) => void
  onAddDashboard: (dashboard: IDashboard, resolve: any) => any
  onEditDashboard: (type: string, dashboard: IDashboard[], resolve: any) => void
  onDeleteDashboard: (id: number, resolve: any) => void
  onHideNavigator: () => void
  onCheckUniqueName: (pathname: string, data: any, resolve: () => any, reject: (error: string) => any) => any
  // onLoadDashboardDetail: (selectedDashboard: object, projectId: number, portalId: number, dashboardId: number) => any
}

export interface IDashboard {
  id?: number
  name?: string
  config?: string
  parentId?: number
  dashboardPortalId?: number
  index?: number
  type?: number
  children?: any[]
}

export interface ICurrentDashboard extends IDashboard {
  widgets: any[]
}

interface IDashboardStates {
  formType: 'add' | 'edit' | 'copy' | 'move' | 'delete' | ''
  formVisible: boolean
  expandedKeys: any,
  autoExpandParent: boolean
  searchValue: IDashboard[]
  dashboardData: any
  itemId: number
  dataList: any[]
  isExpand: boolean
  searchVisible: boolean
  isGrid: boolean
}

export class Dashboard extends React.Component<IDashboardProps, IDashboardStates> {
  constructor (props) {
    super(props)
    this.state = {
      formType: '',
      formVisible: false,
      expandedKeys: [],
      autoExpandParent: true,
      searchValue: [],
      dashboardData: [],
      itemId: 0,
      dataList: [],
      isExpand: true,
      searchVisible: false,
      isGrid: true
    }
  }

  private dashboardForm: AntdFormType = null
  private refHandlers = {
    dashboardForm: (ref) => this.dashboardForm = ref
  }

  public componentWillMount () {
    // this.props.onHideNavigator()
    const { params, router, dashboards } = this.props
    const { pid, portalId, portalName, dashboardId } = params

    this.props.onLoadDashboards(params.portalId, (result) => {
      let defaultDashboardId = 0
      const dashboardData = listToTree(result, 0)
      const treeData = {
        id: -1,
        type: 2,
        children: dashboardData
      }
      defaultDashboardId = findFirstLeaf(treeData)

      if (defaultDashboardId >= 0) {
        if (!dashboardId) {
          router.replace(`/project/${pid}/portal/${portalId}/portalName/${portalName}/dashboard/${defaultDashboardId}`)
        }
      }

      this.setState({
        dashboardData,
        isGrid: defaultDashboardId >= 0
      })
      this.expandAll(result)
    })

    // .then(({result, defaultDashboardId}) => {
    //   if (result.length !== 0 && defaultDashboardId !== -1) {
    //     const { dashboardId } = params
    //     const currentdashboardId = dashboardId ? Number(dashboardId) : defaultDashboardId
    //     const selectedDashboard = (result as any).find((r) => r.id === currentdashboardId)
    //     console.log(selectedDashboard)
    //     this.props.onLoadDashboardDetail(selectedDashboard, params.pid, params.portalId, currentdashboardId)
    //   } else {
    //     this.setState({
    //       isGrid: false
    //     })
    //   }
    // })
  }

  private initalDashboardData (dashboards) {
    this.setState({
      dashboardData: listToTree(dashboards, 0)
    })
    this.expandAll(dashboards)
  }

  public componentWillReceiveProps (nextProps) {
    if (nextProps.dashboards !== this.props.dashboards) {
      this.initalDashboardData(nextProps.dashboards)
    }
  }

  private changeDashboard = (dashboardId) => (e) => {
    const { params, router } = this.props
    const { pid, portalId, portalName } = params
    this.setState({
      isGrid: true
    }, () => {
      router.replace(`/project/${pid}/portal/${portalId}/portalName/${portalName}/dashboard/${dashboardId}`)
    })
  }

  private hideDashboardForm = () => {
    this.setState({
      formVisible: false
    }, () => {
      this.dashboardForm.props.form.resetFields()
    })
  }

  private onModalOk = () => {
    this.dashboardForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { dashboards, params, router, onEditDashboard, onAddDashboard } = this.props
        const { formType } = this.state
        const { id, name, folder, selectType, index } = values

        const dashArr = folder === '0'
          ? dashboards.filter((d) => d.parentId === 0)
          : dashboards.filter((d) => d.parentId === Number(folder))

        const indexTemp = dashArr.length === 0 ? 0 : dashArr[dashArr.length - 1].index + 1
        const obj = {
          config: '',
          dashboardPortalId: Number(params.portalId),
          name,
          type: selectType ? 1 : 0
        }

        const addObj = {
          ...obj,
          parentId: Number(folder),
          index: indexTemp
        }

        const editObj = [{
          ...obj,
          parentId: Number(folder),
          id,
          index
        }]

        const currentArr = dashboards.filter((d) => d.parentId === Number(folder))
        const moveObj = [{
          ...obj,
          parentId: Number(folder),
          id,
          index: currentArr.length ? currentArr[currentArr.length - 1].index + 1  : 0
        }]

        switch (formType) {
          case 'add':
          case 'copy':
            onAddDashboard(addObj, (dashboardId) => {
              this.hideDashboardForm()
              const { pid, portalId, portalName } = params
              if (addObj.type === 0) {
                this.setState({
                  isGrid: false
                })
                router.replace(`/project/${pid}/portal/${portalId}/portalName/${portalName}`)
              } else {
                this.setState({
                  isGrid: true
                })
                router.replace(`/project/${pid}/portal/${portalId}/portalName/${portalName}/dashboard/${dashboardId}`)
              }
            })
            break
          case 'edit':
            onEditDashboard('edit', editObj, () => { this.hideDashboardForm() })
            break
          case 'move':
            onEditDashboard('move', moveObj, () => { this.hideDashboardForm() })
            break
          case 'delete':
            this.confirmDeleteDashboard(id)
            break
        }
      }
    })
  }

  private onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false
    })
  }

  private onDrop = (info) => {
    const { dashboards } = this.props

    const dragKey = info.dragNode.props.eventKey // 开始(要拖拽元素)id Number(dragKey) === dragNodesKeys[0] === 每一项的id
    // const dragPos = info.dragNode.props.pos //  开始的位置'0-1-0'

    const dropKey = info.node.props.eventKey // 结束的id
    // const dropPos = info.node.props.pos.split('-')// 结束位置的树形结构层级'0-1'
    // const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

    // const dragNodesKeys = info.dragNodesKeys;
    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.id === Number(key)) {
          return callback(item, index, arr)
        }
        if (item.children) {
          return loop(item.children, key, callback)
        }
      })
    }

    const data = [...this.state.dashboardData]
    let dragItem = null
    loop(data, dragKey, (item) => {
      dragItem = item
    })
    // let dragObj
    loop(data, dropKey, (item, i, arr) => {
      const { config, dashboardPortalId, id, name, type } = dragItem

      let dropObj = dashboards.find((d) => d.id === Number(dropKey))
      const dropObjParentId = dropObj.parentId
      let value = []
      if (!info.dropToGap && dropObj.type === 1) {
        if (dragItem.type === 0) {
          return
        }
      }
      if (!info.dropToGap && dropObj.type === 0) {
         const currentArr = dropObj.children
         value = [{
           config,
           dashboardPortalId,
           id,
           index: currentArr.length ? currentArr[currentArr.length - 1].index + 1  : 0,
           name,
           parentId: Number(dropKey),
           type
         }]
         this.props.onEditDashboard('move', value, (result) => {
          // dragObj = result
          })
         return
      }

      let partArr = Number(dropObj.parentId) === 0
          ? dashboards.filter((d) => d.parentId === 0)
          : (dashboards.find((d) => d.id === Number(dropObj.parentId))).children
      dropObj = i > info.dropPosition ? partArr[i] : partArr[i + 1] // a trick 判断拖拽位置是哪条线，如果是下面那条线则上移一位
      const dropObjIndex = dropObj ? dropObj.index : partArr[i].index + 1

      if (!dropObj) {
        value.unshift({
          config,
          dashboardPortalId,
          id,
          index: dropObjIndex,
          name,
          parentId: dropObjParentId,
          type
        })
      }
      if (!!dropObj && (info.dropToGap || dropObj.type === 1)) {
        // const dropObj = dashboards.find((d) => d.id === Number(dropKey))
        partArr = Number(dropObj.parentId) === 0
          ? dashboards.filter((d) => d.parentId === 0)
          : (dashboards.find((d) => d.id === Number(dropObj.parentId))).children
        const othersArr = partArr.filter((p) => p.index >= dropObj.index).filter((o) => o.id !== id)
        value = othersArr.map((o) => {
          const { config, dashboardPortalId, id, index, name, parentId, type } = o
          return {
            config,
            dashboardPortalId,
            id,
            index: index + 1,
            name,
            parentId,
            type
          }
        })
        value.unshift({
          config,
          dashboardPortalId,
          id,
          index: dropObjIndex,
          name,
          parentId: dropObj.parentId,
          type
        })
      }
      this.props.onEditDashboard('move', value, (result) => {
        // dragObj = result
      })
    })

    this.setState({
      dashboardData: data
    })
  }

  private onAddItem = () => {
    this.setState({
      formVisible: true,
      formType: 'add'
    })
  }

  private onCollapseAll = () => {
    this.onExpand([])
    this.setState({
      isExpand: false
    })
  }

  private onExpandAll = () => {
    const { dashboards } = this.props
    if (dashboards) {
      this.expandAll(dashboards)
    }
  }

  private expandAll (dashboards) {
    const expandArr = []
    dashboards.filter((d) => d.type === 0)
      .forEach((i) => expandArr.push(`${i.id}`))
    this.onExpand(expandArr)
    this.setState({
      isExpand: true
    })
  }

  private onShowDashboardForm (itemId, formType) {
    const { dashboards } = this.props
    this.setState({
      formVisible: true,
      itemId
    }, () => {
      const {
        config,
        id,
        name,
        parentId,
        type,
        index
      } = (dashboards as any[]).find((g) => g.id === itemId)
      this.dashboardForm.props.form.setFieldsValue({
        id,
        folder: parentId ? `${(dashboards as any[]).find((g) => g.id === parentId).id}` : '0',
        config,
        name: formType === 'copy' ? `${name}_copy` : name,
        selectType: type === 1,
        index
      })
    })
  }

  private onOperateMore = (itemId, type) => {
    this.setState({
      formType: type
    }, () => {
      this.onShowDashboardForm(itemId, this.state.formType)
    })
  }

  private searchDashboard = (e) => {
    const { dashboards } = this.props
    const { value } = e.target
    this.setState({
      searchValue: value ? dashboards.filter((d) => d.name.includes(value)) : []
    })
  }

  private backPortal = () => {
    const { router, params } = this.props
    router.replace(`/project/${params.pid}/vizs`)
  }

  private pickSearchDashboard = (dashboardId) => (e) => {
    const { dashboards } = this.props
    this.setState({
      searchVisible: false
    })
    const currentDashoboard = dashboards.find((d) => d.id === dashboardId)
    if (currentDashoboard.type === 1) {
      this.changeDashboard(dashboardId)(e)
    } else if (currentDashoboard.type === 0) {
      const currentFolderArr = dashboards.filter((d) => d.parentId === dashboardId)
      if (currentFolderArr.length !== 0) {
        this.changeDashboard(currentFolderArr[0].id)(e)
      }
    }
  }

  private confirmDeleteDashboard = (id) => {
    const { params, router, onDeleteDashboard, dashboards } = this.props
    const { dashboardData } = this.state

    onDeleteDashboard(id, () => {
      const { pid, portalId, portalName } = params

      const paramsDashboard = dashboards.find((d) => d.id === Number(params.dashboardId))
      const noCurrentDashboards = dashboardData.filter((d) => d.id !== id)
      if (noCurrentDashboards.length !== 0 && paramsDashboard) {
        const remainDashboards = noCurrentDashboards.filter((r) => r.parentId !== id)
        const treeData = {
          id: -1,
          type: 2,
          children: remainDashboards
        }
        if (Number(params.dashboardId) === id || paramsDashboard.parentId === id) {
          const defaultDashboardId = findFirstLeaf(treeData)
          router.replace(`/project/${pid}/portal/${portalId}/portalName/${portalName}/dashboard/${defaultDashboardId}`)
        }
      } else {
        router.replace(`/project/${pid}/portal/${portalId}/portalName/${portalName}/dashboard/-1`)
        this.setState({
          isGrid: false
        })
      }
      this.hideDashboardForm()
    })
  }

  private searchVisibleChange = (visible) => {
    this.setState({
      searchVisible: visible
    })
  }

  public render () {
    const {
      params,
      dashboards,
      modalLoading,
      children,
      currentProject,
      onCheckUniqueName
    } = this.props

    const {
      formType,
      formVisible,
      searchValue,
      dashboardData,
      isGrid,
      searchVisible
    } = this.state

    const items = searchValue.map((s) => {
      return <li key={s.id} onClick={this.pickSearchDashboard(s.id)}>{s.name}</li>
    })

    let modalTitle = ''
    switch (formType) {
      case 'add':
        modalTitle = '新增'
        break
      case 'edit':
        modalTitle = '修改'
        break
      case 'copy':
        modalTitle = '复制'
        break
      case 'move':
        modalTitle = '移动'
        break
      case 'delete':
        modalTitle = '提示'
        break
    }

    const modalButtons = [(
      <Button
        key="back"
        size="large"
        onClick={this.hideDashboardForm}
      >
        取 消
      </Button>
    ), (
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={modalLoading}
        onClick={this.onModalOk}
      >
        {formType === 'delete' ? '确 定' : '保 存'}
      </Button>
    )]

    const loop = (data, depth = 0) => data.map((item) => {
      const dashboardAction = (
        <DashboardAction
          currentProject={currentProject}
          depth={depth}
          item={item}
          onInitOperateMore={this.onOperateMore}
          initChangeDashboard={this.changeDashboard}
        />
      )

      if (item.type === 0) {
        return (
          <TreeNode icon={<Icon type="smile-o" />} key={item.id} title={dashboardAction} >
            {loop(item.children, depth + 1)}
          </TreeNode>
        )
      }
      return <TreeNode icon={<Icon type="smile-o" />} key={item.id} title={dashboardAction} />
    })

    const AdminIcon = ModulePermission<IconProps>(currentProject, 'viz', true)(Icon)

    return (
      <div className={styles.portal}>
        <Helmet title={params.portalName} />
        {/* <div className={styles.portalHeader}>
          <span className={styles.historyBack}>
            <Tooltip placement="bottom" title="返回">
              <Icon type="left-circle-o" className={styles.backIcon} onClick={this.backPortal} />
            </Tooltip>
          </span>
        </div> */}
        <div className={styles.portalBody}>
          <div className={styles.portalTree}>
            <div className={styles.portalRow}>
              <span className={styles.portalTitle} title={params.portalName}>{params.portalName}</span>
              <span className={styles.portalAction}>
                <Popover
                  placement="bottom"
                  content={
                    <div className={styles.portalTreeSearch}>
                      <Search
                        placeholder="Search"
                        onChange={this.searchDashboard}
                      />
                      <ul>
                        {items}
                      </ul>
                    </div>}
                  trigger="click"
                  visible={searchVisible}
                  onVisibleChange={this.searchVisibleChange}
                >
                  <Tooltip placement="top" title="搜索">
                    <Icon
                      type="search"
                      className={styles.search}
                    />
                  </Tooltip>
                </Popover>
                <Tooltip placement="top" title="新增">
                  <AdminIcon
                    type="plus"
                    className={styles.plus}
                    onClick={this.onAddItem}
                  />
                </Tooltip>
                <Popover
                  placement="bottom"
                  content={
                    <ul className={styles.menu}>
                      <li onClick={this.onCollapseAll}>收起全部</li>
                      <li onClick={this.onExpandAll}>展开全部</li>
                    </ul>}
                  trigger="click"
                >
                  <Tooltip placement="top" title="更多">
                    <Icon
                      type="ellipsis"
                      className={styles.more}
                    />
                  </Tooltip>
                </Popover>
              </span>
            </div>
            { dashboardData.length
              ? <div className={styles.portalTreeNode}>
                <Tree
                  onExpand={this.onExpand}
                  expandedKeys={this.state.expandedKeys}
                  autoExpandParent={this.state.autoExpandParent}
                  selectedKeys={[this.props.params.dashboardId]}
                  draggable={initializePermission(currentProject, 'vizPermission')}
                  onDrop={this.onDrop}
                >
                {loop(dashboardData)}
                </Tree>
              </div>
              : isGrid ? <h3 className={styles.loadingTreeMsg}>Loading tree......</h3> : ''
            }
          </div>
          <div className={styles.gridClass}>
            {
              isGrid
              ? children
              : (
                <div className={styles.noDashboard}>
                  <img src={require('../../assets/images/noDashboard.png')} onClick={this.onAddItem}/>
                  <p>请创建文件夹或 Dashboard</p>
                </div>
              )
            }
          </div>
        </div>
        <Modal
          title={modalTitle}
          wrapClassName="ant-modal-small"
          visible={formVisible}
          footer={modalButtons}
          onCancel={this.hideDashboardForm}
        >
          <DashboardForm
            type={formType}
            itemId={this.state.itemId}
            dashboards={dashboards}
            portalId={params.portalId}
            onCheckUniqueName={onCheckUniqueName}
            wrappedComponentRef={this.refHandlers.dashboardForm}
          />
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  dashboards: makeSelectDashboards(),
  modalLoading: makeSelectModalLoading(),
  currentProject: makeSelectCurrentProject()
})

export function mapDispatchToProps (dispatch) {
  return {
    // onLoadDashboardDetail: (selectedDashboard, projectId, portalId, dashboardId) => dispatch(loadDashboardDetail(selectedDashboard, projectId, portalId, dashboardId)),
    onLoadDashboards: (portalId, resolve) => dispatch(loadDashboards(portalId, resolve)),
    onAddDashboard: (dashboard, resolve) => dispatch(addDashboard(dashboard, resolve)),
    onEditDashboard: (formType, dashboard, resolve) => dispatch(editDashboard(formType, dashboard, resolve)),
    onDeleteDashboard: (id, resolve) => dispatch(deleteDashboard(id, resolve)),
    onHideNavigator: () => dispatch(hideNavigator()),
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withReducer = injectReducer({ key: 'dashboard', reducer })
const withSaga = injectSaga({ key: 'dashboard', saga })

export default compose(
  withReducer,
  withSaga,
  withConnect
)(Dashboard)
