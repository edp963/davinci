import { SettingTypes, ItemTypes, ISettingItem } from './type'
import {
  getAggregatorLocale
} from 'containers/Widget/components/util'

const AggregatorIndicator: ISettingItem = {
  key: 'aggregator',
  name: '聚合计算',
  settingType: SettingTypes.Indicator | SettingTypes.Filters | SettingTypes.Color | SettingTypes.Dimension | SettingTypes.Tip,
  itemType: ItemTypes.Value,
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
  settingType: SettingTypes.Indicator | SettingTypes.Filters | SettingTypes.Color,
  itemType: ItemTypes.Category,
  sub: false,
  items: [{
    count: getAggregatorLocale('count'),
    COUNTDISTINCT: getAggregatorLocale('COUNTDISTINCT')
  }]
}

export default [AggregatorDimension, AggregatorIndicator]
