/*
 *
 * Schedule
 *
 */

import React, { createRef } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { Link } from 'react-router'
import Container from 'components/Container'
import moment from 'moment'
import { createStructuredSelector } from 'reselect'

import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'
import widgetReducer from '../Widget/reducer'
import widgetSaga from '../Widget/sagas'
import { makeSelectCurrentProject } from '../Projects/selectors'
import { makeSelectSchedule, makeSelectDashboards, makeSelectCurrentDashboard, makeSelectWidgets, makeSelectTableLoading, makeSelectFormLoading, makeSelectVizs } from './selectors'
import { promiseDispatcher } from 'utils/reduxPromisation'
import ScheduleForm from './ScheduleForm'
import ConfigFormWrapper, { ConfigForm } from './ConfigForm'

import { loadDashboardDetail, loadDashboards } from '../Dashboard/actions'
import { loadSchedules, addSchedule, deleteSchedule, changeSchedulesStatus, updateSchedule, loadVizs } from './actions'
import { loadWidgets } from '../Widget/actions'
import Box from 'components/Box'

import { Modal, Row, Col, Table, Button, Tooltip, Icon, Popconfirm, Breadcrumb } from 'antd'
import { ButtonProps } from 'antd/lib/button/button'
import { PaginationProps } from 'antd/lib/pagination'
import { WrappedFormUtils } from 'antd/lib/form/Form'
const utilStyles = require('assets/less/util.less')
import ModulePermission from '../Account/components/checkModulePermission'
import { IProject } from '../Projects'

interface ICurrentDashboard {
  config: string
  create_by: number
  desc: string
  id: number
  linkage_detail: string
  name: string
  pic: string
  publish: boolean
  widgets: any[]
}

interface IEmailConfig {
  subject?: string
  to?: string
  cc?: string
  bcc?: string
  type?: 'image' | 'excel'
}
interface IScheduleProps {
  widgets: boolean | any[]
  params: any
  schedule: boolean | any[]
  dashboards: boolean | any[]
  tableLoading: boolean
  formLoading: boolean
  currentProject: IProject
  vizs: any
  onAddSchedule: (param: object, resolve: any) => any
  onLoadWidgets: (pid: number) => any
  onLoadVizs: (pid: number) => any
  onLoadSchedules: (pid: number) => any
  onLoadDashboards: () => any
  onDeleteSchedule: (id: number) => any
  onUpdateSchedule: (param: object, resolve: any) => any
  currentDashboard: null | ICurrentDashboard
  onLoadDashboardDetail: (key: number) => any
  onChangeCurrentJobStatus: (id: number, status: string) => any
}

interface IScheduleStates {
  emailConfig: IEmailConfig
  formType: string,
  tableSource: any[],
  configType: string,
  dashboardTree: any[],
  formVisible: boolean,
  configVisible: boolean,
  dashboardTreeValue: any[],
  rangeTime: string,
  screenWidth: number
}

export class Schedule extends React.Component<IScheduleProps, IScheduleStates> { // eslint-disable-line react/prefer-stateless-function
  constructor (props) {
    super(props)
    this.state = {
      emailConfig: {},
      formType: 'add',
      tableSource: [],
      configType: 'add',
      dashboardTree: [],
      formVisible: false,
      configVisible: false,
      dashboardTreeValue: [],
      rangeTime: 'Minute',
      screenWidth: 0
    }
  }

  private scheduleForm: WrappedFormUtils = null
  private configForm = createRef<ConfigForm>()

  public componentWillMount () {
    const {pid} = this.props.params
    this.props.onLoadWidgets(pid)
    this.props.onLoadVizs(pid)
    // this.props.onLoadDashboards().then(() => {
    //   console.log('then')
    //   const {dashboards} = this.props
    //   const initDashboardTree = (dashboards as any[]).map((dashboard) => ({
    //     ...dashboard,
    //     ...{
    //       label: dashboard.name,
    //       key: dashboard.id,
    //       value: `${dashboard.id}(d)`,
    //       type: 'dashboard'
    //     }
    //   }))
    //   this.setState({
    //     dashboardTree: initDashboardTree,
    //     screenWidth: document.documentElement.clientWidth
    //   })
    // })
    this.props.onLoadSchedules(pid)
  }

