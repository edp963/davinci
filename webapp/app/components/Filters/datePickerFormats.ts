export enum DatePickerFormats {
  Date = 'YYYY-MM-DD',
  Datetime = 'YYYY-MM-DD HH:mm:ss',
  DatetimeMinute = 'YYYY-MM-DD HH:mm',
  Month = 'YYYY-MM',
  Week = 'YYYY-ww',
  Year = 'YYYY'
}

export const DatePickerFormatsLocale = {
  [DatePickerFormats.Date]: '日期',
  [DatePickerFormats.Datetime]: '日期时间',
  [DatePickerFormats.DatetimeMinute]: '日期时间分钟',
  [DatePickerFormats.Month]: '月',
  [DatePickerFormats.Week]: '周',
  [DatePickerFormats.Year]: '年'
}

export const DatePickerFormatsSelectSetting = {
  normal: [
    DatePickerFormats.Date,
    DatePickerFormats.Datetime,
    DatePickerFormats.DatetimeMinute,
    DatePickerFormats.Month,
    DatePickerFormats.Week,
    DatePickerFormats.Year
  ],
  multiple: [
    DatePickerFormats.Date,
    DatePickerFormats.Month,
    DatePickerFormats.Year
  ]
}

export enum DatePickerDefaultValues {
  Today = 'today',
  Yesterday = 'yesterday',
  Week = 'week',
  Day7 = 'day7',
  LastWeek = 'lastWeek',
  Month = 'month',
  Day30 = 'day30',
  LastMonth = 'lastMonth',
  Quarter = 'quarter',
  Day90 = 'day90',
  LastQuarter = 'lastQuarter',
  Year = 'year',
  Day365 = 'day365',
  LastYear = 'lastYear',
  Custom = 'custom'
}

export const DatePickerDefaultValuesLocales = {
  [DatePickerDefaultValues.Today]: '今天',
  [DatePickerDefaultValues.Yesterday]: '昨天',
  [DatePickerDefaultValues.Week]: '本周',
  [DatePickerDefaultValues.Day7]: '7天前',
  [DatePickerDefaultValues.LastWeek]: '上周',
  [DatePickerDefaultValues.Month]: '本月',
  [DatePickerDefaultValues.Day30]: '30天前',
  [DatePickerDefaultValues.LastMonth]: '上月',
  [DatePickerDefaultValues.Quarter]: '本季度',
  [DatePickerDefaultValues.Day90]: '90天前',
  [DatePickerDefaultValues.LastQuarter]: '上季度',
  [DatePickerDefaultValues.Year]: '今年',
  [DatePickerDefaultValues.Day365]: '365天前',
  [DatePickerDefaultValues.LastYear]: '去年',
  [DatePickerDefaultValues.Custom]: '自定义'
}

export default DatePickerFormats
