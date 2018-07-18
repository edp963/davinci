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
import { Link, InjectedRouter } from 'react-router'

import { compose } from 'redux'
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'
import portalReducer from '../Portal/reducer'
import portalSaga from '../Portal/sagas'

import Container from '../../components/Container'
import DashboardForm from './components/DashboardForm'
import AntdFormType from 'antd/lib/form/Form'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Button = require('antd/lib/button')
const Icon = require('antd/lib/icon')
const Tooltip = require('antd/lib/tooltip')
const Popover = require('antd/lib/popover')
const Modal = require('antd/lib/modal')
const Breadcrumb = require('antd/lib/breadcrumb')
const Popconfirm = require('antd/lib/popconfirm')
const Input = require('antd/lib/input')
const Pagination = require('antd/lib/pagination')
const Menu = require('antd/lib/menu')

const Tree = require('antd/lib/tree').default
const TreeNode = Tree.TreeNode

const Search = Input.Search

import { loadDashboards, addDashboard, editDashboard, deleteDashboard } from './actions'
import { makeSelectDashboards, makeSelectModalLoading } from './selectors'
import { makeSelectLoginUser } from '../App/selectors'
import { makeSelectPortals } from '../Portal/selectors'
import { hideNavigator } from '../App/actions'
import { loadPortals } from '../Portal/actions'
import Grid from './Grid'

const utilStyles = require('../../assets/less/util.less')
const styles = require('./Dashboard.less')
const widgetStyles = require('../Widget/Widget.less')

interface IDashboardProps {
  modalLoading: boolean
  portals: any
  dashboards: IDashboard[]
  loginUser: { id: number, admin: boolean }
  router: InjectedRouter
  params: any
  onLoadDashboards: (portalId: number) => void
  onAddDashboard: (dashboard: IDashboard, resolve: () => void) => void
  onEditDashboard: (type: string, dashboard: IDashboard[], resolve: any) => void
  onDeleteDashboard: (id: number) => any
  onHideNavigator: () => void
  onLoadPortals: (projectId: number) => void
}

interface IDashboardStates {
  formType: 'add' | 'edit' | 'copy' | 'move' | ''
  formVisible: boolean
  filteredDashboards: IDashboard[]
  currentPage: number
  pageSize: number
  screenWidth: number
  expandedKeys: any,
  autoExpandParent: boolean
  searchValue: IDashboard[]
  dashboardData: any
  isSearch: boolean
  portalName: string
  isItemAction: boolean
  itemId: number,
  dataList: any[],
  isExpand: boolean
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

declare interface IObjectConstructor {
  assign (...objects: object[]): object
}

export class Dashboard extends React.Component<IDashboardProps, IDashboardStates> {
  constructor (props) {
    super(props)
    this.state = {
      formType: '',
      formVisible: false,

      filteredDashboards: null,
      currentPage: 1,
      pageSize: 24,
      screenWidth: 0,
      expandedKeys: [],
      autoExpandParent: false,
      searchValue: [],
      dashboardData: [],
      isSearch: false,
      portalName: '',
      isItemAction: true,
      itemId: 0,
      dataList: [],
      isExpand: true
    }
  }

  private mouseout: any
  private dashboardForm: AntdFormType = null
  private refHandlers = {
    dashboardForm: (ref) => this.dashboardForm = ref
  }

  public componentWillMount () {
    const { params } = this.props
    this.props.onLoadDashboards(params.portalId)
    this.props.onHideNavigator()
    this.setState({ screenWidth: document.documentElement.clientWidth })
    this.props.onLoadPortals(params.pid)
  }

  // list 转成树形json
  private listToTree = (list, parentId) => {
    const ret = []
    for (const i in list) {
      if (list[i].parentId === parentId) {
        list[i].children = this.listToTree(list, list[i].id)
        ret.push(list[i])
      }
    }
    return ret
  }

