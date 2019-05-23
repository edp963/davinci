import { SettingTypes, ItemTypes, ISettingItem } from './type'

const Filters: ISettingItem = {
  key: 'filters',
  name: '配置筛选',
  settingType: SettingTypes.Filters,
  itemType: ItemTypes.Category | ItemTypes.Value,
  sub: false,
  items: [{
    filters: '配置筛选'
  }]
}

export default Filters
