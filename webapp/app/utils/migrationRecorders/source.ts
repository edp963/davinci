import { ISource } from 'app/containers/Source/types'
import { IMigrationRecorder } from '.'

const source: IMigrationRecorder<ISource> = {
  versions: ['beta6'],
  recorder: {
    beta6 (origin) {
      return origin
    }
  }
}

export default source
