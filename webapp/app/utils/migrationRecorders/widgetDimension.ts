import { IWidgetDimension } from 'app/containers/Widget/components/Widget'
import { IFieldSortConfig } from 'app/containers/Widget/components/Config/Sort'
import { IMigrationRecorder } from '.'

const widgetDimension: IMigrationRecorder<IWidgetDimension> = {
  versions: ['beta6'],
  recorder: {
    beta6 (dimension) {
      const { sort } = dimension
      if (typeof sort === 'string') {
        const sortConfig: IFieldSortConfig = { sortType: sort }
        return {
          ...dimension,
          sort: sortConfig
        }
      }
      return dimension
    }
  }
}

export default widgetDimension
