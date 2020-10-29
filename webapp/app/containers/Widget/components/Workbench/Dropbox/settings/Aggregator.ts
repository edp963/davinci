import { SettingTypes, ItemTypes, ItemValueTypes, ISettingItem } from './types'
import {
  getAggregatorLocale
} from 'containers/Widget/components/util'

const AggregatorIndicator: ISettingItem = {
  key: 'aggregator',
  name: '聚合计算',
  constrants: [{
    settingType: SettingTypes.Indicator | SettingTypes.Tip,
    itemType: ItemTypes.Value,
    itemValueType: ItemValueTypes.Number
  }],
  sub: false,
  items: [{
    sum: getAggregatorLocale('sum'),
    avg: getAggregatorLocale('avg'),
    count: getAggregatorLocale('count'),
    COUNTDISTINCT: getAggregatorLocale('COUNTDISTINCT'),
    max: getAggregatorLocale('max'),
    min: getAggregatorLocale('min')
  }]
}

const AggregatorDimension: ISettingItem = {
  key: 'aggregator',
  name: '聚合计算',
  constrants: [{
    settingType: SettingTypes.Indicator | SettingTypes.Tip,
    itemType: ItemTypes.Value,
    itemValueType: ItemValueTypes.Date | ItemValueTypes.GeoCity | ItemValueTypes.GeoCountry | ItemValueTypes.GeoProvince | ItemValueTypes.String
  }],
  sub: false,
  items: [{
    count: getAggregatorLocale('count'),
    COUNTDISTINCT: getAggregatorLocale('COUNTDISTINCT')
  }]
}

export default [AggregatorDimension, AggregatorIndicator]
