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

import React, { useEffect, useState, useCallback } from 'react'
import moment, { Moment } from 'moment'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { RouteComponentWithParams } from 'utils/types'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import { createStructuredSelector } from 'reselect'
import {
  makeSelectLoading,
  makeSelectEditingSchedule,
  makeSelectSuggestMails,
  makeSelectPortalDashboards
} from './selectors'
import {
  makeSelectPortals,
  makeSelectDisplays,
  makeSelectDisplaySlides
} from 'containers/Viz/selectors'
import { checkNameUniqueAction } from 'containers/App/actions'
import { ScheduleActions } from './actions'
import { hideNavigator } from 'containers/App/actions'
import { VizActions } from 'containers/Viz/actions'
import reducer from './reducer'
import saga from './sagas'
import vizReducer from 'containers/Viz/reducer'
import vizSaga from 'containers/Viz/sagas'
import dashboardSaga from 'containers/Dashboard/sagas'

import { Row, Col, Card, Button, Icon, Tooltip, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'

import ScheduleBaseConfig, {
  ScheduleBaseFormProps
} from './components/ScheduleBaseConfig'
import ScheduleMailConfig from './components/ScheduleMailConfig'
import ScheduleVizConfig from './components/ScheduleVizConfig'
import {
  IPortal,
  IDashboard,
  IDisplayFormed,
  ISlideFormed
} from 'containers/Viz/types'
import { IProject } from 'containers/Projects/types'
import { ISchedule, IScheduleLoading } from './types'
import {
  IUserInfo,
  IScheduleMailConfig,
  SchedulePeriodUnit,
  ICronExpressionPartition,
  IScheduleVizConfigItem
} from './components/types'

import Styles from './Schedule.less'
import StylesHeader from 'components/EditorHeader/EditorHeader.less'

const getCronExpressionByPartition = (partition: ICronExpressionPartition) => {
  const { periodUnit, minute, hour, day, weekDay, month } = partition
  let cronExpression = ''
  switch (periodUnit as SchedulePeriodUnit) {
    case 'Minute':
      cronExpression = `0 */${minute} * * * ?`
      break
    case 'Hour':
      cronExpression = `0 ${minute} * * * ?`
      break
    case 'Day':
      cronExpression = `0 ${minute} ${hour} * * ?`
      break
    case 'Week':
      cronExpression = `0 ${minute} ${hour} ? * ${weekDay}`
      break
    case 'Month':
      cronExpression = `0 ${minute} ${hour} ${day} * ?`
      break
    case 'Year':
      cronExpression = `0 ${minute} ${hour} ${day} ${month} ?`
      break
  }
  return cronExpression
}

interface IScheduleEditorStateProps {
  displays: IDisplayFormed[]
  portals: IPortal[]
  portalDashboards: { [key: number]: IDashboard[] }
  displaySlides: { [key: number]: ISlideFormed[] }
  loading: IScheduleLoading
  editingSchedule: ISchedule
  suggestMails: IUserInfo[]
  currentProject: IProject
}

interface IScheduleEditorDispatchProps {
  onHideNavigator: () => void
  onLoadDisplays: (projectId: number) => void
  onLoadPortals: (projectId: number) => void
  onLoadDisplaySlides: (displayId: number) => void
  onLoadDashboards: (portalId: number) => void
  onLoadScheduleDetail: (scheduleId: number) => void
  onAddSchedule: (schedule: ISchedule, resolve: () => void) => any
  onEditSchedule: (schedule: ISchedule, resolve: () => void) => any
  onResetState: () => void
  onCheckUniqueName: (
    data: any,
    resolve: () => any,
    reject: (error: string) => any
  ) => any
  onLoadSuggestMails: (keyword: string) => any
}

type ScheduleEditorProps = IScheduleEditorStateProps &
  IScheduleEditorDispatchProps &
  RouteComponentWithParams

const ScheduleEditor: React.FC<ScheduleEditorProps> = (props) => {
  const {
    onHideNavigator,
    onLoadDisplays,
    onLoadPortals,
    onLoadScheduleDetail,
    onResetState,
    match,
    history
  } = props
  const { projectId, scheduleId } = match.params
  useEffect(() => {
    onHideNavigator()
    onLoadDisplays(+projectId)
    onLoadPortals(+projectId)
    if (+scheduleId) {
      onLoadScheduleDetail(+scheduleId)
    }

    return () => {
      onResetState()
    }
  }, [])
  const goBack = useCallback(() => {
    history.push(`/project/${projectId}/schedules`)
  }, [])

  const {
    portals,
    displays,
    loading,
    editingSchedule,
    onLoadDisplaySlides,
    onLoadDashboards
  } = props

  const loadVizDetail = useCallback(
    (
      type: IScheduleVizConfigItem['contentType'],
      schedule: ISchedule,
      vizs: IPortal[] | IDisplayFormed[]
    ) => {
      if (!schedule.id || !vizs.length) {
        return
      }
      const { contentList } = schedule.config
      // initial Viz loading by contentList Portal or Display setting
      contentList.forEach(({ contentType, id: vizId }) => {
        if (contentType !== type) {
          return
        }
        if (~vizs.findIndex(({ id }) => id === vizId)) {
          switch (type) {
            case 'portal':
              onLoadDashboards(vizId)
              break
            case 'display':
              onLoadDisplaySlides(vizId)
              break
          }
        }
      })
    },
    []
  )

  useEffect(() => {
    loadVizDetail('portal', editingSchedule, portals)
  }, [portals, editingSchedule])
  useEffect(() => {
    loadVizDetail('display', editingSchedule, displays)
  }, [displays, editingSchedule])

  const {
    suggestMails,
    portalDashboards,
    displaySlides,
    onAddSchedule,
    onEditSchedule,
    onCheckUniqueName,
    onLoadSuggestMails
  } = props
  const { jobStatus, config } = editingSchedule
  const { contentList } = config

  const [localContentList, setLocalContentList] = useState(contentList)
  useEffect(() => {
    setLocalContentList([...contentList])
  }, [contentList])

  let baseConfigForm: FormComponentProps<ScheduleBaseFormProps> = null
  let mailConfigForm: FormComponentProps<IScheduleMailConfig> = null

  const saveSchedule = () => {
    if (!localContentList.length) {
      message.error('请勾选发送内容')
      return
    }
    baseConfigForm.form.validateFieldsAndScroll((err1, value1) => {
      if (err1) {
        return
      }
      const cronExpression = getCronExpressionByPartition(value1)
      const [startDate, endDate] = baseConfigForm.form.getFieldValue(
        'dateRange'
      ) as ScheduleBaseFormProps['dateRange']
      delete value1.dateRange
      mailConfigForm.form.validateFieldsAndScroll((err2, value2) => {
        if (err2) {
          return
        }
        const schedule: ISchedule = {
          ...value1,
          cronExpression,
          startDate: moment(startDate).format('YYYY-MM-DD HH:mm:ss'),
          endDate: moment(endDate).format('YYYY-MM-DD HH:mm:ss'),
          config: { ...value2, contentList: localContentList },
          projectId: +projectId
        }
        if (editingSchedule.id) {
          schedule.id = editingSchedule.id
          onEditSchedule(schedule, goBack)
        } else {
          onAddSchedule(schedule, goBack)
        }
      })
    })
  }

  return (
    <>
      <Helmet title="Schedule" />
      <div className={Styles.scheduleEditor}>
        <div className={StylesHeader.editorHeader}>
          <Icon type="left" className={StylesHeader.back} onClick={goBack} />
          <div className={StylesHeader.title}>
            <span className={StylesHeader.name}>{`${
              scheduleId ? '修改' : '新增'
            } Schedule`}</span>
          </div>
          <div className={StylesHeader.actions}>
            <Tooltip
              placement="bottom"
              title={jobStatus === 'started' ? '停止后允许修改' : ''}
            >
              <Button
                type="primary"
                disabled={loading.edit || jobStatus === 'started'}
                onClick={saveSchedule}
              >
                保存
              </Button>
            </Tooltip>
          </div>
        </div>
        <div className={Styles.containerVertical}>
          <Row gutter={8}>
            <Col span={12}>
              <Card title="基本设置" size="small">
                <ScheduleBaseConfig
                  wrappedComponentRef={(inst) => {
                    baseConfigForm = inst
                  }}
                  schedule={editingSchedule}
                  loading={loading.schedule}
                  onCheckUniqueName={onCheckUniqueName}
                />
              </Card>
              <Card title="邮件设置" size="small" style={{ marginTop: 8 }}>
                <ScheduleMailConfig
                  wrappedComponentRef={(inst) => {
                    mailConfigForm = inst
                  }}
                  config={config}
                  loading={loading.schedule}
                  mailList={suggestMails}
                  onLoadMailList={onLoadSuggestMails}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="发送内容设置" size="small">
                <ScheduleVizConfig
                  displays={displays}
                  portals={portals}
                  portalDashboards={portalDashboards}
                  displaySlides={displaySlides}
                  value={localContentList}
                  onLoadDisplaySlides={onLoadDisplaySlides}
                  onLoadPortalDashboards={onLoadDashboards}
                  onChange={setLocalContentList}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </>
  )
}

const mapStateToProps = createStructuredSelector({
  displays: makeSelectDisplays(),
  portals: makeSelectPortals(),
  portalDashboards: makeSelectPortalDashboards(),
  displaySlides: makeSelectDisplaySlides(),
  loading: makeSelectLoading(),
  editingSchedule: makeSelectEditingSchedule(),
  suggestMails: makeSelectSuggestMails()
})

const mapDispatchToProps = (dispatch) => ({
  onHideNavigator: () => dispatch(hideNavigator()),
  onLoadDisplays: (projectId) => dispatch(VizActions.loadDisplays(projectId)),
  onLoadPortals: (projectId) => dispatch(VizActions.loadPortals(projectId)),
  onLoadDisplaySlides: (displayId) =>
    dispatch(VizActions.loadDisplaySlides(displayId)),
  // @REFACTOR to use viz reducer portalDashboards
  onLoadDashboards: (portalId) =>
    dispatch(
      VizActions.loadPortalDashboards(
        portalId,
        (dashboards) => {
          dispatch(ScheduleActions.portalDashboardsLoaded(portalId, dashboards))
        },
        false
      )
    ),
  onLoadScheduleDetail: (scheduleId) =>
    dispatch(ScheduleActions.loadScheduleDetail(scheduleId)),
  onAddSchedule: (schedule, resolve) =>
    dispatch(ScheduleActions.addSchedule(schedule, resolve)),
  onEditSchedule: (schedule, resolve) =>
    dispatch(ScheduleActions.editSchedule(schedule, resolve)),
  onResetState: () => dispatch(ScheduleActions.resetScheduleState()),
  onCheckUniqueName: (data, resolve, reject) =>
    dispatch(checkNameUniqueAction('cronjob', data, resolve, reject)),
  onLoadSuggestMails: (keyword) =>
    dispatch(ScheduleActions.loadSuggestMails(keyword))
})

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
)
const withReducer = injectReducer({ key: 'schedule', reducer })
const withSaga = injectSaga({ key: 'schedule', saga })
const withVizReducer = injectReducer({
  key: 'viz',
  reducer: vizReducer
})
const withVizSaga = injectSaga({ key: 'viz', saga: vizSaga })
const withDashboardSaga = injectSaga({ key: 'dashboard', saga: dashboardSaga })

export default compose(
  withReducer,
  withSaga,
  withVizReducer,
  withVizSaga,
  withDashboardSaga,
  withConnect
)(ScheduleEditor)
