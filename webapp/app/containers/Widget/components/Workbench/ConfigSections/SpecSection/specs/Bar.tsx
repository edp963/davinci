import React from 'react'
import { Row, Col, Checkbox } from 'antd'

import { onSectionChange } from './util'
import { ISpecConfig } from '../types'

import styles from '../../../Workbench.less'

interface ISpecSectionBarProps {
  spec: ISpecConfig
  title: string
  onChange: (value: string | number, propPath: string | string[]) => void
}

function SpecSectionBar (props: ISpecSectionBarProps) {
  const { spec, title, onChange } = props
  const { stack, barChart, percentage } = spec

  return (
    <div className={styles.paneBlock}>
      <h4>{title}</h4>
      <div className={styles.blockBody}>
        <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
          <Col span={12}>
            <Checkbox checked={stack} onChange={onSectionChange(onChange, 'stack')}>
              堆叠
            </Checkbox>
          </Col>
          <Col span={12}>
            <Checkbox
              checked={barChart}
              onChange={onSectionChange(onChange, 'barChart')}
            >
              条形图
            </Checkbox>
          </Col>
        </Row>
        <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
          <Col span={12}>
            <Checkbox
              checked={percentage}
              onChange={onSectionChange(onChange, 'percentage')}
            >
              百分比堆积
            </Checkbox>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default SpecSectionBar
