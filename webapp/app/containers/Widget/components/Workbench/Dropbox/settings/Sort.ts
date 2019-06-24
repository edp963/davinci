import { SettingTypes, ItemTypes, ISettingItem } from './type'

const Sort: ISettingItem = {
  key: 'sort',
  name: '排序',
  settingType: SettingTypes.Dimension | SettingTypes.Indicator,
  itemType: ItemTypes.Category | ItemTypes.Value,
  sub: true,
  items: [{
    default: '默认排序',
    asc: '升序',
    desc: '降序'
  }]
}

export default Sort
