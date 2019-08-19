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

import React, { Suspense } from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link, InjectedRouter, routerShape } from 'react-router'

import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'
import projectReducer from '../Projects/reducer'
import projectSaga from '../Projects/sagas'
import portalReducer from '../Portal/reducer'
import portalSaga from '../Portal/sagas'
import viewReducer from '../View/reducer'
import viewSaga from '../View/sagas'

import DashboardForm from './components/DashboardForm'
import DashboardAction from './components/DashboardAction'

import { Button, Icon, Tooltip, Popover, Modal, Input, Tree } from 'antd'
const TreeNode = Tree.TreeNode

import { IconProps } from 'antd/lib/icon/index'
import AntdFormType from 'antd/lib/form/Form'

const Search = Input.Search

import {
  loadDashboards,
  addDashboard,
  editDashboard,
  deleteDashboard,
  loadDashboardDetail
} from './actions'
import { makeSelectDashboards, makeSelectModalLoading } from './selectors'
import {
  hideNavigator,
  checkNameUniqueAction,
  initiateDownloadTask,
  loadDownloadList,
  downloadFile
} from '../App/actions'
import { makeSelectDownloadList, makeSelectDownloadListLoading } from '../App/selectors'
import { DownloadTypes, IDownloadRecord } from '../App/types'
import { listToTree, findFirstLeaf } from './components/localPositionUtil'
import { loadPortals } from '../Portal/actions'
import { makeSelectPortals } from '../Portal/selectors'
import { loadProjectDetail, excludeRoles } from '../Projects/actions'
import {IExludeRoles} from '../Portal/components/PortalList'
const utilStyles = require('assets/less/util.less')
const styles = require('./Dashboard.less')
const widgetStyles = require('../Widget/Widget.less')
import {makeSelectCurrentProject, makeSelectProjectRoles} from '../Projects/selectors'
import ModulePermission from '../Account/components/checkModulePermission'
import { initializePermission } from '../Account/components/checkUtilPermission'
import { IProject } from '../Projects'
import EditorHeader from 'components/EditorHeader'
const SplitPane = React.lazy(() => import('react-split-pane'))
import {IProjectRoles} from '../Organizations/component/ProjectRole'
import { loadProjectRoles } from '../Organizations/actions'
import { IGlobalControl, GlobalControlQueryMode } from 'app/components/Filters/types'

interface IDashboardProps {
  modalLoading: boolean
  dashboards: IDashboard[]
  router: InjectedRouter
  params: any
  currentProject: IProject
  portals: any[]
  projectRoles: IProjectRoles[]
  downloadList: IDownloadRecord[]
  onLoadDashboards: (portalId: number, resolve: any) => void
  onAddDashboard: (dashboard: IDashboard, resolve: any) => any
  onEditDashboard: (type: string, dashboard: IDashboard[], resolve: any) => void
  onDeleteDashboard: (id: number, resolve: any) => void
  onHideNavigator: () => void
  onCheckUniqueName: (pathname: string, data: any, resolve: () => any, reject: (error: string) => any) => any
  onLoadPortals: (projectId) => void
  onLoadProjectDetail: (id) => any
  onExcludeRoles: (type: string, id: number, resolve?: any) => any
  onLoadProjectRoles: (id: number) => any
  onInitiateDownloadTask: (id: number, type: DownloadTypes, downloadParams?: any[]) => void
  onLoadDownloadList: () => void
  onDownloadFile: (id) => void
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

export interface IDashboardConfig {
  filters?: IGlobalControl[]
  linkagers?: any[]
  queryMode?: GlobalControlQueryMode
}

export interface ICurrentDashboard extends IDashboard {
  widgets: any[]
}

interface IDashboardStates {
  formType: 'add' | 'edit' | 'copy' | 'move' | 'delete' | ''
  formVisible: boolean
  expandedKeys: string[],
  autoExpandParent: boolean
  searchValue: IDashboard[]
  dashboardData: any
  itemId: number
  dataList: any[]
  isExpand: boolean
  searchVisible: boolean
  isGrid: boolean
  checkedKeys: any[]
  splitSize: number
  portalTreeWidth: number
  exludeRoles: IExludeRoles[]
}

export class Dashboard extends React.Component<IDashboardProps, IDashboardStates> {
  private defaultSplitSize = 190
  private maxSplitSize = this.defaultSplitSize * 1.5
  constructor (props) {
    super(props)
    const splitSize = +localStorage.getItem('dashboardSplitSize') || this.defaultSplitSize
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
      isGrid: true,
      checkedKeys: [],
      splitSize,
      portalTreeWidth: 0,
      exludeRoles: []
    }
  }

  private dashboardForm: AntdFormType = null
  private refHandlers = {
    dashboardForm: (ref) => this.dashboardForm = ref
  }

