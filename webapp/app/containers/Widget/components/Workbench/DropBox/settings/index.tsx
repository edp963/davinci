import * as React from 'react'
import Aggregator from './Aggregator'
import Field from './Field'
import Sort from './Sort'
import Format from './Format'
import Color from './Color'
import Filters from './Filters'

import ChartTypes from 'containers/Widget/config/chart/ChartTypes'
import { SettingTypes, ItemTypes } from './type'

import { Menu } from 'antd'
const { Item: MenuItem, SubMenu, Divider: MenuDivider } = Menu

const SettingsList = [...Aggregator, Format, Field, Sort, Filters, Color]

export function getSettingKeyByDropItem (itemKey: string): 'aggregator' | 'field' | 'sort' | 'format' | 'color' | 'filters' | 'tip' {
  let settingKey
  SettingsList.some((s) => {
    const exists = s.items.some((item) => !!item[itemKey])
    if (exists) { settingKey = s.key }
    return exists
  })
  return settingKey
}

export function getAvailableSettings (settingType: SettingTypes, itemType: ItemTypes) {
  const availableSettings = SettingsList.filter((s) => {
    const byType = (s.settingType & settingType) && (s.itemType & itemType)
    return byType
  })
  const result = availableSettings.reduce((acc, setting) => {
    if (!setting.sub) {
      return acc.concat(setting.items)
    }
    return acc.concat({
      [setting.key]: {
        name: setting.name,
        subs: setting.items
      }
    })
  }, [])
  return result
}

export function getSettingsDropdownList (settings) {
  return settings.reduce((menuItems, group, index) => {
    menuItems = menuItems.concat(Object.entries(group).map(([k, v]: [string, any]) => {
      if (v.subs) {
        const subItems = getSettingsDropdownList(v.subs)
        return (<SubMenu key={k} title={v.name}>{subItems}</SubMenu>)
      } else {
        return (<MenuItem key={k}>{v}</MenuItem>)
      }
    }))
    if (index !== settings.length - 1) {
      menuItems = menuItems.concat(<MenuDivider key={index} />)
    }
    return menuItems
  }, [])
}

export const MapSettingTypes = {
  cols: SettingTypes.Dimension,
  rows: SettingTypes.Dimension,
  metrics: SettingTypes.Indicator,
  filters: SettingTypes.Filters,
  color: SettingTypes.Color,
  tip: SettingTypes.Tip
}

export const MapItemTypes = {
  category: ItemTypes.Category,
  value: ItemTypes.Value
}

export default SettingsList
