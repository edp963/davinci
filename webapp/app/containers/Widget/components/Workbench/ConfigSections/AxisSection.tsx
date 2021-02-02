import React from 'react'
import { Row, Col, Checkbox, Select, InputNumber } from 'antd'
const Option = Select.Option
import ColorPicker from 'components/ColorPicker'
import { PIVOT_CHART_FONT_FAMILIES, PIVOT_CHART_LINE_STYLES, PIVOT_CHART_FONT_SIZES } from 'app/globalConstants'
import { getCorrectInputNumber } from '../../util'
const styles = require('../Workbench.less')

export interface IAxisConfig {
  inverse: boolean
  showLine: boolean
  lineStyle: 'solid' | 'dashed' | 'dotted'
  lineSize: string
  lineColor: string
  showLabel: boolean
  labelFontFamily: string
  labelFontSize: string
  labelColor: string
  labelStyle: 'normal' | 'italic' | 'oblique'
  labelWeight: 'normal' | 'bold' | 'bolder' | 'lighter'
  showTitleAndUnit?: boolean
  nameLocation: 'start' | 'middle' | 'center' | 'end'
  nameRotate?: number
  nameGap?: number
  titleFontFamily?: string
  titleFontStyle?: string
  titleFontSize?: string
  titleColor?: string
  showInterval?: boolean
  xAxisInterval?: number
  xAxisRotate?: number
  min?: number
  max?: number
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

  private inputNumberChange = (prop) => (value) => {
    this.props.onChange(prop, getCorrectInputNumber(value))
  }

  private colorChange = (prop) => (color) => {
    this.props.onChange(prop, color)
  }

  public render () {
    const { title, config } = this.props

    const {
      showLine,
      inverse,
      lineStyle,
      lineSize,
      lineColor,
      showLabel,
      labelFontFamily,
      labelFontSize,
      labelColor,
      labelStyle,
      labelWeight,
      showTitleAndUnit,
      nameLocation,
      nameRotate,
      nameGap,
      titleFontFamily,
      titleFontStyle,
      titleFontSize,
      titleColor,
      showInterval,
      xAxisInterval,
      xAxisRotate,
      min,
      max
    } = config

    const lineStyles = PIVOT_CHART_LINE_STYLES.map((l) => (
      <Option key={l.value} value={l.value}>{l.name}</Option>
    ))
    const fontFamilies = PIVOT_CHART_FONT_FAMILIES.map((f) => (
      <Option key={f.value} value={f.value}>{f.name}</Option>
    ))
    const fontSizes = PIVOT_CHART_FONT_SIZES.map((f) => (
      <Option key={`${f}`} value={`${f}`}>{f}</Option>
    ))

    const xAxisLabel = showTitleAndUnit === void 0 && [(
      <Row key="gap1" gutter={8} type="flex" align="middle" className={styles.blockRow}>
        <Col span={2} />
        <Col span={8}>旋转角度</Col>
        <Col span={10}>
            <InputNumber
              placeholder="xAxisRotate"
              className={styles.blockElm}
              value={xAxisRotate}
              onChange={this.inputNumberChange('xAxisRotate')}
            />
        </Col>
      </Row>
    ), (
      <Row key="gap" gutter={8} type="flex" align="middle" className={styles.blockRow}>
        <Col span={2}>
          <Checkbox
            checked={showInterval}
            onChange={this.checkboxChange('showInterval')}
          />
        </Col>
        <Col span={8}>刻度间隔</Col>
        <Col span={10}>
          <InputNumber
            placeholder="xAxisInterval"
            className={styles.blockElm}
            value={xAxisInterval}
            onChange={this.inputNumberChange('xAxisInterval')}
            disabled={!showInterval}
          />
        </Col>
      </Row>
    )]

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
    ), (
      <Row key="location" gutter={8} type="flex" align="middle" className={styles.blockRow}>
        <Col span={12}>标题位置</Col>
        <Col span={10}>
          <Select
            placeholder="位置"
            className={styles.blockElm}
            value={nameLocation}
            onChange={this.selectChange('nameLocation')}
          >
            <Option key="start" value="start">开始</Option>
            <Option key="center" value="middle">中间</Option>
            <Option key="end" value="end">结束</Option>
          </Select>
        </Col>
      </Row>
    ), (
      <Row key="rotate" gutter={8} type="flex" align="middle" className={styles.blockRow}>
        <Col span={12}>标题旋转</Col>
        <Col span={10}>
          <InputNumber
            placeholder="width"
            className={styles.blockElm}
            value={nameRotate}
            onChange={this.inputNumberChange('nameRotate')}
          />
        </Col>
      </Row>
    ), (
      <Row key="gap" gutter={8} type="flex" align="middle" className={styles.blockRow}>
        <Col span={12}>标题与轴线距离</Col>
        <Col span={10}>
          <InputNumber
            placeholder="nameGap"
            className={styles.blockElm}
            value={nameGap}
            onChange={this.inputNumberChange('nameGap')}
          />
        </Col>
      </Row>
    ), (
      <Row key="min" gutter={8} type="flex" align="middle" className={styles.blockRow}>
        <Col span={12}>最小值</Col>
        <Col span={10}>
          <InputNumber
            className={styles.blockElm}
            value={min}
            onChange={this.inputNumberChange('min')}
          />
        </Col>
      </Row>
    ), (
      <Row key="max" gutter={8} type="flex" align="middle" className={styles.blockRow}>
        <Col span={12}>最大值</Col>
        <Col span={10}>
          <InputNumber
            className={styles.blockElm}
            value={max}
            onChange={this.inputNumberChange('max')}
          />
        </Col>
      </Row>
    )]
    return (
      <div className={styles.paneBlock}>
        <h4>{title}</h4>
        <div className={styles.blockBody}>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={12}>
              <Checkbox
                checked={showLine}
                onChange={this.checkboxChange('showLine')}
              >
                显示坐标轴
              </Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox
                checked={inverse}
                onChange={this.checkboxChange('inverse')}
              >
                坐标轴反转
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
          {xAxisLabel}
          {titleAndUnit}
        </div>
      </div>
    )
  }
}

export default AxisSection
