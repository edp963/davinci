/*
 *
 * Schedule
 *
 */

import * as React from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { Link } from 'react-router'
import Container from '../../components/Container'
import moment from 'moment'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import { createStructuredSelector } from 'reselect'
import {makeSelectSchedule, makeSelectDashboards, makeSelectCurrentDashboard, makeSelectWidgets} from './selectors'
import { promiseDispatcher } from '../../utils/reduxPromisation'
import ScheduleForm from './ScheduleForm'
import ConfigForm from './ConfigForm'

import {loadDashboardDetail, loadDashboards} from '../Dashboard/actions'
import { loadSchedules, addSchedule, deleteSchedule, changeSchedulesStatus, updateSchedule } from './actions'
import {loadWidgets} from '../Widget/actions'
import Box from '../../components/Box'

const Modal =  require ('antd/lib/modal')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Table = require('antd/lib/table')
const Button = require('antd/lib/button')
const Tooltip = require('antd/lib/tooltip')
const Icon = require('antd/lib/icon')
const Popconfirm = require('antd/lib/popconfirm')
const Breadcrumb = require('antd/lib/breadcrumb')
const utilStyles = require('../../assets/less/util.less')
import { PaginationProps } from 'antd/lib/pagination'


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

interface IScheduleProps {
  widgets: boolean | any[]
  schedule: boolean | any[]
  dashboards: boolean | any[]
  onAddSchedule: (param: object) => any
  onLoadWidgets: () => any
  onLoadSchedules: () => any
  onLoadDashboards: () => any
  onDeleteSchedule: (id: number) => any
  onUpdateSchedule: (param: object) => any
  currentDashboard: null | ICurrentDashboard
  onLoadDashboardDetail: (key: number) => any
  onChangeCurrentJobStatus: (id: number, status: string) => any
}

