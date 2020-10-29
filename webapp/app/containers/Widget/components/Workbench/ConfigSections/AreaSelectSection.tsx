import React from 'react'
import { Row, Col, InputNumber } from 'antd'
import ColorPicker from 'components/ColorPicker'
const styles = require('../Workbench.less')

export interface IAreaSelectConfig {
  width: number
  borderWidth: number
  borderColor: string
  color: string
  opacity: number
}

interface IAreaSelectSectionProps {
  title: string
  config: IAreaSelectConfig
  onChange: (prop: string, value: any) => void
}

export class AreaSelectSection extends React.PureComponent<IAreaSelectSectionProps, {}> {

  private inputNumberChange = (prop) => (value) => {
    this.props.onChange(prop, value)
  }

  private colorChange = (prop) => (color) => {
    this.props.onChange(prop, color)
  }

  public render () {
    const { title, config } = this.props

    const {
      width,
      borderWidth,
      borderColor,
      color,
      opacity
    } = config

    return (
      <div className={styles.paneBlock}>
        <h4>{title}</h4>
        <div className={styles.blockBody}>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={6}>背景</Col>
            <Col span={14}>
              <InputNumber
                placeholder="width"
                className={styles.blockElm}
                value={width}
                min={1}
                onChange={this.inputNumberChange('width')}
              />
            </Col>
            <Col span={4}>
              <ColorPicker
                value={color}
                onChange={this.colorChange('color')}
                disableAlpha
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={6}>边框</Col>
            <Col span={14}>
              <InputNumber
                placeholder="borderWidth"
                className={styles.blockElm}
                value={borderWidth}
                min={1}
                onChange={this.inputNumberChange('borderWidth')}
              />
            </Col>
            <Col span={4}>
              <ColorPicker
                value={borderColor}
                onChange={this.colorChange('borderColor')}
                disableAlpha
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={6}>透明度</Col>
            <Col span={8}>
              <InputNumber
                placeholder="opacity"
                className={styles.blockElm}
                value={opacity}
                min={0}
                max={1}
                onChange={this.inputNumberChange('opacity')}
              />
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

export default AreaSelectSection
