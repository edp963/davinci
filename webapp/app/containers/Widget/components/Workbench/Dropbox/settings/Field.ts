import { SettingTypes, ItemTypes, ISettingItem } from './type'

const Field: ISettingItem = {
  key: 'field',
  name: '字段设置',
  settingType: SettingTypes.Dimension | SettingTypes.Indicator,
  itemType: ItemTypes.Category | ItemTypes.Value,
  sub: false,
  items: [{
    field: '字段设置'
  }]
}

export default Field