interface IScheduleStates {
  emailConfig: {to?: any, cc?: any, subject?: any, bcc?: any}
  formType: string,
  tableSource: any[],
  configType: string,
  dashboardTree: any[],
  formVisible: boolean,
  tableLoading: boolean,
  modalLoading: boolean,
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
      tableLoading: false,
      modalLoading: false,
      configVisible: false,
      dashboardTreeValue: [],
      rangeTime: 'Minute',
      screenWidth: 0
    }
  }

  private scheduleForm: WrappedFormUtils = null
  private configForm: WrappedFormUtils = null

  public componentWillMount () {
    this.props.onLoadWidgets()
    this.props.onLoadDashboards().then(() => {
      const {dashboards} = this.props
      const initDashboardTree = (dashboards as any[]).map((dashboard) => ({
        ...dashboard,
        ...{
          label: dashboard.name,
          key: dashboard.id,
          value: `${dashboard.id}(d)`,
          type: 'dashboard'
        }
      }))
      this.setState({
        dashboardTree: initDashboardTree,
        screenWidth: document.documentElement.clientWidth
      })
    })
    this.setState({ tableLoading: true })
    this.props.onLoadSchedules()
      .then(() => {
        this.setState({ tableLoading: false })
      })
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
      const { id, name, desc, config } = (this.props.schedule as any[]).find((s) => s.id === scheduleId)
      const config2json = JSON.parse(config)
      const { time_range, range, contentList, month, hour, week, time } = config2json
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
      }, () => this.scheduleForm.setFieldsValue({ id, name, desc, range: momentRange, time_range, month, hour, week, time: moment(time) })
      )
    })
  }

  private onScheduleOk = () => {
    const { onAddSchedule, onUpdateSchedule } = this.props
    this.scheduleForm.validateFieldsAndScroll((err, values) => {
      const { emailConfig } = this.state
      if (!err) {
        this.setState({ modalLoading: true })
        const startDate = values.range && values.range[0] ? values.range[0] : ''
        const endDate = values.range && values.range[1] ? values.range[1] : ''
        if (values && values.config) {
          emailConfig['time_range'] = values.time_range
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
          cronPatten = `${minute} ${hour} ${values.month ? values.month : '*'} * ${values.week ? values.week : '*'} ?`   // '0 * * * * ?'
        }
        this.setState({
          emailConfig: emailConfig
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
              start_date: moment(startDate).format('YYYY-MM-DD HH:mm:ss'),
              end_date: moment(endDate).format('YYYY-MM-DD HH:mm:ss'),
              cron_pattern: cronPatten
            }
          }
          if (this.state.formType === 'add') {
            onAddSchedule(params).then(() => this.hideForm())
          } else {
            onUpdateSchedule(params).then(() => this.hideForm())
          }
        })
      }
    })
  }

  private arr2json = (arr) => {
    const result = arr.map((a) => {
      if (a.indexOf('(w)') > -1) {
        return {
          id: parseInt(a.replace('(w)', '')),
          type: 'widget'
        }
      } else {
        return {
          id: parseInt(a.replace('(d)', '')),
          type: 'dashboard'
        }
      }
    })
    return result
  }

  private json2arr = (json) => json.map((js) => `${js.id}(${js.type.substr(0, 1)})`)

  private onConfigModalOk = () => {
    this.configForm.validateFieldsAndScroll((err, values) => {
      const { dashboardTreeValue } = this.state
      if (!err) {
        const emailConfigData = {
          ...values,
          ...{contentList: this.arr2json(dashboardTreeValue)}
        }
        this.setState({
          emailConfig: emailConfigData
        }, () => this.hideConfigForm())
      }
    })
  }

  private hideForm = () => {
    this.setState({
      modalLoading: false,
      formVisible: false,
      emailConfig: {}
    }, () => this.scheduleForm.resetFields())
  }

  private hideConfigForm = () => {
    this.setState({
      configVisible: false,
      dashboardTreeValue: []
    }, () => this.configForm.resetFields())
  }

  private showConfig = () => {
    const { emailConfig } = this.state
    const jsonStringify = JSON.stringify(emailConfig)
    this.setState({
      configVisible: true,
      configType: 'add'
    }, () => {
      if (jsonStringify && jsonStringify.length > 2) {
        const { to, cc, subject, bcc } = emailConfig
        this.configForm.setFieldsValue({to, cc, subject, bcc})
      }
    })
  }

  private onTreeSelect = (f) => f

  private onTreeChange = (value, label, extra) => {
   // let triggerData = extra.triggerNode.props
    this.setState({
      dashboardTreeValue: value
    })
  }

  private onLoadTreeData = (treeNode) => {
    const eventKey = treeNode.props.eventKey
    return new Promise((resolve, reject) => {
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
        const dashboardTreeChildren = dashboardTree.map((tree, index) => {
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

  private onChangeRange = (value) => {
    const rangeArr = ['month', 'hour', 'week', 'time']
    this.setState({
      rangeTime: value
    })
    rangeArr.map((range) => {
      if (range === 'time') {
        return range
      } else {
        this.scheduleForm.setFieldsValue({
          [range]: ''
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
    const { id, job_status } = record
    const { onChangeCurrentJobStatus } = this.props
    onChangeCurrentJobStatus(id, job_status)
  }

  public render () {
    const {
      formType,
      configType,
      tableSource,
      formVisible,
      modalLoading,
      tableLoading,
      configVisible,
      dashboardTree,
      dashboardTreeValue,
      screenWidth
    } = this.state
    const {
      onDeleteSchedule
    } = this.props

    const pagination: PaginationProps = {
     // simple: screenWidth < 768 || screenWidth === 768,
      defaultPageSize: 20,
      showSizeChanger: true,
      total: tableSource.length
    }

    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '描述',
        dataIndex: 'desc',
        key: 'desc'
      },
      {
        title: '类型',
        dataIndex: 'job_type',
        key: 'job_type'
      },
      {
        title: '开始时间',
        dataIndex: 'start_date',
        key: 'start_date'
      },
      {
        title: '结束时间',
        dataIndex: 'end_date',
        key: 'end_date'
      },
      {
        title: '状态',
        dataIndex: 'job_status',
        key: 'job_status'
      },
      {
        title: '操作',
        key: 'action',
        width: 135,
        className: `${utilStyles.textAlignCenter}`,
        render: (text, record) => (
          <span className="ant-table-action-column">
            <Tooltip title={`${this.formatStatusText(record.job_status)}`}>
              <Button icon={this.formatStatusIcon(record.job_status)} shape="circle" type="ghost" onClick={this.changeStatus(record)} />
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
          loading={modalLoading}
          disabled={modalLoading}
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
                  <Button type="primary" icon="plus" onClick={this.showAdd} />
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
                <ConfigForm
                  type={configType}
                  dashboardTree={dashboardTree}
                  treeSelect={this.onTreeSelect}
                  treeChange={this.onTreeChange}
                  loadTreeData={this.onLoadTreeData}
                  dashboardTreeValue={dashboardTreeValue}
                  ref={(f) => { this.configForm = f }}
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
  currentDashboard: makeSelectCurrentDashboard()
})

function mapDispatchToProps (dispatch) {
  return {
    onLoadWidgets: () => promiseDispatcher(dispatch, loadWidgets),
    onLoadSchedules: () => promiseDispatcher(dispatch, loadSchedules),
    onLoadDashboards: () => promiseDispatcher(dispatch, loadDashboards),
    onAddSchedule: (schedule) => promiseDispatcher(dispatch, addSchedule, schedule),
    onUpdateSchedule: (schedule) => promiseDispatcher(dispatch, updateSchedule, schedule),
    onLoadDashboardDetail: (id) => promiseDispatcher(dispatch, loadDashboardDetail, id),
    onDeleteSchedule: (id) => () => promiseDispatcher(dispatch, deleteSchedule, id),
    onChangeCurrentJobStatus: (id, currentStatus) => promiseDispatcher(dispatch, changeSchedulesStatus, id, currentStatus)
  }
}

export default connect<{}, {}, IScheduleProps>(mapStateToProps, mapDispatchToProps)(Schedule)
