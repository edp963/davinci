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

export const CLIENT_VERSION = '0.3-rc'
export const API_HOST = '/api/v3'
export const SHARE_HOST = `${location.origin}/share.html`
export const EXTERNAL_LOG_OUT_URL = '/login/oauth2/logout'

const defaultEchartsTheme = require('assets/json/echartsThemes/default.project.json')
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
export const TABLE_PAGE_SIZES = [10, 20, 30, 40, 50, 100]

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
export const PIVOT_CHART_FONT_SIZES = [10, 12, 13, 14, 15, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 128]
export const PIVOT_CHART_FONT_WEIGHTS = ['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900']
export const PIVOT_CHART_FONT_STYLE = [
  { name: '普通', value: 'normal' },
  { name: '斜体', value: 'oblique' }
]
export const CHART_LABEL_POSITIONS = [
  { name: '上', value: 'top' },
  { name: '左', value: 'left' },
  { name: '右', value: 'right' },
  { name: '下', value: 'bottom' },
  { name: '内', value: 'inside' },
  { name: '内左', value: 'insideLeft' },
  { name: '内右', value: 'insideRight' },
  { name: '内上', value: 'insideTop' },
  { name: '内下', value: 'insideBottom' },
  { name: '内左上', value: 'insideTopLeft' },
  { name: '内左下', value: 'insideBottomLeft' },
  { name: '内右上', value: 'insideTopRight' },
  { name: '内右下', value: 'insideBottomRight' }
]
export const CHART_PIE_LABEL_POSITIONS = [
  { name: '外侧', value: 'outside'},
  { name: '内部', value: 'inside'},
  { name: '中心', value: 'center'}
]
export const CHART_FUNNEL_LABEL_POSITIONS = [
  { name: '左侧', value: 'left'},
  { name: '右侧', value: 'right'},
  { name: '内部', value: 'inside'}
]

export const CHART_SORT_MODES = [
  { name: '降序', value: 'descending'},
  { name: '升序', value: 'ascending'},
  { name: '无', value: 'none'}
]

export const CHART_ALIGNMENT_MODES = [
  { name: '居中', value: 'center'},
  { name: '居左', value: 'left'},
  { name: '居右', value: 'right'}
]

export const AXIS_NAME_LOCATIONS = [
  { name: '开始', value: 'start' },
  { name: '结束', value: 'end' },
  { name: '中间', value: 'center' }
]

export const CHART_LEGEND_POSITIONS = [
  { name: '右', value: 'right' },
  { name: '上', value: 'top' },
  { name: '下', value: 'bottom' },
  { name: '左', value: 'left' }
]

export const CHART_VISUALMAP_POSITIONS = [
  { name: '左下', value: 'leftBottom' },
  { name: '左上', value: 'leftTop' },
  { name: '右上', value: 'rightTop' },
  { name: '右下', value: 'rightBottom' }
]

export const CHART_LAYER_TYPES = [
  { name: '地图', value: 'map' },
  { name: '气泡图', value: 'scatter' },
  { name: '热力图', value: 'heatmap' },
  { name: '飞行图', value: 'lines' }
]

export const CHART_LINES_SYMBOL_TYPE = [
  {name: '圆形', value: 'circle'},
  {name: '矩形', value: 'rect'},
  {name: '圆角矩形', value: 'roundRect'},
  {name: '三角形', value: 'triangle'},
  {name: '菱形', value: 'diamond'},
  {name: '大头针形', value: 'pin'},
  {name: '箭头形', value: 'arrow'}
]

export const CHART_VISUALMAP_DIRECYTIONS = [
  { name: '竖直', value: 'vertical' },
  { name: '水平', value: 'horizontal' }
]

export const PIVOT_CHART_YAXIS_OPTIONS = [
  { name: '折线图', value: 'line' },
  { name: '柱状图', value: 'bar' }
]



export const SQL_STRING_TYPES = [
  'CHAR', 'NCHAR', 'VARCHAR', 'NVARCHAR', 'LONGVARCHAR', 'LONGNVARCHAR', 'VARCHAR2', 'NVARCHAR2',
  'STRING', 'TINYTEXT', 'TEXT', 'NTEXT', 'MEDIUMTEXT', 'LONGTEXT',
  'JSON', 'XML', 'LINESTRING', 'MULTILINESTRING',
  'TINYBLOB', 'MEDIUMBLOB', 'BLOB', 'LONGBLOB', 'CBLOB',
  'BINARY', 'VARBINARY', 'LONGVARBINARY', 'ENUM', 'SET', 'NULL', 'ROWID',
  'FIXEDSTRING', 'IPV4', 'IPV6', 'UUID'
]
export const SQL_NUMBER_TYPES = [
  'BIT', 'TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'INTEGER', 'BIGINT',
  'FLOAT', 'DOUBLE', 'DOUBLE PRECISION', 'REAL', 'DECIMAL',
  'BIT', 'SERIAL', 'BOOL', 'BOOLEAN', 'DEC', 'FIXED', 'NUMBER', 'NUMERIC',
  'UINT8', 'UINT16', 'UINT32', 'UINT64', 'INT8', 'INT16', 'INT32', 'INT64',
  'FLOAT32', 'FLOAT64', 'DECIMAL32', 'DECIMAL64', 'DECIMAL128'
]
export const SQL_DATE_TYPES = ['DATE', 'DATETIME', 'TIMESTAMP', 'TIME', 'YEAR']

export const SQL_TYPES = SQL_STRING_TYPES.concat(SQL_NUMBER_TYPES).concat(SQL_DATE_TYPES)

export type SqlTypes = typeof SQL_TYPES[number]

export const DEFAULT_SPLITER = '@davinci@'
export const KEY_COLUMN = 'davinciUniqueId'

export const DEFAULT_FONT_WEIGHT = 'normal'
export const DEFAULT_FONT_STYLE = 'normal'
export const DEFAULT_FONT_SIZE = '14px'
export const DEFAULT_FONT_FAMILY = '"Chinese Quote", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'

export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'
export const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export const DEFAULT_JWT_TOKEN_EXPIRED = 60 * 60 * 1000 // ms
export const DOWNLOAD_LIST_POLLING_FREQUENCY = 30000  // ms
export const DEFAULT_CACHE_EXPIRED = 300  // sec
