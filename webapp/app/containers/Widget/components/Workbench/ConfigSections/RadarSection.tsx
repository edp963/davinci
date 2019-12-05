import React from 'react'
import { Row, Col, Select, Checkbox, InputNumber } from 'antd'
const Option = Select.Option

import { CheckboxChangeEvent } from 'antd/lib/checkbox'

import ColorPicker from 'components/ColorPicker'

import { IRadarConfig } from './'
import { chartFontFamilyOptions, chartFontSizeOptions } from './constants'

import styles from '../Workbench.less'

interface IRadarSectionProps {
  config: IRadarConfig
  onChange: (
    value: string | number | boolean,
    propPath: string | string[]
  ) => void
}

const BasePropPath = ['radar']

const change = (
  onChange: IRadarSectionProps['onChange'],
  propPath:
    | Exclude<keyof IRadarConfig, 'name'>
    | ['name', keyof IRadarConfig['name']]
) => (e: CheckboxChangeEvent | string | number) => {
  const value: string | number | boolean = (e as CheckboxChangeEvent).target
    ? (e as CheckboxChangeEvent).target.checked
    : (e as string | number)

  onChange(value, BasePropPath.concat(propPath as string | string[]))
}

function RadarSection (props: IRadarSectionProps) {
  const { config, onChange } = props
  const { shape, name, nameGap, splitNumber } = config
  const { show, fontFamily, fontSize, color } = name

  return (
    <div className={styles.paneBlock}>
      <div className={styles.blockBody}>
        <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
          <Col span={6}>形状</Col>
          <Col span={12}>
            <Select
              placeholder="形状"
              className={styles.blockElm}
              value={shape}
              onChange={change(onChange, 'shape')}
            >
              <Option key="polygon" value="polygon">
                多边形
              </Option>
              <Option key="circle" value="circle">
                圆形
              </Option>
            </Select>
          </Col>
        </Row>
        <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
          <Col span={6}>轴段数</Col>
          <Col span={12}>
            <InputNumber
              className={styles.blockElm}
              value={splitNumber}
              onChange={change(onChange, 'splitNumber')}
            />
          </Col>
        </Row>
        <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
          <Col span={12}>
            <Checkbox
              checked={show}
              onChange={change(onChange, ['name', 'show'])}
            >
              显示外标签
            </Checkbox>
          </Col>
          {show && (
            <>
              <Col span={4}>距离</Col>
              <Col span={8}>
                <InputNumber
                  className={styles.blockElm}
                  value={nameGap}
                  onChange={change(onChange, 'nameGap')}
                />
              </Col>
            </>
          )}
        </Row>
        {show && (
          <>
            <Row
              gutter={8}
              type="flex"
              align="middle"
              className={styles.blockRow}
            >
              <Col span={10}>
                <Select
                  placeholder="字体"
                  className={styles.blockElm}
                  value={fontFamily}
                  onChange={change(onChange, ['name', 'fontFamily'])}
                >
                  {chartFontFamilyOptions}
                </Select>
              </Col>
              <Col span={10}>
                <Select
                  placeholder="文字大小"
                  className={styles.blockElm}
                  value={fontSize}
                  onChange={change(onChange, ['name', 'fontSize'])}
                >
                  {chartFontSizeOptions}
                </Select>
              </Col>
              <Col span={4}>
                <ColorPicker
                  value={color}
                  onChange={change(onChange, ['name', 'color'])}
                />
              </Col>
            </Row>
          </>
        )}
      </div>
    </div>
  )
}

export default RadarSection
