import React from 'react'
import { Row, Col, Checkbox, InputNumber, Select } from 'antd'

import { onSectionChange } from './util'
import { ISpecConfig } from '../types'
import { chartSortModeOptions, chartAlignmentModeOptions } from '../../constants'

import styles from '../../../Workbench.less'

interface ISpecSectionFunnelProps {
  spec: ISpecConfig
  title: string
  onChange: (value: string | number, propPath: string | string[]) => void
}

function SpecSectionFunnel (props: ISpecSectionFunnelProps) {
  const { spec, title, onChange } = props
  const { sortMode, gapNumber, alignmentMode } = spec

  return (
    <div className={styles.paneBlock}>
      <h4>{title}</h4>
      <div className={styles.blockBody}>
        <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
          <Col span={4}>排序</Col>
          <Col span={8}>
            <Select
              placeholder="排序"
              className={styles.blockElm}
              value={sortMode}
              onChange={onSectionChange(onChange, 'sortMode')}
            >
              {chartSortModeOptions}
            </Select>
          </Col>
          <Col span={4}>间距</Col>
          <Col span={8}>
            <InputNumber
              placeholder="gap"
              className={styles.blockElm}
              value={gapNumber}
              min={0}
              onChange={onSectionChange(onChange, 'gapNumber')}
            />
          </Col>
        </Row>
        <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
          <Col span={4}>对齐</Col>
          <Col span={8}>
            <Select
              placeholder="对齐"
              className={styles.blockElm}
              value={alignmentMode}
              onChange={onSectionChange(onChange, 'alignmentMode')}
            >
              {chartAlignmentModeOptions}
            </Select>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default SpecSectionFunnel
