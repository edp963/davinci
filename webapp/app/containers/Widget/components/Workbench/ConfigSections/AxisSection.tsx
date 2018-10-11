import * as React from 'react'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Checkbox = require('antd/lib/checkbox')
const Select = require('antd/lib/select')
const Option = Select.Option
import ColorPicker from '../../../../../components/ColorPicker'
import { PIVOT_CHART_FONT_FAMILIES, PIVOT_CHART_LINE_STYLES, PIVOT_CHART_FONT_SIZES } from '../../../../../globalConstants'
const styles = require('../Workbench.less')

export interface IAxisConfig {
  showLine: boolean
  lineStyle: string
  lineSize: string
  lineColor: string
  showLabel: boolean
  labelFontFamily: string
  labelFontSize: string
  labelColor: string
  showTitleAndUnit?: boolean
  titleFontFamily?: string
  titleFontSize?: string
  titleColor?: string
}

interface IAxisSectionProps {
  title: string
  config: IAxisConfig
  onChange: (prop: string, value: any) => void
}

export class AxisSection extends React.PureComponent<IAxisSectionProps, {}> {
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
      showLine,
      lineStyle,
      lineSize,
      lineColor,
      showLabel,
      labelFontFamily,
      labelFontSize,
      labelColor,
      showTitleAndUnit,
      titleFontFamily,
      titleFontSize,
      titleColor
    } = config

    const lineStyles = PIVOT_CHART_LINE_STYLES.map((l) => (
      <Option key={l.value} value={l.value}>{l.name}</Option>
    ))
    const fontFamilies = PIVOT_CHART_FONT_FAMILIES.map((f) => (
      <Option key={f.value} value={f.value}>{f.name}</Option>
    ))
    const fontSizes = PIVOT_CHART_FONT_SIZES.map((f) => (
      <Option key={f} value={`${f}`}>{f}</Option>
    ))

    const titleAndUnit = showTitleAndUnit !== void 0 && [(
      <Row key="title" gutter={8} type="flex" align="middle" className={styles.blockRow}>
        <Col span={24}>
          <Checkbox
            checked={showTitleAndUnit}
            onChange={this.checkboxChange('showTitleAndUnit')}
          >
            显示标题和单位
          </Checkbox>
        </Col>
      </Row>
    ), (
      <Row key="body" gutter={8} type="flex" align="middle" className={styles.blockRow}>
        <Col span={10}>
          <Select
            placeholder="字体"
            className={styles.blockElm}
            value={titleFontFamily}
            onChange={this.selectChange('titleFontFamily')}
          >
            {fontFamilies}
          </Select>
        </Col>
        <Col span={10}>
          <Select
            placeholder="文字大小"
            className={styles.blockElm}
            value={titleFontSize}
            onChange={this.selectChange('titleFontSize')}
          >
            {fontSizes}
          </Select>
        </Col>
        <Col span={4}>
          <ColorPicker
            value={titleColor}
            onChange={this.colorChange('titleColor')}
          />
        </Col>
      </Row>
    )]
    return (
      <div className={styles.paneBlock}>
        <h4>{title}</h4>
        <div className={styles.blockBody}>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={24}>
              <Checkbox
                checked={showLine}
                onChange={this.checkboxChange('showLine')}
              >
                显示坐标轴
              </Checkbox>
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={10}>
              <Select
                placeholder="样式"
                className={styles.blockElm}
                value={lineStyle}
                onChange={this.selectChange('lineStyle')}
              >
                {lineStyles}
              </Select>
            </Col>
            <Col span={10}>
              <Select
                placeholder="粗细"
                className={styles.blockElm}
                value={lineSize}
                onChange={this.selectChange('lineSize')}
              >
                {Array.from(Array(10), (o, i) => (
                    <Option key={i} value={`${i + 1}`}>{i + 1}</Option>
                  ))}
              </Select>
            </Col>
            <Col span={4}>
              <ColorPicker
                value={lineColor}
                onChange={this.colorChange('lineColor')}
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={24}>
              <Checkbox
                checked={showLabel}
                onChange={this.checkboxChange('showLabel')}
              >
                显示标签文字
              </Checkbox>
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={10}>
              <Select
                placeholder="字体"
                className={styles.blockElm}
                value={labelFontFamily}
                onChange={this.selectChange('labelFontFamily')}
              >
                {fontFamilies}
              </Select>
            </Col>
            <Col span={10}>
              <Select
                placeholder="文字大小"
                className={styles.blockElm}
                value={labelFontSize}
                onChange={this.selectChange('labelFontSize')}
              >
                {fontSizes}
              </Select>
            </Col>
            <Col span={4}>
              <ColorPicker
                value={labelColor}
                onChange={this.colorChange('labelColor')}
              />
            </Col>
          </Row>
          {titleAndUnit}
        </div>
      </div>
    )
  }
}

export default AxisSection
