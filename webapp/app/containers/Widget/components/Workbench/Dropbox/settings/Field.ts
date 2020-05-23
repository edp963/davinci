import { SettingTypes, ItemTypes, ISettingItem } from './type'

const Field: ISettingItem = {
  key: 'field',
  name: '字段设置',
  constrants: [{
    settingType: SettingTypes.Dimension | SettingTypes.Indicator | SettingTypes.Color | SettingTypes.Tip,
    itemType: ItemTypes.Category | ItemTypes.Value,
    itemValueType: null
  }],
  sub: false,
  items: [{
    field: '字段设置'
  }]
}

export default Field