  public componentWillReceiveProps (nextProps) {
    window.onresize = () => this.setState({ screenWidth: document.documentElement.clientWidth })
    const { dashboards, portals } = nextProps
    const { params } = this.props
    if (dashboards) {
      this.setState({
        dashboardData: this.listToTree(dashboards, 0)
      })
      this.expandAll(dashboards)
    }
    if (portals) {
      this.setState({
        portalName: (portals.find((p) => p.id === Number(params.portalId))).name
      })
    }
  }

  private toGrid = (dashboardId) => {
    const { params } = this.props
    // this.props.router.push(`/project/${params.pid}/dashboard/${dashboard.id}`)
    this.props.router.push(`/project/${params.pid}/portal/${params.portalId}/dashboard/${dashboardId}`)
  }

  private hideDashboardForm = () => {
    this.setState({
      formVisible: false
    }, () => {
      this.dashboardForm.props.form.resetFields()
    })
  }

  // private stopPPG = (e) => {
  //   e.stopPropagation()
  // }

  private onModalOk = () => {
    this.dashboardForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { dashboards, params, onEditDashboard, onAddDashboard } = this.props
        const { formType } = this.state
        const { id, name, folder, selectType } = values

        const dashArr = folder === '0'
          ? dashboards.filter((d) => d.parentId === 0)
          : dashboards.filter((d) => d.parentId === Number(folder))

        const indextemp = dashArr.length === 0 ? 0 : dashArr[dashArr.length - 1].index + 1
        const obj = {
          config: '',
          dashboardPortalId: Number(params.portalId),
          name,
          type: selectType ? 1 : 0
        }

        const addObj = (Object as IObjectConstructor).assign({}, obj, {
          parentId: Number(folder),
          index: indextemp
        })
        const editObj = [(Object as IObjectConstructor).assign({}, obj, {
          parentId: Number(folder),
          id,
          index: indextemp
        })]

        const currentArr = dashboards.filter((d) => d.parentId === Number(folder))
        const moveObj = [(Object as IObjectConstructor).assign({}, obj, {
          parentId: Number(folder),
          id,
          index: currentArr.length ? currentArr[currentArr.length - 1].index + 1  : 0
        })]

        switch (formType) {
          case 'add':
            onAddDashboard(addObj, () => { this.hideDashboardForm() })
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

  private onChange = (page) => {
    this.setState({
      currentPage: page
    })
  }

  private onShowSizeChange = (currentPage, pageSize) => {
    this.setState({
      currentPage,
      pageSize
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
    // let dragObj
    loop(data, dragKey, (item, i, arr) => {
      arr.splice(i, 1)

      const { config, dashboardPortalId, id, name, type } = item

      let value = []
      if (info.dropToGap) {
        const dropObj = dashboards.find((d) => d.id === Number(dropKey))

        const partArr = Number(dropObj.parentId) === 0
          ? dashboards.filter((d) => d.parentId === 0)
          : (dashboards.find((d) => d.id === Number(dropObj.parentId))).children

        const othersArr = partArr.filter((p) => p.index >= dropObj.index)
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
          index: dropObj.index,
          name,
          parentId: dropObj.parentId,
          type
        })
      } else {
        const currentObj = dashboards.find((d) => d.id === Number(dropKey))
        if (currentObj.type === 0) {
          const currentArr = currentObj.children
          value = [{
            config,
            dashboardPortalId,
            id,
            index: currentArr.length ? currentArr[currentArr.length - 1].index + 1  : 0,
            name,
            parentId: Number(dropKey),
            type
          }]
        } else {
          value = [item]
        }
      }
      this.props.onEditDashboard('move', value, (result) => {
        // dragObj = result
      })
    })

    this.setState({
      dashboardData: data
    })
  }

  private onFilterItem = () => {
    this.setState({
      isSearch: !this.state.isSearch
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

  private onSelect = (id) => (e) => {
    console.log('onSelect', id)
    this.toGrid(id)

  }

  private onRightClick = () => {
    console.log('onRightClick')
  }

  private onItemAction = (id) => (e) => {
    const { isItemAction, itemId } = this.state
    this.setState({
      itemId: id,
      isItemAction: itemId === id ? !isItemAction : true
    })
  }

  private onShowDashboardForm (itemId) {
    const { dashboards } = this.props
    this.setState({
      formVisible: true,
      isItemAction: false
    }, () => {
      const {
        config,
        id,
        name,
        parentId,
        type
      } = (dashboards as any[]).find((g) => g.id === itemId)
      this.dashboardForm.props.form.setFieldsValue({
        id,
        folder: parentId ? `${(dashboards as any[]).find((g) => g.id === parentId).id}` : '0',
        config,
        name,
        selectType: type === 1
      })
    })
  }

  private onEdit = (itemId) => () => {
    this.setState({
      formType: 'edit'
    })
    this.onShowDashboardForm(itemId)
  }

  private onCopy = (itemId) => () => {
    this.setState({
      formType: 'copy'
    })
    this.onShowDashboardForm(itemId)
  }

  private onMove = (itemId) => () => {
    this.setState({
      formType: 'move'
    })
    this.onShowDashboardForm(itemId)
  }

  private searchDashboard = (e) => {
    const { dashboards } = this.props
    const { value } = e.target
    this.setState({
      searchValue: value ? dashboards.filter((d) => d.name.includes(value)) : []
    })
  }

  public render () {
    const {
      params,
      dashboards,
      loginUser,
      onDeleteDashboard,
      modalLoading
    } = this.props
    console.log('dashboards', dashboards)

    const {
      formType,
      formVisible,
      filteredDashboards,
      currentPage,
      pageSize,
      screenWidth,
      searchValue,
      expandedKeys,
      autoExpandParent,
      isSearch,
      dashboardData,
      portalName,
      isItemAction,
      itemId,
      isExpand
    } = this.state

    const dashboardsArr = filteredDashboards || dashboards

    const items = searchValue.map((s) => <li key={s.id} onClick={this.onSelect(s.id)}>{s.name}</li>)

    const pagination = dashboardsArr && (
      <Pagination
        simple={screenWidth < 768 || screenWidth === 768}
        className={widgetStyles.paginationPosition}
        showSizeChanger
        onShowSizeChange={this.onShowSizeChange}
        onChange={this.onChange}
        total={dashboardsArr.length}
        defaultPageSize={24}
        pageSizeOptions={['24', '48', '72', '96']}
        current={currentPage}
      />
    )

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
        保 存
      </Button>
    )]

    const loop = (data) => data.map((item) => {
      // const index = item.key.search(searchValue)
      // const beforeStr = item.key.substr(0, index)
      // const afterStr = item.key.substr(index + searchValue.length)
      // const title = index > -1 ? (
      //   <span>
      //     <Icon type="folder" />
      //     {beforeStr}
      //     <span style={{ color: '#f50' }}>{searchValue}</span>
      //     {afterStr}
      //   </span>
      // ) : <span><Icon type="file" />{item.key}</span>

      const ulAction = (
        <ul className={styles.menu}>
          <li onClick={this.onEdit(item.id)}><Icon type="edit" /> 编辑</li>
          <li onClick={this.onCopy(item.id)} className={item.type === 0 ? styles.popHide : ''}>
            <Icon type="copy" /> 复制
          </li>
          <li onClick={this.onMove(item.id)}>
            <Icon type="swap" className={styles.swap} /> 移动
          </li>
          <li>
            <Popconfirm placement="bottom" title="确定删除吗？" okText="Yes" cancelText="No" onConfirm={onDeleteDashboard(item.id)}>
              <Icon type="delete" /> 删除
            </Popconfirm>
          </li>
        </ul>
      )
      const icon = (
        <Icon
          type="ellipsis"
          // style={{ marginLeft: '10px' }}
          className={styles.more}
          onClick={this.onItemAction(item.id)}
        />
      )

      const temp = (
        <span>
          <Tooltip placement="right" title="更多">
            {
              item.type === 0
                ? <span className={styles.dashboardTitle}>item.name</span>
                : <span onClick={this.onSelect(item.id)} className={styles.dashboardTitle}>
                    {/* <Icon type={item.type === 0 ? 'folder' : 'file'} /> */}
                    {item.name}
                  </span>
            }
          </Tooltip>
          <Popover
            placement="bottomRight"
            content={ulAction}
            trigger="click"
          >
            {icon}
          </Popover>
        </span>
      )

      if (item.type === 0) {
        return (
          <TreeNode key={item.id} title={temp}>
            {loop(item.children)}
          </TreeNode>
        )
      }
      return <TreeNode key={item.id} title={temp} />
    })

    return (
      <Container>
        <Helmet title="Dashboard" />
        <Container.Title>
          <Row>
            <Col xl={18} lg={18} md={16} sm={12} xs={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link to="">
                    Dashboard
                  </Link>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
        </Container.Title>
        <Container.Body card>
          <div className={styles.dashboardBody}>
            <div className={styles.dashboardTree}>
              <Row className={styles.portal}>
              <span className={styles.portalTitle}>{portalName}</span>
              <span className={styles.portalAction}>
                <Popover
                  placement="bottom"
                  content={
                    <div className={styles.dashboardSearch}>
                      <Search
                        placeholder="Search"
                        onChange={this.searchDashboard}
                      />
                      <ul>
                        {items}
                      </ul>
                    </div>}
                  trigger="click"
                >
                  <Tooltip placement="top" title="搜索">
                    <Icon
                      type="search"
                      className={styles.search}
                      onClick={this.onFilterItem}
                    />
                  </Tooltip>
                </Popover>
                <Tooltip placement="top" title="新增">
                  <Icon
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
            </Row>
            { dashboardData.length
              ? <Tree
                  // showIcon
                  showLine
                  onExpand={this.onExpand}
                  expandedKeys={this.state.expandedKeys}
                  // autoExpandParent="false"
                  draggable
                  // onSelect={this.onSelect}
                  onRightClick={this.onRightClick}
                  onDrop={this.onDrop}
              >
                {loop(dashboardData)}
              </Tree>
              : 'loading tree'
            }
            </div>
            <div className={styles.gridClass}>
              <Row gutter={20}>
                <div
                  // className={itemClass}
                  // onClick={this.toGrid(d)}
                />
                {/* <Grid /> */}
              </Row>
            </div>
          </div>
          <Row>
            {/* {pagination} */}
          </Row>
        </Container.Body>
        <Modal
          title={`${formType === 'add' ? '新增' : '修改'} Dashboard`}
          wrapClassName="ant-modal-small"
          visible={formVisible}
          footer={modalButtons}
          onCancel={this.hideDashboardForm}
        >
          <DashboardForm
            type={formType}
            dashboards={dashboards}
            portalId={params.portalId}
            wrappedComponentRef={this.refHandlers.dashboardForm}
          />
        </Modal>
      </Container>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  dashboards: makeSelectDashboards(),
  loginUser: makeSelectLoginUser(),
  modalLoading: makeSelectModalLoading(),
  portals: makeSelectPortals()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDashboards: (portalId) => dispatch(loadDashboards(portalId)),
    onAddDashboard: (dashboard, resolve) => dispatch(addDashboard(dashboard, resolve)),
    onEditDashboard: (formType, dashboard, resolve) => dispatch(editDashboard(formType, dashboard, resolve)),
    onDeleteDashboard: (id) => () => dispatch(deleteDashboard(id)),
    onHideNavigator: () => dispatch(hideNavigator()),
    onLoadPortals: (projectId) => dispatch(loadPortals(projectId))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withReducer = injectReducer({ key: 'dashboard', reducer })
const withSaga = injectSaga({ key: 'dashboard', saga })

const withReducerPortal = injectReducer({ key: 'portal', reducer: portalReducer })
const withSagaPortal = injectSaga({ key: 'portal', saga: portalSaga })

export default compose(
  withReducer,
  withReducerPortal,
  withSaga,
  withSagaPortal,
  withConnect
)(Dashboard)