  public componentWillReceiveProps (props) {
    window.onresize = () => this.setState({ screenWidth: document.documentElement.clientWidth })

    if (props.schedule) {
      this.setState({
        tableSource: props.schedule.map((g) => {
          g.key = g.id
          return g
        })
      })
    }
  }

  private showAdd = () => {
    this.setState({
      formVisible: true,
      formType: 'add'
    })
  }

  private showDetail = (scheduleId) => () => {
    this.setState({
      formVisible: true,
      formType: 'edit'
    }, () => {
      const { id, name, description, config } = (this.props.schedule as any[]).find((s) => s.id === scheduleId)
      const config2json = JSON.parse(config)
      const { time_range, range, contentList, month, hour, week, minute, time } = config2json
      const formatterContentList = this.json2arr(contentList)
      this.setState({
        emailConfig: config2json,
        dashboardTreeValue: formatterContentList
      })
      let momentRange = []
      if (range) {
        momentRange = range.map((ra) => moment(ra))
      }
      this.setState({
        rangeTime: time_range
      }, () => this.scheduleForm.setFieldsValue({ id, name, description, range: momentRange, time_range, month, hour, week, minute, time: moment(time) })
      )
    })
  }

  private onScheduleOk = () => {
    const { pid } = this.props.params
    const { onAddSchedule, onUpdateSchedule } = this.props
    this.scheduleForm.validateFieldsAndScroll((err, values) => {
      const { emailConfig } = this.state
      if (!err) {
        const startDate = values.range && values.range[0] ? values.range[0] : ''
        const endDate = values.range && values.range[1] ? values.range[1] : ''
        if (values && values.config) {
          emailConfig['time_range'] = values.time_range
          emailConfig['minute'] = values.minute
          emailConfig['month'] = values.month
          emailConfig['hour'] = values.hour
          emailConfig['week'] = values.week
          emailConfig['time'] = values.time
          emailConfig['range'] = values.range
        //  emailConfig['contentList'] = this.arr2json(JSON.parse(values.config)['contentList'])
        }
        const valueTime = moment(values.time).format('HH:mm')
        const formatterValueTime = valueTime.split(':')
        const HH = formatterValueTime[0]
        const mm = formatterValueTime[1]
        let cronPatten = ''
        if (values) {
          let minute = '0'
          let hour = '*'
          if (values.time) {
            minute = mm.replace(/\b(0)/gi, '')
            hour = HH.replace(/\b(0)/gi, '')
          }
          if (values.hour) {
            minute = values.hour
            hour = '*'
          }
          if (values.week === undefined && values.month === undefined) {
            values.month = '*'
            values.week = '?'
          }
          if (values.month && '*?'.indexOf(values.month) < 0 && values.week === undefined) {
            values.week = '?'
          }
          if (values.week && '*?'.indexOf(values.week) < 0 && values.month === undefined) {
            values.month = '?'
          }
          if (values.minute) {
            minute = `*/${values.minute}`
          }
          cronPatten = `0 ${minute} ${hour} ${values.month} * ${values.week}`   // '0 * * * * ?'
        }
        this.setState({
          emailConfig
        }, () => {
          for (const i in emailConfig) {
            if (!emailConfig[i]) {
              delete emailConfig[i]
            }
          }
          values.config = JSON.stringify(emailConfig)
          const params = {
            ...values,
            ...{
              projectId: pid,
              startDate: moment(startDate).format('YYYY-MM-DD HH:mm:ss'),
              endDate: moment(endDate).format('YYYY-MM-DD HH:mm:ss'),
              cronExpression: cronPatten
            }
          }
          if (this.state.formType === 'add') {
            onAddSchedule(params, () => {
              this.hideForm()
            })
          } else {
            onUpdateSchedule(params, () => {
              this.hideForm()
              this.props.onLoadSchedules(pid)
            })
          }
        })
      }
    })
  }

