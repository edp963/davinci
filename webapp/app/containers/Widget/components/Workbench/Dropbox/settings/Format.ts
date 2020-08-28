import { SettingTypes, ItemTypes, ItemValueTypes, ISettingItem } from './types'

const Format: ISettingItem = {
  key: 'format',
  name: '格式设置',
  constrants: [{
    settingType: SettingTypes.Indicator | SettingTypes.Tip,
    itemType: ItemTypes.Value,
    itemValueType: ItemValueTypes.Number
  }],
  // @TODO date dimension format support
  // , {
  //   settingType: SettingTypes.Dimension | SettingTypes.Color,
  //   itemType: ItemTypes.Category,
  //   itemValueType: ItemValueTypes.Date
  // }],
  sub: false,
  items: [{
    format: '格式设置'
  }]
}

export default Format
