import React from 'react'
import { Row, Col, Checkbox, Select, InputNumber } from 'antd'

import { onSectionChange } from './util'
import { ISpecConfig } from '../types'
import { chartLayerTypeOptions, chartSymbolTypeOptions } from '../../constants'

import styles from '../../../Workbench.less'

interface ISpecSectionMapProps {
  spec: ISpecConfig
  isLegendSection: boolean
  title: string
  onChange: (value: string | number, propPath: string | string[]) => void
}

function SpecSectionMap (props: ISpecSectionMapProps) {
  const { spec, isLegendSection, title, onChange } = props
  const { roam, layerType, linesSpeed, symbolType } = spec

  return (
    <div className={styles.paneBlock}>
      <h4>{title}</h4>
      <div className={styles.blockBody}>
        <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
          <Col span={10}>
            <Checkbox checked={roam} onChange={onSectionChange(onChange, 'roam')}>
              移动&缩放
            </Checkbox>
          </Col>
          <Col span={4}>类型</Col>
          <Col span={10}>
            <Select
              placeholder="类型"
              className={styles.blockElm}
              value={layerType}
              onChange={onSectionChange(onChange, 'layerType')}
            >
              {chartLayerTypeOptions}
            </Select>
          </Col>
        </Row>
        {isLegendSection ? (
          <Row
            gutter={8}
            type="flex"
            align="middle"
            className={styles.blockRow}
          >
            <Col span={4}>速度</Col>
            <Col span={6}>
              <InputNumber
                placeholder="speed"
                className={styles.blockElm}
                value={linesSpeed}
                min={0}
                onChange={onSectionChange(onChange, 'linesSpeed')}
              />
            </Col>
            <Col span={4}>标记</Col>
            <Col span={10}>
              <Select
                placeholder="标记"
                className={styles.blockElm}
                value={symbolType}
                onChange={onSectionChange(onChange, 'symbolType')}
              >
                {chartSymbolTypeOptions}
              </Select>
            </Col>
          </Row>
        ) : null}
      </div>
    </div>
  )
}

export default SpecSectionMap