  private arr2json = (arr) => {
    const { vizs } = this.props
    const result = arr.map((a) => {
      if (a === 'display') {
        const children =  vizs.find((viz) => viz.contentType === 'display')['children']
        return children.map((child) => ({
          contentType: child.contentType,
          id: child.id
        }))
      }
      if (a === 'portal') {
        const children =  vizs.find((viz, index) => viz.contentType === 'portal')['children']
        return this.getIdByArray(children)
      }
      if (a.indexOf('(p)') > -1) {
        const id = parseInt(a.replace('(p)', ''), 10)
        const children = vizs.find((viz, index) => viz.contentType === 'portal')['children']
        const arr = this.getCurrentListById(children, id)
        return this.getIdByArray(arr)
      } else {
        return {
          id: parseInt(a.replace('(d)', ''), 10),
          contentType: 'display'
        }
      }
    })
    return result
  }
  private getCurrentListById = (array, id) => {
    const ret = []
    function loop (array) {
      for (let i = 0; i < array.length; i++) {
        const arr = array[i]
        if (arr && arr.children) {
          loop(arr.children)
        }
        if (arr && arr.id === id) {
          ret.push(arr)
        }
      }
    }
    loop(array)
    return ret
  }
  private getIdByArray = (array) => {
    const ret = []
    function loop (a) {
      a.forEach((arr) => {
        if (arr && arr.children) {
          loop(arr.children)
        }
        if (arr && arr.type === 1) {
          ret.push({
            contentType: arr.contentType,
            id: arr.id
          })
        }
      })
    }
    loop(array)
    return ret
  }
  private json2arr = (json) => json.map((js) => `${js.id}(${js.contentType.substr(0, 1)})`)

  private onConfigModalOk = () => {
    this.configForm.current.props.form.validateFieldsAndScroll((err, values) => {
      const { dashboardTreeValue } = this.state
      if (!err) {
        const emailConfigData = {
          ...values,
          ...{contentList: bootstrap(this.arr2json(dashboardTreeValue))}
        }
        this.setState({
          emailConfig: emailConfigData
        }, () => this.hideConfigForm())
      }
    })
    function bootstrap (arr) {
      const result = []
      if (arr && arr.length) {
        arr.map((a, index) => {
          if (Array.isArray(a)) {
            a.forEach((o) => result.push(o))
          } else {
            result.push(a)
          }
        })
      }
      return result
    }
  }
  private hideForm = () => {
    this.setState({
      formVisible: false,
      emailConfig: {}
    }, () => this.scheduleForm.resetFields())
  }

  private hideConfigForm = () => {
    this.setState({
      configVisible: false,
      dashboardTreeValue: []
    }, () => this.configForm.current.props.form.resetFields())
  }

  private showConfig = () => {
    const { emailConfig } = this.state
    const jsonStringify = JSON.stringify(emailConfig)
    this.setState({
      configVisible: true,
      configType: 'add'
    }, () => {
      setTimeout(() => {
        if (jsonStringify && jsonStringify.length > 2) {
          const { to, cc, subject, bcc, type } = emailConfig
          this.configForm.current.props.form.setFieldsValue({to, cc, subject, bcc, type})
        }
      }, 0)
    })
  }

  private onTreeSelect = (f) => f

  private onTreeChange = (value) => {
   // let triggerData = extra.triggerNode.props
    console.log(value)
    this.setState({
      dashboardTreeValue: value
    })
  }

  private onLoadTreeData = (treeNode) => {
    console.log('onloadtreedata')
    const eventKey = treeNode.props.eventKey
    return new Promise((resolve) => {
      this.props.onLoadDashboardDetail(eventKey).then(() => {
        const { currentDashboard, widgets } = this.props
        const { dashboardTree } = this.state
        const widgetFilter = (dashboardName) => currentDashboard.widgets.map((widget) => ({
          ...widget,
          ...{
            label: `${dashboardName} / ${(widgets as any[]).find((wi) => wi.id === widget.widget_id)['name']}`,
            key: widget.id,
            value: `${widget.id}(w)`,
            type: 'widget',
            isLeaf: true
          }
        }))
        const dashboardTreeChildren = dashboardTree.map((tree) => {
          if (`${tree.key}` === eventKey) {
            return {
              ...tree,
              ...{
                children: widgetFilter(tree.name)
              }
            }
          } else {
            return tree
          }
        })
        this.setState({
          dashboardTree: dashboardTreeChildren
        })
      })
      resolve()
    })
  }

