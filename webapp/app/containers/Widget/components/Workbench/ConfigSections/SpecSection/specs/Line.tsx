import React from 'react'
import { Row, Col, Checkbox } from 'antd'

import { onSectionChange } from './util'
import { ISpecConfig } from '../types'

import styles from '../../../Workbench.less'

interface ISpecSectionLineProps {
  spec: ISpecConfig
  title: string
  onChange: (value: string | number, propPath: string | string[]) => void
}

function SpecSectionLine (props: ISpecSectionLineProps) {
  const { spec, title, onChange } = props
  const { smooth, step } = spec

  return (
    <div className={styles.paneBlock}>
      <h4>{title}</h4>
      <div className={styles.blockBody}>
        <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
          <Col span={10}>
            <Checkbox checked={smooth} onChange={onSectionChange(onChange, 'smooth')}>
              平滑
            </Checkbox>
          </Col>
          <Col span={12}>
            <Checkbox checked={step} onChange={onSectionChange(onChange, 'step')}>
              阶梯
            </Checkbox>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default SpecSectionLine
