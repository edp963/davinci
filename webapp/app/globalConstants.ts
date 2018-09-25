/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

const defaultEchartsTheme = require('./assets/json/echartsThemes/default.project.json')
export const DEFAULT_ECHARTS_THEME = defaultEchartsTheme.theme
export const DEFAULT_PRIMARY_COLOR = '#1B98E0'
export const DEFAULT_SECONDARY_COLOR = '#223151'

export const GRID_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
export const GRID_COLS = { lg: 12, md: 12, sm: 12, xs: 2, xxs: 2 }
export const GRID_ITEM_MARGIN = 16
export const GRID_ROW_HEIGHT = 30

export const TABLE_HEADER_HEIGHT = 50
export const TABLE_PAGINATION_HEIGHT = 61
export const COLUMN_WIDTH = 150
export const DASHBOARD_ITEM_FILTER_HEIGHT = 40

export const DEFAULT_TABLE_PAGE = 1
export const DEFAULT_TABLE_PAGE_SIZE = 20

export const PIVOT_CELL_PADDING = 4
export const PIVOT_CELL_BORDER = 1
export const PIVOT_LINE_HEIGHT = 18
export const PIVOT_MAX_CONTENT_WIDTH = 200
export const PIVOT_BORDER = 1
export const PIVOT_CHART_ELEMENT_MIN_WIDTH = 24
export const PIVOT_CHART_ELEMENT_MAX_WIDTH = 72
export const PIVOT_CHART_METRIC_AXIS_MIN_SIZE = 80
export const PIVOT_CHART_SPLIT_SIZE = 40
export const PIVOT_CHART_POINT_LIMIT = 100
export const PIVOT_XAXIS_SIZE = 50
export const PIVOT_YAXIS_SIZE = 64
export const PIVOT_TITLE_SIZE = 27
export const PIVOT_XAXIS_ROTATE_LIMIT = 30
export const PIVOT_XAXIS_TICK_SIZE = 12
export const PIVOT_LEGEND_ITEM_PADDING = 32
export const PIVOT_LEGEND_PADDING = 16
export const PIVOT_DEFAULT_SCATTER_SIZE = 10
export const PIVOT_DEFAULT_SCATTER_SIZE_TIMES = 4
export const PIVOT_CANVAS_SIZE_LIMIT = 3000
export const PIVOT_CANVAS_AXIS_SIZE_LIMIT = 8000
export const PIVOT_CANVAS_POLAR_SIZE_LIMIT = 8000
export const PIVOT_DEFAULT_AXIS_LINE_COLOR = '#D9D9D9'
export const PIVOT_DEFAULT_FONT_COLOR = '#666'
export const PIVOT_DEFAULT_HEADER_BACKGROUND_COLOR = '#f7f7f7'
export const PIVOT_CHART_FONT_FAMILIES = [
  { name: '苹方', value: 'PingFang SC'},
  { name: '微软雅黑', value: 'Microsoft YaHei'},
  { name: '宋体', value: 'SimSun'},
  { name: '黑体', value: 'SimHei'},
  { name: 'Helvetica Neue', value: '"Helvetica Neue"'},
  { name: 'Helvetica', value: 'Helvetica'},
  { name: 'Arial', value: 'Arial'},
  { name: 'sans-serif', value: 'sans-serif'}
]
export const PIVOT_CHART_LINE_STYLES = [
  { name: '实线', value: 'solid'},
  { name: '虚线', value: 'dashed'},
  { name: '点', value: 'dotted'}
]
export const PIVOT_CHART_FONT_SIZES = [10, 12, 13, 14, 15, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64]

export const SQL_STRING_TYPES = [
  'CHAR', 'VARCHAR', 'TINYTEXT', 'TEXT', 'MEDIUMTEXT', 'LONGTEXT',
  'JSON', 'LINESTRING', 'MULTILINESTRING',
  'TINYBLOB', 'MEDIUMBLOB', 'BLOB', 'LONGBLOB',
  'BINARY', 'VARBINARY', 'ENUM', 'SET'
]
export const SQL_NUMBER_TYPES = [
  'TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'INTEGER', 'BIGINT',
  'FLOAT', 'DOUBLE', 'DOUBLE PRECISION', 'REAL', 'DECIMAL',
  'BIT', 'SERIAL', 'BOOL', 'BOOLEAN', 'DEC', 'FIXED', 'NUMERIC'
]
export const SQL_DATE_TYPES = ['DATE', 'DATETIME', 'TIMESTAMP', 'TIME', 'YEAR']

export const DEFAULT_SPLITER = '@davinci@'
export const KEY_COLUMN = 'davinciUniqueId'

export const ECHARTS_RENDERER = 'echarts'

export const DEFAULT_FONT_WEIGHT = 'normal'
export const DEFAULT_FONT_SIZE = '12px'
export const DEFAULT_FONT_FAMILY = '"Helvetica Neue For Number", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif'

export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'
export const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