  private onChangeRange = (value: string) => {
    const rangeArr = ['minute', 'month', 'hour', 'week', 'time']
    this.setState({
      rangeTime: value
    })
    rangeArr.map((range) => {
      if (range === 'time') {
        return range
      } else {
        this.scheduleForm.setFieldsValue({
          [range]: undefined
        })
      }
    })
  }

  private formatStatusIcon = (status) => {
    switch (status) {
      case 'new':
        return 'caret-right'
      case 'failed':
        return 'reload'
      case 'started':
        return 'pause'
      case 'stopped':
        return 'caret-right'
      default:
        return 'caret-right'
    }
  }

  private formatStatusText = (status) => {
    const emunObj = {
      new: '启动',
      failed: '重启',
      started: '暂停',
      stopped: '启动'
    }
    return emunObj[status]
  }

  private changeStatus = (record) => () => {
    const { id, jobStatus } = record
    const { onChangeCurrentJobStatus } = this.props
    onChangeCurrentJobStatus(id, jobStatus)
  }

  public render () {
    const {
      formType,
      configType,
      tableSource,
      formVisible,
      configVisible,
      dashboardTree,
      dashboardTreeValue
      // screenWidth
    } = this.state
    const {
      onDeleteSchedule,
      currentProject,
      tableLoading,
      formLoading,
      vizs
    } = this.props
    const pagination: PaginationProps = {
     // simple: screenWidth < 768 || screenWidth === 768,
      defaultPageSize: 20,
      showSizeChanger: true,
      total: tableSource.length
    }
    const ProviderButton = ModulePermission<ButtonProps>(currentProject, 'schedule', true)(Button)
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'desc'
      },
      {
        title: '类型',
        dataIndex: 'jobType',
        key: 'job_type'
      },
      {
        title: '开始时间',
        dataIndex: 'startDate',
        key: 'start_date'
      },
      {
        title: '结束时间',
        dataIndex: 'endDate',
        key: 'end_date'
      },
      {
        title: '状态',
        dataIndex: 'jobStatus',
        key: 'job_status'
      },
      {
        title: '操作',
        key: 'action',
        width: 150,
        className: `${utilStyles.textAlignCenter}`,
        render: (text, record) => (
          <span className="ant-table-action-column">
            <Tooltip title={`${this.formatStatusText(record.jobStatus)}`}>
              <Button icon={this.formatStatusIcon(record.jobStatus)} shape="circle" type="ghost" onClick={this.changeStatus(record)} />
            </Tooltip>
            <Tooltip title="修改">
              <Button icon="edit" shape="circle" type="ghost" onClick={this.showDetail(record.id)} />
            </Tooltip>
            <Popconfirm
              title="确定删除？"
              placement="bottom"
              onConfirm={onDeleteSchedule(record.id)}
            >
              <Tooltip title="删除">
                <Button icon="delete" shape="circle" type="ghost" />
              </Tooltip>
            </Popconfirm>
          </span>
      )
      }]

    const scheduleButtons = ([
      (
        <Button
          key="back"
          size="large"
          onClick={this.hideForm}
        >
          取 消
        </Button>
      ),
      (
        <Button
          key="submit"
          size="large"
          type="primary"
          loading={formLoading}
          disabled={formLoading}
          onClick={this.onScheduleOk}
        >
          保 存
        </Button>
      )
    ])

    const configModalButtons = ([
      (
        <Button
          key="back"
          size="large"
          onClick={this.hideConfigForm}
        >
          取 消
        </Button>
      ),
      (
        <Button
          key="submit"
          size="large"
          type="primary"
          onClick={this.onConfigModalOk}
        >
          保 存
        </Button>
      )
    ])
    const currentProjectId = currentProject && currentProject.id ? currentProject.id : void 0
    return (
      <Container>
        <Helmet title="Schedule" />
        <Container.Title>
          <Row>
            <Col span={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link to="">Schedule</Link>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
        </Container.Title>
        <Container.Body>
          <Box>
            <Box.Header>
              <Box.Title>
                <Icon type="bars" />Schedule List
              </Box.Title>
              <Box.Tools>
                <Tooltip placement="bottom" title="新增">
                  <ProviderButton type="primary" icon="plus" onClick={this.showAdd} />
                </Tooltip>
              </Box.Tools>
            </Box.Header>
            <Box.Body>
              <Row>
                <Col span={24}>
                  <Table
                    dataSource={tableSource}
                    columns={columns}
                    pagination={pagination}
                    loading={tableLoading}
                    bordered
                  />
                </Col>
              </Row>
              <Modal
                title={`${formType === 'add' ? '新增' : '修改'}schedule`}
                maskClosable={false}
                visible={formVisible}
                footer={scheduleButtons}
                onCancel={this.hideForm}
              >
                <ScheduleForm
                  type={formType}
                  projectId={currentProjectId}
                  rangeTime={this.state.rangeTime}
                  changeRange={this.onChangeRange}
                  configValue={JSON.stringify(this.state.emailConfig)}
                  onShowConfig={this.showConfig}
                  ref={(f) => { this.scheduleForm = f }}
                />
              </Modal>

              <Modal
                title={`${configType === 'add' ? '新增' : '修改'}config`}
                wrapClassName="ant-modal-large"
                maskClosable={false}
                visible={configVisible}
                footer={configModalButtons}
                onCancel={this.hideConfigForm}
              >
                <ConfigFormWrapper
                  type={configType}
                  vizs={vizs}
                  dashboardTree={dashboardTree}
                  treeSelect={this.onTreeSelect}
                  treeChange={this.onTreeChange}
                  loadTreeData={this.onLoadTreeData}
                  dashboardTreeValue={dashboardTreeValue}
                  wrappedComponentRef={this.configForm}
                />
              </Modal>
            </Box.Body>
          </Box>
        </Container.Body>
      </Container>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  widgets: makeSelectWidgets(),
  schedule: makeSelectSchedule(),
  dashboards: makeSelectDashboards(),
  currentDashboard: makeSelectCurrentDashboard(),
  currentProject: makeSelectCurrentProject(),
  tableLoading: makeSelectTableLoading(),
  formLoading: makeSelectFormLoading(),
  vizs: makeSelectVizs()
})

