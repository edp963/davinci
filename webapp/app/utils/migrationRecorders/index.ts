import { IGlobalControl, ILocalControl } from 'app/components/Filters'
import globalControl from './globalControl'
import localControl from './localControl'

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

export {
  globalControlMigrationRecorder,
  localControlMigrationRecorder
}
