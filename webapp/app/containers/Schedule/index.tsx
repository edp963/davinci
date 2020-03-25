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

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Link } from 'react-router-dom'
import { RouteComponentWithParams } from 'utils/types'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import { createStructuredSelector } from 'reselect'
import { makeSelectCurrentProject } from 'containers/Projects/selectors'
import { makeSelectLoading, makeSelectSchedules } from './selectors'
import { ScheduleActions } from './actions'
import reducer from './reducer'
import saga from './sagas'

import ModulePermission from 'containers/Account/components/checkModulePermission'
import { initializePermission } from 'containers/Account/components/checkUtilPermission'

import { useTablePagination } from 'utils/hooks'

import {
  Row,
  Col,
  Breadcrumb,
  Table,
  Icon,
  Button,
  Tooltip,
  Popconfirm,
  message,
  Modal
} from 'antd'
import { ButtonProps } from 'antd/lib/button'
import { ColumnProps } from 'antd/lib/table'
import Container from 'components/Container'
import Box from 'components/Box'

import { ISchedule, JobStatus, IScheduleLoading } from './types'
import { IProject } from 'containers/Projects/types'

import utilStyles from 'assets/less/util.less'
import Styles from './Schedule.less'

interface IScheduleListStateProps {
  loading: IScheduleLoading
  schedules: ISchedule[]
  currentProject: IProject
}

interface IScheduleListDispatchProps {
  onLoadSchedules: (projectId: number) => any
  onDeleteSchedule: (id: number) => any
  onChangeScheduleJobStatus: (id: number, status: JobStatus) => any
  onExecuteScheduleImmediately: (id: number, resolve: () => void) => any
}

type ScheduleListProps = IScheduleListStateProps &
  IScheduleListDispatchProps &
  RouteComponentWithParams

const JobStatusNextOperations: { [key in JobStatus]: string } = {
  new: '启动',
  failed: '重启',
  started: '暂停',
  stopped: '启动'
}

const JobStatusIcons: { [key in JobStatus]: string } = {
  new: 'caret-right',
  failed: 'reload',
  started: 'pause',
  stopped: 'caret-right'
}

