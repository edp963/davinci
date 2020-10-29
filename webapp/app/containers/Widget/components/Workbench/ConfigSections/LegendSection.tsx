import React from 'react'
import { Row, Col, Checkbox, Select } from 'antd'
const Option = Select.Option
import ColorPicker from 'components/ColorPicker'
import { PIVOT_CHART_FONT_FAMILIES, PIVOT_CHART_LINE_STYLES, PIVOT_CHART_FONT_SIZES, CHART_LEGEND_POSITIONS } from 'app/globalConstants'
const styles = require('../Workbench.less')

export interface ILegendConfig {
  showLegend: boolean
  legendPosition: string
  selectAll: boolean
  fontFamily: string
  fontSize: string
  color: string
}

interface ILegendSectionProps {
  title: string
  config: ILegendConfig
  onChange: (prop: string, value: any) => void
}

export class LegendSection extends React.PureComponent<ILegendSectionProps, {}> {
  private checkboxChange = (prop) => (e) => {
    this.props.onChange(prop, e.target.checked)
  }

  private selectChange = (prop) => (value) => {
    this.props.onChange(prop, value)
  }

  private colorChange = (prop) => (color) => {
    this.props.onChange(prop, color)
  }

  public render () {
    const { title, config } = this.props

    const {
      showLegend,
      legendPosition,
      selectAll,
      fontFamily,
      fontSize,
      color
    } = config

    const positions = CHART_LEGEND_POSITIONS.map((p) => (
      <Option key={p.value} value={p.value}>{p.name}</Option>
    ))
    const fontFamilies = PIVOT_CHART_FONT_FAMILIES.map((f) => (
      <Option key={f.value} value={f.value}>{f.name}</Option>
    ))
    const fontSizes = PIVOT_CHART_FONT_SIZES.map((f) => (
      <Option key={f} value={`${f}`}>{f}</Option>
    ))

    return (
      <div className={styles.paneBlock}>
        <h4>{title}</h4>
        <div className={styles.blockBody}>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={24}>
              <Checkbox
                checked={showLegend}
                onChange={this.checkboxChange('showLegend')}
              >
                显示图例
              </Checkbox>
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={10}>
              <Checkbox
                checked={selectAll}
                onChange={this.checkboxChange('selectAll')}
              >
                是否全选
              </Checkbox>
            </Col>
            <Col span={4}>位置</Col>
            <Col span={10}>
              <Select
                placeholder="位置"
                className={styles.blockElm}
                value={legendPosition}
                onChange={this.selectChange('legendPosition')}
              >
                {positions}
              </Select>
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={10}>
              <Select
                placeholder="字体"
                className={styles.blockElm}
                value={fontFamily}
                onChange={this.selectChange('fontFamily')}
              >
                {fontFamilies}
              </Select>
            </Col>
            <Col span={10}>
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
        </div>
      </div>
    )
  }
}

export default LegendSection
