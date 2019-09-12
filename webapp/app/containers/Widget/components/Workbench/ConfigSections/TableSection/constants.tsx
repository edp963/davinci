
import React from 'react'
import { Select } from 'antd'
const { Option } = Select

import { TABLE_PAGE_SIZES } from 'app/globalConstants'

export const pageSizeOptions = TABLE_PAGE_SIZES.map((s) => (
  <Option value={s.toString()} key={s.toString()}>{s}条/页</Option>
))
