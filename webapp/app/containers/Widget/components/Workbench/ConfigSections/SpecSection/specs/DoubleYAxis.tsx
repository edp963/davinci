import React from 'react'
import { Row, Col, Checkbox } from 'antd'

import { onSectionChange } from './util'
import { ISpecConfig } from '../types'

import styles from '../../../Workbench.less'

interface ISpecSectionDoubleYAxisProps {
  spec: ISpecConfig
  title: string
  onChange: (value: string | number, propPath: string | string[]) => void
}

function SpecSectionDoubleYAxis (props: ISpecSectionDoubleYAxisProps) {
  const { spec, title, onChange } = props
  const { smooth, step, symbol, label, stack } = spec

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
          <Col span={10}>
            <Checkbox checked={step} onChange={onSectionChange(onChange, 'step')}>
              阶梯
            </Checkbox>
          </Col>
        </Row>
        <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
          <Col span={10}>
            <Checkbox checked={symbol} onChange={onSectionChange(onChange, 'symbol')}>
              节点标记
            </Checkbox>
          </Col>
          {/* <Col span={7}>
                  <Checkbox
                    checked={stack}
                    onChange={onSectionChange(onChange, 'stack')}
                  >
                    堆叠
                  </Checkbox>
                </Col> */}
          <Col span={10}>
            <Checkbox checked={label} onChange={onSectionChange(onChange, 'label')}>
              数值
            </Checkbox>
          </Col>
        </Row>
        <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
          <Col span={10}>
            <Checkbox checked={stack} onChange={onSectionChange(onChange, 'stack')}>
              堆叠
            </Checkbox>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default SpecSectionDoubleYAxis
