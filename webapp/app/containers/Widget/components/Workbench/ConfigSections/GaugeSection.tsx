/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import * as React from 'react'
import { Row, Col, Input, Checkbox, Select, InputNumber } from 'antd'
const Option = Select.Option
import ColorPicker from 'app/components/ColorPicker'
import {
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_CHART_LINE_STYLES,
  PIVOT_CHART_FONT_SIZES,
  CHART_LABEL_POSITIONS,
  CHART_PIE_LABEL_POSITIONS,
  CHART_FUNNEL_LABEL_POSITIONS
} from 'app/globalConstants'
const styles = require('../Workbench.less')

export interface IGaugeConfig {
  radius: number
  splitNumber: number
  startAngle: number
  endAngle: number
  clockwise: boolean
  max: number
  prefix: string
  suffix: string
  showTitle: boolean
  titleFontFamily: string
  titleFontSize: string
  titleColor: string
  titleOffsetLeft: number
  titleOffsetTop: number
  showDetail: boolean
  detailFontFamily: string
  detailFontSize: string
  detailColor: string
  detailOffsetLeft: number
  detailOffsetTop: number
  showPointer: boolean
  pointerLength: number
  pointerWidth: number
  customPointerColor: boolean
  pointerColor: string
  pointerBorderStyle: string
  pointerBorderWidth: number
  pointerBorderColor: string
  axisLineSize: number
  axisLineColor: string
  showAxisTick: boolean
  showAxisLabel: boolean
  axisLabelDistance: number
  axisLabelFontFamily: string
  axisLabelFontSize: string
  axisLabelColor: string
  showSplitLine: boolean
  splitLineLength: number
  splitLineSize: string
  splitLineStyle: string
  splitLineColor: string
}

interface IGaugeSectionProps {
  title: string
  config: IGaugeConfig
  onChange: (prop: string, value: any) => void
}

export class GaugeSection extends React.PureComponent<IGaugeSectionProps, {}> {

  private inputChange = (prop) => (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onChange(prop, e.target.value)
  }

  private checkboxChange = (prop) => (e) => {
    this.props.onChange(prop, e.target.checked)
  }

  private selectChange = (prop) => (value) => {
    this.props.onChange(prop, value)
  }

  private colorChange = (prop) => (color) => {
    this.props.onChange(prop, color)
  }

  private inputNumberChange = (prop) => (value) => {
    this.props.onChange(prop, value)
  }

  private percentFormatter = (value) => `${value}%`
  private percentParser = (value) => value.replace('%', '')
  private pixelFormatter = (value) => `${value}px`
  private pixelParser = (value) => value.replace(/[p|x]+/, '')

  private lineStyles = PIVOT_CHART_LINE_STYLES.map((l) => (
    <Option key={l.value} value={l.value}>
      {l.name}
    </Option>
  ))

