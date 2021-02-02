import widgetConfig from './widgetConfig'
import dashboardConfig from './dashboardConfig'
import scheduleConfig from './scheduleConfig'
import { IWidgetConfig } from 'app/containers/Widget/components/Widget'
import { IDashboardConfig } from 'app/containers/Dashboard/types'
import {
  IScheduleMailConfig,
  IScheduleWeChatWorkConfig
} from 'app/containers/Schedule/components/types'
import displayParamsConfig from './displayParams'
import { ILayerParams } from 'app/containers/Display/components/types'

export interface IMigrationRecorder {
  versions: string[]
  recorders: {
    [version: string]: (data, options?) => any
  }
}

function executeMigration(
  migrationRecorder: IMigrationRecorder,
  data: any,
  options?
) {
  const { versions, recorders } = migrationRecorder

  return versions.reduce(
    (mergedData, version) => recorders[version](mergedData, options),
    data
  )
}

const widgetConfigMigrationRecorder = (data: IWidgetConfig, options?) =>
  executeMigration(widgetConfig, data, options)
const dashboardConfigMigrationRecorder = (data: IDashboardConfig) =>
  executeMigration(dashboardConfig, data)
const scheduleConfigMigrationRecorder = (
  data: IScheduleMailConfig | IScheduleWeChatWorkConfig
) => executeMigration(scheduleConfig, data)
const displayParamsMigrationRecorder = (data: ILayerParams) => 
  executeMigration(displayParamsConfig, data)
export {
  widgetConfigMigrationRecorder,
  dashboardConfigMigrationRecorder,
  scheduleConfigMigrationRecorder,
  displayParamsMigrationRecorder
}