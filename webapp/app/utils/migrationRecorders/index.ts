import { IWidgetConfig } from 'app/containers/Widget/components/Widget'
import widgetConfig from './widgetConfig'
import dashboardConfig from './dashboardConfig'
import { IDashboardConfig } from 'app/containers/Dashboard/types'

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

export { widgetConfigMigrationRecorder, dashboardConfigMigrationRecorder }