  public componentWillMount () {
    // this.props.onHideNavigator()
    const { params, router, dashboards, onLoadDashboards, onLoadPortals, onLoadProjectDetail, onLoadProjectRoles } = this.props
    const { pid, portalId, portalName, dashboardId } = params

    onLoadProjectRoles(Number(pid))
    onLoadDashboards(params.portalId, (result) => {
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
        isGrid: defaultDashboardId >= 0,
        portalTreeWidth: Number(localStorage.getItem('dashboardSplitSize'))
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
    onLoadPortals(pid)
    onLoadProjectDetail(pid)
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


  public componentDidMount () {
    this.props.onHideNavigator()
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
      formVisible: false,
      checkedKeys: []
    }, () => {
      this.dashboardForm.props.form.resetFields()
    })
  }

  private onModalOk = () => {
    const { formType, checkedKeys } = this.state

    if (formType === 'delete') {
      const id = this.dashboardForm.props.form.getFieldValue('id')
      this.confirmDeleteDashboard(id)
    } else {
      this.dashboardForm.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          const { dashboards, params, router, onEditDashboard, onAddDashboard } = this.props
          const { id, name, folder, selectType, index, config } = values

          const dashArr = folder === '0'
            ? dashboards.filter((d) => d.parentId === 0)
            : dashboards.filter((d) => d.parentId === Number(folder))

          const indexTemp = dashArr.length === 0 ? 0 : dashArr[dashArr.length - 1].index + 1
          const obj = {
            config,
            dashboardPortalId: Number(params.portalId),
            name,
           // type: selectType ? 1 : 0   // todo selectType 更改位置
            type: Number(selectType)
          }

          const addObj = {
            ...obj,
            parentId: Number(folder),
            index: indexTemp,
            roleIds: this.state.exludeRoles.filter((role) => !role.permission).map((p) => p.id)
          }

          const editObj = [{
            ...obj,
            parentId: Number(folder),
            id,
            index,
            roleIds: this.state.exludeRoles.filter((role) => !role.permission).map((p) => p.id)
          }]

          const currentArr = dashboards.filter((d) => d.parentId === Number(folder))
          const moveObj = [{
            ...obj,
            parentId: Number(folder),
            id,
            index: currentArr.length ? currentArr[currentArr.length - 1].index + 1 : 0
          }]

          switch (formType) {
            case 'add':
            // case 'copy':
              onAddDashboard(addObj, (dashboardId) => {
                this.hideDashboardForm()
                this.setState({ isGrid: true })
                const { pid, portalId, portalName } = params
                addObj.type === 0
                  ? router.replace(`/project/${pid}/portal/${portalId}/portalName/${portalName}`)
                  : router.replace(`/project/${pid}/portal/${portalId}/portalName/${portalName}/dashboard/${dashboardId}`)
              })
              break
            case 'edit':
              onEditDashboard('edit', editObj, () => { this.hideDashboardForm() })
              break
            case 'move':
              onEditDashboard('move', moveObj, () => { this.hideDashboardForm() })
              break
          }
        }
      })
    }
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
    }, () => {
      this.setState({
        exludeRoles: this.props.projectRoles.map((role) => {
          return {
            ...role,
            permission: true
          }
        })
      })
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

  private onShowDashboardForm (item, formType) {
    const { dashboards, params, onLoadDashboards } = this.props
    this.setState({
      formVisible: true,
      itemId: item.id
    }, () => {
      onLoadDashboards(params.portalId, (result) => {
        setTimeout(() => {
          const {
            config,
            id,
            name,
            parentId,
            type,
            index
          } = (result as any[]).find((g) => g.id === item.id)
          this.dashboardForm.props.form.setFieldsValue({
            id,
            folder: parentId ? `${(dashboards as any[]).find((g) => g.id === parentId).id}` : '0',
            config,
            name: formType === 'copy' ? `${name}_copy` : name,
          //  selectType: type === 1,
            selectType: type,
            index
          })
        }, 0)
      })

      const { onExcludeRoles, projectRoles } = this.props

      if (onExcludeRoles && item && item.id) {
        onExcludeRoles('dashboard', item.id, (result: number[]) => {
          this.setState({
            exludeRoles:  projectRoles.map((role) => {
              return result.some((re) => re === role.id) ? {...role, permission: false} : {...role, permission: true}
            })
          })
        })
      }
    })
  }


  private onOperateMore = (item, type) => {
    if (type === 'download') {
      this.props.onInitiateDownloadTask(item.id, item.type === 0 ? DownloadTypes.Folder : DownloadTypes.Dashboard, [])
    } else {
      this.setState({
        formType: type
      }, () => {
        this.onShowDashboardForm(item, this.state.formType)
      })
    }
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

  private handleTree = (clickKey, obj) => {
    const { expandedKeys } = this.state

    this.setState({
      autoExpandParent: false
    })

    if (obj.selected) {
      if (expandedKeys.indexOf(clickKey[0]) < 0) {
        expandedKeys.push(clickKey[0])
        this.setState({
          expandedKeys
        })
      } else {
        this.setState({
          expandedKeys: expandedKeys.filter((e) => e !== clickKey[0])
        })
      }
    } else {
      let currentKey = []
      if (expandedKeys.length === 0) {
        expandedKeys.push(obj.node.props.eventKey)
        currentKey = expandedKeys
      } else {
        currentKey = expandedKeys.filter((e) => e !== obj.node.props.title)
      }
      this.setState({
        expandedKeys: currentKey
      })
    }
  }

  private cancel = () => {
    const { router, params } = this.props
    router.replace(`/project/${params.pid}/vizs`)
  }

  private initCheckNodes = (checkedKeys) => {
    this.setState({
      checkedKeys
    })
  }

  private saveSplitSize = (newSize: number) => {
    localStorage.setItem('dashboardSplitSize', newSize.toString())
    this.setState({
      portalTreeWidth: newSize
    })
  }

  private changePermission = (scope: IExludeRoles, event) => {
    scope.permission = event.target.checked
    this.setState({
      exludeRoles: this.state.exludeRoles.map((role) => role && role.id === scope.id ? scope : role)
    })
  }

  public render () {
    const {
      params,
      dashboards,
      modalLoading,
      children,
      currentProject,
      portals,
      downloadList,
      onCheckUniqueName,
      onLoadDownloadList,
      onDownloadFile
    } = this.props

    const {
      formType,
      formVisible,
      searchValue,
      dashboardData,
      isGrid,
      searchVisible,
      checkedKeys,
      splitSize,
      portalTreeWidth
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
          splitWidth={portalTreeWidth || 190}
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

    let portalDec = ''
    if (portals) {
      portalDec = portals.find((p) => p.id === Number(params.portalId)).description
    }

    return (
      <div className={styles.portal}>
        <EditorHeader
          className={styles.portalHeader}
          currentType="dashboard"
          name={params.portalName}
          description={portalDec}
          downloadList={downloadList}
          onCancel={this.cancel}
          onLoadDownloadList={onLoadDownloadList}
          onDownloadFile={onDownloadFile}
        />
        <Helmet title={params.portalName} />
        <div className={styles.portalBody}>
          <Suspense fallback={null}>
            <SplitPane
              split="vertical"
              defaultSize={splitSize}
              minSize={this.defaultSplitSize}
              maxSize={this.maxSplitSize}
              onChange={this.saveSplitSize}
            >
              <div className={styles.portalTree} style={{ width: portalTreeWidth || 190 }}>
                <div className={styles.portalRow}>
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
                      onSelect={this.handleTree}
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
                      <img src={require('assets/images/noDashboard.png')} onClick={this.onAddItem}/>
                      <p>请创建文件夹或 Dashboard</p>
                    </div>
                  )
                }
              </div>
            </SplitPane>
          </Suspense>
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
            exludeRoles={this.state.exludeRoles}
            onCheckUniqueName={onCheckUniqueName}
            onChangePermission={this.changePermission}
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
  currentProject: makeSelectCurrentProject(),
  portals: makeSelectPortals(),
  projectRoles: makeSelectProjectRoles(),
  downloadList: makeSelectDownloadList()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDashboards: (portalId, resolve) => dispatch(loadDashboards(portalId, resolve)),
    onAddDashboard: (dashboard, resolve) => dispatch(addDashboard(dashboard, resolve)),
    onEditDashboard: (formType, dashboard, resolve) => dispatch(editDashboard(formType, dashboard, resolve)),
    onDeleteDashboard: (id, resolve) => dispatch(deleteDashboard(id, resolve)),
    onHideNavigator: () => dispatch(hideNavigator()),
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject)),
    onLoadPortals: (projectId) => dispatch(loadPortals(projectId)),
    onLoadProjectDetail: (id) => dispatch(loadProjectDetail(id)),
    onExcludeRoles: (type, id, resolve) => dispatch(excludeRoles(type, id, resolve)),
    onLoadProjectRoles: (id) => dispatch(loadProjectRoles(id)),
    onInitiateDownloadTask: (id, type, downloadParams?) => dispatch(initiateDownloadTask(id, type, downloadParams)),
    onLoadDownloadList: () => dispatch(loadDownloadList()),
    onDownloadFile: (id) => dispatch(downloadFile(id))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withReducer = injectReducer({ key: 'dashboard', reducer })
const withSaga = injectSaga({ key: 'dashboard', saga })

const withProjectReducer = injectReducer({ key: 'project', reducer: projectReducer })
const withProjectSaga = injectSaga({ key: 'project', saga: projectSaga })

const withPortalReducer = injectReducer({ key: 'portal', reducer: portalReducer })
const withPortalSaga = injectSaga({ key: 'portal', saga: portalSaga })

const withViewReducer = injectReducer({ key: 'view', reducer: viewReducer })
const withViewSaga = injectSaga({ key: 'view', saga: viewSaga })

export default compose(
  withReducer,
  withProjectReducer,
  withPortalReducer,
  withViewReducer,
  withSaga,
  withProjectSaga,
  withPortalSaga,
  withViewSaga,
  withConnect
)(Dashboard)
