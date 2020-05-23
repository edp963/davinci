import * as React from 'react'
import { Row, Col, Checkbox, Select, InputNumber } from 'antd'
const Option = Select.Option
import ColorPicker from 'components/ColorPicker'
import { PIVOT_CHART_FONT_FAMILIES, PIVOT_CHART_LINE_STYLES, PIVOT_CHART_FONT_SIZES, CHART_VISUALMAP_POSITIONS, CHART_VISUALMAP_DIRECYTIONS } from 'app/globalConstants'
const styles = require('../Workbench.less')

export interface IVisualMapConfig {
  showVisualMap: boolean
  visualMapPosition: string
  fontFamily: string
  fontSize: string
  visualMapDirection: string
  visualMapWidth: number
  visualMapHeight: number
  startColor: string
  endColor: string
}

interface IVisualMapSectionProps {
  title: string
  config: IVisualMapConfig
  onChange: (prop: string, value: any) => void
}

export class VisualMapSection extends React.PureComponent<IVisualMapSectionProps, {}> {
  private checkboxChange = (prop) => (e) => {
    this.props.onChange(prop, e.target.checked)
  }

  private selectChange = (prop) => (value) => {
    this.props.onChange(prop, value)
  }

  private colorChange = (prop) => (color) => {
    this.props.onChange(prop, color)
  }

  private changeRadio = (prop) => (e) => {
    this.props.onChange(prop, e.target.value)
  }

  private inputNumberChange = (prop) => (value) => {
    this.props.onChange(prop, value)
  }

  public render () {
    const { title, config } = this.props

    const {
      showVisualMap,
      visualMapPosition,
      fontFamily,
      fontSize,
      visualMapDirection,
      visualMapWidth,
      visualMapHeight,
      startColor,
      endColor
    } = config

    const positions = CHART_VISUALMAP_POSITIONS.map((p) => (
      <Option key={p.value} value={p.value}>{p.name}</Option>
    ))
    const directions = CHART_VISUALMAP_DIRECYTIONS.map((p) => (
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
            <Col span={12}>
              <Checkbox
                checked={showVisualMap}
                onChange={this.checkboxChange('showVisualMap')}
              >
                显示视觉映射
              </Checkbox>
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={4}>方向</Col>
            <Col span={8}>
              <Select
                placeholder="方向"
                className={styles.blockElm}
                value={visualMapDirection}
                onChange={this.selectChange('visualMapDirection')}
              >
                {directions}
              </Select>
            </Col>
            <Col span={4}>位置</Col>
            <Col span={8}>
              <Select
                placeholder="位置"
                className={styles.blockElm}
                value={visualMapPosition}
                onChange={this.selectChange('visualMapPosition')}
              >
                {positions}
              </Select>
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={4}>宽度</Col>
            <Col span={8}>
              <InputNumber
                placeholder="width"
                className={styles.blockElm}
                value={visualMapWidth}
                min={1}
                onChange={this.inputNumberChange('visualMapWidth')}
              />
            </Col>
            <Col span={4}>高度</Col>
            <Col span={8}>
              <InputNumber
                placeholder="height"
                className={styles.blockElm}
                value={visualMapHeight}
                min={1}
                onChange={this.inputNumberChange('visualMapHeight')}
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={12}>
              <Select
                placeholder="字体"
                className={styles.blockElm}
                value={fontFamily}
                onChange={this.selectChange('fontFamily')}
              >
                {fontFamilies}
              </Select>
            </Col>
            <Col span={12}>
              <Select
                placeholder="文字大小"
                className={styles.blockElm}
                value={fontSize}
                onChange={this.selectChange('fontSize')}
              >
                {fontSizes}
              </Select>
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={8}>起始颜色</Col>
            <Col span={4}>
              <ColorPicker
                value={startColor}
                onChange={this.colorChange('startColor')}
              />
            </Col>
            <Col span={8}>结束颜色</Col>
            <Col span={4}>
              <ColorPicker
                value={endColor}
                onChange={this.colorChange('endColor')}
              />
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

export default VisualMapSection