function mapDispatchToProps (dispatch) {
  return {
    onLoadVizs: (pid) => dispatch(loadVizs(pid)),
    onLoadWidgets: (pid) => dispatch(loadWidgets(pid)),
    onLoadSchedules: (pid) => dispatch(loadSchedules(pid)),
    onLoadDashboards: () => promiseDispatcher(dispatch, loadDashboards),
    onAddSchedule: (schedule, resolve) => dispatch(addSchedule(schedule, resolve)),
    onUpdateSchedule: (schedule, resolve) => dispatch(updateSchedule(schedule, resolve)),
    onLoadDashboardDetail: (id) => promiseDispatcher(dispatch, loadDashboardDetail, id),
    onDeleteSchedule: (id) => () => dispatch(deleteSchedule(id)),
    onChangeCurrentJobStatus: (id, currentStatus) => dispatch(changeSchedulesStatus(id, currentStatus))
  }
}

const withConnect = connect<{}, {}, IScheduleProps>(mapStateToProps, mapDispatchToProps)

const withReducerSchedule = injectReducer({ key: 'schedule', reducer })
const withSagaSchedule = injectSaga({ key: 'schedule', saga })

const withReducerWidget = injectReducer({ key: 'widget', reducer: widgetReducer })
const withSagaWidget = injectSaga({ key: 'widget', saga: widgetSaga })

// const withReducerDashboard = injectReducer({ key: 'dashboard', reducer: dashboardReducer })
// const withSagaDashboard = injectSaga({ key: 'dashboard', saga: dashboardSaga })

export default compose(
  withReducerSchedule,
  withReducerWidget,
  // withReducerDashboard,
  withSagaSchedule,
  withSagaWidget,
  // withSagaDashboard,
  withConnect
)(Schedule)
