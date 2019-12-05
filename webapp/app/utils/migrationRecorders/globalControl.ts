import { IGlobalControl } from 'app/components/Filters/types'
import { DEFAULT_CACHE_EXPIRED } from 'app/globalConstants'
import { IMigrationRecorder } from '.'

const globalControl: IMigrationRecorder<IGlobalControl> = {
  versions: ['beta5'],
  recorder: {
    beta5 (control) {
      const { cache, expired } = control
      if (cache === void 0 || expired === void 0) {
        return {
          ...control,
          cache: false,
          expired: DEFAULT_CACHE_EXPIRED
        }
      }
      return control
    }
  }
}

export default globalControl
