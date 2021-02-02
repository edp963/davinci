import { SettingTypes, ItemTypes, ISettingItem } from './types'

const Filters: ISettingItem = {
  key: 'filters',
  name: '配置筛选',
  constrants: [{
    settingType: SettingTypes.Filters,
    itemType: ItemTypes.Category | ItemTypes.Value,
    itemValueType: null
  }],
  sub: false,
  items: [{
    filters: '配置筛选'
  }]
}

export default Filters
