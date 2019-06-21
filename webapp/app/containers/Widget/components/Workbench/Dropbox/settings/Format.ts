import { SettingTypes, ItemTypes, ISettingItem } from './type'

const Format: ISettingItem = {
  key: 'format',
  name: '数值显示格式',
  settingType: SettingTypes.Indicator,
  itemType: ItemTypes.Value,
  sub: false,
  items: [{
    format: '数值显示格式'
  }]
}

export default Format