const ScheduleList: React.FC<ScheduleListProps> = (props) => {
  const {
    match,
    history,
    loading,
    schedules,
    currentProject,
    onLoadSchedules,
    onDeleteSchedule,
    onChangeScheduleJobStatus,
    onExecuteScheduleImmediately
  } = props
  const [execLogModalVisible, setExecLogModalVisible] = useState(false)
  const [execLog, setExecLogContent] = useState('')
  const tablePagination = useTablePagination(0)

  const openExecLogModal = useCallback((logContent) => () => {
    setExecLogModalVisible(true)
    setExecLogContent(logContent)
  }, [])
  const closeExecLogModal = useCallback(() => {
    setExecLogModalVisible(false)
  }, [])

  const columns: Array<ColumnProps<ISchedule>> = useMemo(() => {
    return [
      {
        title: '名称',
        dataIndex: 'name',
        render: (name, record) => {
          if (!record.execLog) {
            return name
          }
          return (
            <p className={Styles.info}>
              {name}
              <Tooltip title="点击查看错误日志">
                <Icon
                  type="info-circle"
                  onClick={openExecLogModal(record.execLog)}
                />
              </Tooltip>
            </p>
          )
        }
      },
      {
        title: '描述',
        dataIndex: 'description'
      },
      {
        title: '类型',
        dataIndex: 'jobType',
        width: 60,
        align: 'center'
      },
      {
        title: '有效开始时间',
        dataIndex: 'startDate',
        width: 180,
        align: 'center'
      },
      {
        title: '有效结束时间',
        dataIndex: 'endDate',
        width: 180,
        align: 'center'
      },
      {
        title: '状态',
        dataIndex: 'jobStatus',
        width: 80,
        align: 'center'
      }
    ]
  }, [])

  useEffect(() => {
    onLoadSchedules(+match.params.projectId)
  }, [])

  const addSchedule = useCallback(
    () => {
      const { projectId } = match.params
      history.push(`/project/${projectId}/schedule`)
    },
    [currentProject]
  )

  const { schedulePermission, AdminButton, EditButton } = useMemo(
    () => ({
      schedulePermission: initializePermission(
        currentProject,
        'schedulePermission'
      ),
      AdminButton: ModulePermission<ButtonProps>(
        currentProject,
        'schedule',
        true
      )(Button),
      EditButton: ModulePermission<ButtonProps>(
        currentProject,
        'schedule',
        false
      )(Button)
    }),
    [currentProject]
  )

  const changeJobStatus = useCallback(
    (schedule: ISchedule) => () => {
      const { id, jobStatus } = schedule
      onChangeScheduleJobStatus(id, jobStatus)
    },
    [onChangeScheduleJobStatus]
  )

  const executeScheduleImmediately = useCallback(
    (id: number) => () => {
      onExecuteScheduleImmediately(id, () => {
        message.success('任务已开始执行')
      })
    },
    [onExecuteScheduleImmediately]
  )

  const editSchedule = useCallback(
    (scheduleId: number) => () => {
      const { projectId } = match.params
      history.push(`/project/${projectId}/schedule/${scheduleId}`)
    },
    []
  )

  const deleteSchedule = useCallback(
    (scheduleId: number) => () => {
      onDeleteSchedule(scheduleId)
    },
    [onDeleteSchedule]
  )

  const tableColumns = [...columns]
  if (schedulePermission) {
    tableColumns.push({
      title: '操作',
      key: 'action',
      align: 'center',
      width: 185,
      render: (_, record) => (
        <span className="ant-table-action-column">
          <Tooltip title={JobStatusNextOperations[record.jobStatus]}>
            <Button
              icon={JobStatusIcons[record.jobStatus]}
              shape="circle"
              type="ghost"
              onClick={changeJobStatus(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定立即执行？"
            placement="bottom"
            onConfirm={executeScheduleImmediately(record.id)}
          >
            <Tooltip title="立即执行">
              <Button
                shape="circle"
                type="ghost"
              >
                <i className="iconfont icon-lijitoudi" />
              </Button>
            </Tooltip>
          </Popconfirm>
          <Tooltip title="修改" trigger="hover">
            <EditButton
              icon="edit"
              shape="circle"
              type="ghost"
              onClick={editSchedule(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除？"
            placement="bottom"
            onConfirm={deleteSchedule(record.id)}
          >
            <Tooltip title="删除">
              <AdminButton icon="delete" shape="circle" type="ghost" />
            </Tooltip>
          </Popconfirm>
        </span>
      )
    })
  }

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
              <Icon type="bars" />
              Schedule List
            </Box.Title>
            <Box.Tools>
              <Tooltip placement="bottom" title="新增">
                <AdminButton type="primary" icon="plus" onClick={addSchedule} />
              </Tooltip>
            </Box.Tools>
          </Box.Header>
          <Box.Body>
            <Row>
              <Col span={24}>
                <Table
                  rowKey="id"
                  bordered
                  dataSource={schedules}
                  columns={tableColumns}
                  pagination={tablePagination}
                  loading={loading.table}
                />
              </Col>
            </Row>
          </Box.Body>
        </Box>
      </Container.Body>
      <Modal
        title="错误日志"
        wrapClassName="ant-modal-large"
        visible={execLogModalVisible}
        onCancel={closeExecLogModal}
        footer={false}
      >
        {execLog}
      </Modal>
    </Container>
  )
}

const mapStateToProps = createStructuredSelector({
  schedules: makeSelectSchedules(),
  currentProject: makeSelectCurrentProject(),
  loading: makeSelectLoading()
})

function mapDispatchToProps(dispatch) {
  return {
    onLoadSchedules: (projectId) =>
      dispatch(ScheduleActions.loadSchedules(projectId)),
    onDeleteSchedule: (id) => dispatch(ScheduleActions.deleteSchedule(id)),
    onChangeScheduleJobStatus: (id, currentStatus) =>
      dispatch(ScheduleActions.changeSchedulesStatus(id, currentStatus)),
    onExecuteScheduleImmediately: (id, resolve) =>
      dispatch(ScheduleActions.executeScheduleImmediately(id, resolve))
  }
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
)

const withReducer = injectReducer({ key: 'schedule', reducer })
const withSaga = injectSaga({ key: 'schedule', saga })

export default compose(
  withReducer,
  withSaga,
  withConnect
)(ScheduleList)