  public render () {
    const { title, config } = this.props

    const {
      radius,
      splitNumber,
      startAngle,
      endAngle,
      clockwise,
      max,
      prefix,
      suffix,
      showTitle,
      titleFontFamily,
      titleFontSize,
      titleColor,
      titleOffsetLeft,
      titleOffsetTop,
      showDetail,
      detailFontFamily,
      detailFontSize,
      detailColor,
      detailOffsetLeft,
      detailOffsetTop,
      showPointer,
      pointerLength,
      pointerWidth,
      customPointerColor,
      pointerColor,
      pointerBorderStyle,
      pointerBorderWidth,
      pointerBorderColor,
      axisLineSize,
      axisLineColor,
      showAxisTick,
      showAxisLabel,
      axisLabelDistance,
      axisLabelFontFamily,
      axisLabelFontSize,
      axisLabelColor,
      showSplitLine,
      splitLineLength,
      splitLineSize,
      splitLineStyle,
      splitLineColor
    } = config

    const fontFamilies = PIVOT_CHART_FONT_FAMILIES.map((f) => (
      <Option key={f.value} value={f.value}>{f.name}</Option>
    ))
    const fontSizes = PIVOT_CHART_FONT_SIZES.map((f) => (
      <Option key={`${f}`} value={`${f}`}>{f}</Option>
    ))

    return (
      <>
        <div className={styles.paneBlock}>
          <h4>{title}</h4>
          <div className={styles.blockBody}>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={6}>目标值</Col>
              <Col span={10}>
                <InputNumber
                  className={styles.blockElm}
                  value={max}
                  onChange={this.inputNumberChange('max')}
                />
              </Col>
            </Row>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={6}>前缀</Col>
              <Col span={6}>
                <Input
                  className={styles.blockElm}
                  value={prefix}
                  onChange={this.inputChange('prefix')}
                />
              </Col>
              <Col span={6}>后缀</Col>
              <Col span={6}>
                <Input
                  className={styles.blockElm}
                  value={suffix}
                  onChange={this.inputChange('suffix')}
                />
              </Col>
            </Row>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={6}>半径</Col>
              <Col span={6}>
                <InputNumber
                  className={styles.blockElm}
                  value={radius}
                  onChange={this.inputNumberChange('radius')}
                  formatter={this.percentFormatter}
                  parser={this.percentParser}
                />
              </Col>
              <Col span={6}>分隔段数</Col>
              <Col span={6}>
                <InputNumber
                  className={styles.blockElm}
                  value={splitNumber}
                  min={1}
                  onChange={this.inputNumberChange('splitNumber')}
                />
              </Col>
            </Row>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={6}>起始角度</Col>
              <Col span={6}>
                <InputNumber
                  className={styles.blockElm}
                  value={startAngle}
                  onChange={this.inputNumberChange('startAngle')}
                />
              </Col>
              <Col span={6}>结束角度</Col>
              <Col span={6}>
                <InputNumber
                  className={styles.blockElm}
                  value={endAngle}
                  onChange={this.inputNumberChange('endAngle')}
                />
              </Col>
            </Row>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={10}>
                <Checkbox
                  checked={clockwise}
                  onChange={this.checkboxChange('clockwise')}
                >
                  顺时针
                </Checkbox>
              </Col>
            </Row>
          </div>
        </div>
        <div className={styles.paneBlock}>
          <h4>标题</h4>
          <div className={styles.blockBody}>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={10}>
                <Checkbox
                  checked={showTitle}
                  onChange={this.checkboxChange('showTitle')}
                >
                  显示标题
                </Checkbox>
              </Col>
            </Row>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
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
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={6}>距离左侧</Col>
              <Col span={12}>
                <InputNumber
                  className={styles.blockElm}
                  value={titleOffsetLeft}
                  onChange={this.inputNumberChange('titleOffsetLeft')}
                  formatter={this.percentFormatter}
                  parser={this.percentParser}
                />
              </Col>
            </Row>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={6}>距离顶部</Col>
              <Col span={12}>
                <InputNumber
                  className={styles.blockElm}
                  value={titleOffsetTop}
                  onChange={this.inputNumberChange('titleOffsetTop')}
                  formatter={this.percentFormatter}
                  parser={this.percentParser}
                />
              </Col>
            </Row>
          </div>
        </div>
        <div className={styles.paneBlock}>
          <h4>数据</h4>
          <div className={styles.blockBody}>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={10}>
                <Checkbox
                  checked={showDetail}
                  onChange={this.checkboxChange('showDetail')}
                >
                  显示数据
                </Checkbox>
              </Col>
            </Row>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={10}>
                <Select
                  placeholder="字体"
                  className={styles.blockElm}
                  value={detailFontFamily}
                  onChange={this.selectChange('detailFontFamily')}
                >
                  {fontFamilies}
                </Select>
              </Col>
              <Col span={10}>
                <Select
                  placeholder="文字大小"
                  className={styles.blockElm}
                  value={detailFontSize}
                  onChange={this.selectChange('detailFontSize')}
                >
                  {fontSizes}
                </Select>
              </Col>
              <Col span={4}>
                <ColorPicker
                  value={detailColor}
                  onChange={this.colorChange('detailColor')}
                />
              </Col>
            </Row>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={6}>距离左侧</Col>
              <Col span={12}>
                <InputNumber
                  className={styles.blockElm}
                  value={detailOffsetLeft}
                  onChange={this.inputNumberChange('detailOffsetLeft')}
                  formatter={this.percentFormatter}
                  parser={this.percentParser}
                />
              </Col>
            </Row>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={6}>距离顶部</Col>
              <Col span={12}>
                <InputNumber
                  className={styles.blockElm}
                  value={detailOffsetTop}
                  onChange={this.inputNumberChange('detailOffsetTop')}
                  formatter={this.percentFormatter}
                  parser={this.percentParser}
                />
              </Col>
            </Row>
          </div>
        </div>
        <div className={styles.paneBlock}>
          <h4>指针</h4>
          <div className={styles.blockBody}>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={10}>
                <Checkbox
                  checked={showPointer}
                  onChange={this.checkboxChange('showPointer')}
                >
                  显示指针
                </Checkbox>
              </Col>
              <Col span={10}>
                <Checkbox
                  checked={customPointerColor}
                  onChange={this.checkboxChange('customPointerColor')}
                >
                  自定颜色
                </Checkbox>
              </Col>
              {
                customPointerColor && (
                  <Col span={4}>
                    <ColorPicker
                      value={pointerColor}
                      onChange={this.colorChange('pointerColor')}
                    />
                  </Col>
                )
              }
            </Row>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={4}>长度</Col>
              <Col span={8}>
                <InputNumber
                  className={styles.blockElm}
                  value={pointerLength}
                  onChange={this.inputNumberChange('pointerLength')}
                  formatter={this.percentFormatter}
                  parser={this.percentParser}
                />
              </Col>
              <Col span={4}>粗细</Col>
              <Col span={8}>
                <InputNumber
                  className={styles.blockElm}
                  value={pointerWidth}
                  onChange={this.inputNumberChange('pointerWidth')}
                  formatter={this.pixelFormatter}
                  parser={this.pixelParser}
                />
              </Col>
            </Row>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={4}>边框</Col>
              <Col span={8}>
                <Select
                  placeholder="样式"
                  className={styles.blockElm}
                  value={pointerBorderStyle}
                  onChange={this.selectChange('pointerBorderStyle')}
                >
                  {this.lineStyles}
                </Select>
              </Col>
              <Col span={8}>
                <InputNumber
                  placeholder="粗细"
                  className={styles.blockElm}
                  value={pointerBorderWidth}
                  min={0}
                  onChange={this.selectChange('pointerBorderWidth')}
                />
              </Col>
              <Col span={4}>
                <ColorPicker
                  value={pointerBorderColor}
                  onChange={this.selectChange('pointerBorderColor')}
                />
              </Col>
            </Row>
          </div>
        </div>
        <div className={styles.paneBlock}>
          <h4>轴</h4>
          <div className={styles.blockBody}>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={4}>粗细</Col>
              <Col span={8}>
                <InputNumber
                  className={styles.blockElm}
                  value={axisLineSize}
                  onChange={this.selectChange('axisLineSize')}
                  formatter={this.pixelFormatter}
                  parser={this.pixelParser}
                />
              </Col>
              <Col span={4}>颜色</Col>
              <Col span={4}>
                <ColorPicker
                  value={axisLineColor}
                  onChange={this.colorChange('axisLineColor')}
                />
              </Col>
            </Row>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={12}>
                <Checkbox
                  checked={showAxisTick}
                  onChange={this.checkboxChange('showAxisTick')}
                >
                  显示刻度
                </Checkbox>
              </Col>
            </Row>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={12}>
                <Checkbox
                  checked={showAxisLabel}
                  onChange={this.checkboxChange('showAxisLabel')}
                >
                  显示标签
                </Checkbox>
              </Col>
            </Row>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={10}>
                <Select
                  placeholder="标签字体"
                  className={styles.blockElm}
                  value={axisLabelFontFamily}
                  onChange={this.selectChange('axisLabelFontFamily')}
                >
                  {fontFamilies}
                </Select>
              </Col>
              <Col span={10}>
                <Select
                  placeholder="标签文字大小"
                  className={styles.blockElm}
                  value={axisLabelFontSize}
                  onChange={this.selectChange('axisLabelFontSize')}
                >
                  {fontSizes}
                </Select>
              </Col>
              <Col span={4}>
                <ColorPicker
                  value={axisLabelColor}
                  onChange={this.colorChange('axisLabelColor')}
                />
              </Col>
            </Row>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={6}>距离轴线</Col>
              <Col span={12}>
                <InputNumber
                  className={styles.blockElm}
                  value={axisLabelDistance}
                  onChange={this.inputNumberChange('axisLabelDistance')}
                />
              </Col>
            </Row>
          </div>
        </div>
        <div className={styles.paneBlock}>
          <h4>分隔线</h4>
          <div className={styles.blockBody}>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={16}>
                <Checkbox
                  checked={showSplitLine}
                  onChange={this.checkboxChange('showSplitLine')}
                >
                  显示分隔线
                </Checkbox>
              </Col>
            </Row>
          </div>
        </div>
      </>
    )
  }
}

export default GaugeSection
