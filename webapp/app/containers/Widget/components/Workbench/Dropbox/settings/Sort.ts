import { SettingTypes, ItemTypes, ISettingItem } from './type'

const Sort: ISettingItem = {
  key: 'sort',
  name: '排序',
  constrants: [{
    settingType: SettingTypes.Dimension | SettingTypes.Indicator | SettingTypes.Color | SettingTypes.Tip,
    itemType: ItemTypes.Category | ItemTypes.Value,
    itemValueType: null
  }],
  sub: true,
  items: [{
    default: '默认排序',
    asc: '升序',
    desc: '降序'
  }]
}

export default Sort
