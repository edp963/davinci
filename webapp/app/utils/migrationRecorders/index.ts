import { IGlobalControl, ILocalControl } from 'app/components/Filters/types'
import { IWidgetDimension, IChartStyles } from 'app/containers/Widget/components/Widget'
import globalControl from './globalControl'
import localControl from './localControl'
import widgetDimension from './widgetDimension'
import barChartStyles from './barChartStyles'

export interface IMigrationRecorder<T> {
  versions: string[]
  recorder: {
    [version: string]: (data: T) => T
  }
}

function executeMigration<T> (data: T, migrationRecorder: IMigrationRecorder<T>): T {
  const { versions, recorder } = migrationRecorder

  return versions.reduce((mergedData: T, v) => recorder[v](mergedData), data)
}

const globalControlMigrationRecorder = (data: IGlobalControl) => executeMigration<IGlobalControl>(data, globalControl)
const localControlMigrationRecorder = (data: ILocalControl) => executeMigration<ILocalControl>(data, localControl)
const widgetDimensionMigrationRecorder = (data: IWidgetDimension) => executeMigration<IWidgetDimension>(data, widgetDimension)
const barChartStylesMigrationRecorder = (data: IChartStyles) => executeMigration<IChartStyles>(data, barChartStyles)

export {
  globalControlMigrationRecorder,
  localControlMigrationRecorder,
  widgetDimensionMigrationRecorder,
  barChartStylesMigrationRecorder
}
