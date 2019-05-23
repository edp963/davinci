import { SettingTypes, ItemTypes, ISettingItem } from './type'

const Color: ISettingItem = {
  key: 'color',
  name: '配置颜色',
  settingType: SettingTypes.Color,
  itemType: ItemTypes.Category,
  sub: false,
  items: [{
    color: '配置颜色'
  }]
}

export default Color
