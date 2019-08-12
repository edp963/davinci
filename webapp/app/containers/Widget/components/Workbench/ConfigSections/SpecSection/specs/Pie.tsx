import React from 'react'
import { Row, Col, Checkbox } from 'antd'

import { onSectionChange } from './util'
import { ISpecConfig } from '../types'

import styles from '../../../Workbench.less'

interface ISpecSectionPieProps {
  spec: ISpecConfig
  title: string
  onChange: (value: string | number, propPath: string | string[]) => void
}

function SpecSectionPie (props: ISpecSectionPieProps) {
  const { spec, title, onChange } = props
  const { circle, roseType } = spec

  return (
    <div className={styles.paneBlock}>
      <h4>{title}</h4>
      <div className={styles.blockBody}>
        <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
          <Col span={10}>
            <Checkbox checked={circle} onChange={onSectionChange(onChange, 'circle')}>
              环状
            </Checkbox>
          </Col>
          <Col span={12}>
            <Checkbox
              checked={roseType}
              onChange={onSectionChange(onChange, 'roseType')}
            >
              南丁格尔玫瑰
            </Checkbox>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default SpecSectionPie
