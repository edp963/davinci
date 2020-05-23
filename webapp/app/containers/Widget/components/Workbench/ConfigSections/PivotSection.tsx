import * as React from 'react'
import { Row, Col, Select } from 'antd'
const Option = Select.Option
import ColorPicker from 'components/ColorPicker'
import { PIVOT_CHART_FONT_FAMILIES, PIVOT_CHART_FONT_SIZES, PIVOT_CHART_LINE_STYLES } from 'app/globalConstants'
const styles = require('../Workbench.less')

export interface IPivotConfig {
  fontFamily: string
  fontSize: string
  color: string
  lineStyle: string
  lineColor: string
  headerBackgroundColor: string
}

interface IPivotSectionProps {
  title: string
  config: IPivotConfig
  onChange: (prop: string, value: any) => void
}

export class PivotSection extends React.PureComponent<IPivotSectionProps, {}> {
  private selectChange = (prop) => (value) => {
    this.props.onChange(prop, value)
  }

  private colorChange = (prop) => (color) => {
    this.props.onChange(prop, color)
  }

  public render () {
    const { title, config } = this.props

    const {
      fontFamily,
      fontSize,
      color,
      lineStyle,
      lineColor,
      headerBackgroundColor
    } = config

    const fontFamilies = PIVOT_CHART_FONT_FAMILIES.map((f) => (
      <Option key={f.value} value={f.value}>{f.name}</Option>
    ))
    const fontSizes = PIVOT_CHART_FONT_SIZES.map((f) => (
      <Option key={f} value={`${f}`}>{f}</Option>
    ))
    const lineStyles = PIVOT_CHART_LINE_STYLES.map((l) => (
      <Option key={l.value} value={l.value}>{l.name}</Option>
    ))

    return (
      <div className={styles.paneBlock}>
        <h4>{title}</h4>
        <div className={styles.blockBody}>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={4}>文字</Col>
            <Col span={8}>
              <Select
                placeholder="字体"
                className={styles.blockElm}
                value={fontFamily}
                onChange={this.selectChange('fontFamily')}
              >
                {fontFamilies}
              </Select>
            </Col>
            <Col span={8}>
              <Select
                placeholder="文字大小"
                className={styles.blockElm}
                value={fontSize}
                onChange={this.selectChange('fontSize')}
              >
                {fontSizes}
              </Select>
            </Col>
            <Col span={4}>
              <ColorPicker
                value={color}
                onChange={this.colorChange('color')}
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={4}>边框</Col>
            <Col span={8}>
              <Select
                placeholder="样式"
                className={styles.blockElm}
                value={lineStyle}
                onChange={this.selectChange('lineStyle')}
              >
                {lineStyles}
              </Select>
            </Col>
            <Col span={8} />
            <Col span={4}>
              <ColorPicker
                value={lineColor}
                onChange={this.colorChange('lineColor')}
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={20}>表头背景颜色</Col>
            <Col span={4}>
              <ColorPicker
                value={headerBackgroundColor}
                onChange={this.colorChange('headerBackgroundColor')}
              />
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

export default PivotSection
