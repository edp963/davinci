import React from 'react'
import { Row, Col, Checkbox, Select } from 'antd'
const Option = Select.Option

import { onSectionChange } from './util'
import { ISpecConfig } from '../types'

import styles from '../../../Workbench.less'

interface ISpecSectionParallelProps {
  spec: ISpecConfig
  title: string
  onChange: (value: string | number, propPath: string | string[]) => void
}

function SpecSectionParallel (props: ISpecSectionParallelProps) {
  const { spec, title, onChange } = props
  const { smooth, layout } = spec

  return (
    <div className={styles.paneBlock}>
      <h4>{title}</h4>
      <div className={styles.blockBody}>
        <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
          <Col span={18}>
            <Checkbox checked={smooth} onChange={onSectionChange(onChange, 'smooth')}>
              平滑曲线
            </Checkbox>
          </Col>
        </Row>
        <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
          <Col span={8}>坐标轴排列</Col>
          <Col span={10}>
            <Select
              placeholder="排列"
              className={styles.blockElm}
              value={layout}
              onChange={onSectionChange(onChange, 'layout')}
            >
              <Option key="horizontal" value="horizontal">
                水平排列
              </Option>
              <Option key="vertical" value="vertical">
                垂直排列
              </Option>
            </Select>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default SpecSectionParallel
