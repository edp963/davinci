import { SettingTypes, ItemTypes, ISettingItem } from './type'

const SortDimension: ISettingItem = {
  key: 'sort',
  name: '排序',
  constrants: [{
    settingType: SettingTypes.Dimension | SettingTypes.Color | SettingTypes.Tip,
    itemType: ItemTypes.Category,
    itemValueType: null
  }],
  sub: true,
  items: [{
    default: '默认排序',
    asc: '升序',
    desc: '降序',
    custom: '自定义'
  }]
}

const SortIndicator: ISettingItem = {
  key: 'sort',
  name: '排序',
  constrants: [{
    settingType: SettingTypes.Indicator | SettingTypes.Tip,
    itemType: ItemTypes.Value,
    itemValueType: null
  }],
  sub: true,
  items: [{
    default: '默认排序',
    asc: '升序',
    desc: '降序'
  }]
}

export default [SortDimension, SortIndicator]
