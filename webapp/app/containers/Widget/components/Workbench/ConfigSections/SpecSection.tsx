import * as React from 'react'
import { Row, Col, Checkbox, Select, InputNumber } from 'antd'
const Option = Select.Option
const styles = require('../Workbench.less')
import { CHART_SORT_MODES, CHART_ALIGNMENT_MODES, CHART_LAYER_TYPES, CHART_LINES_SYMBOL_TYPE } from '../../../../../globalConstants'

export interface ISpecConfig {
  smooth?: boolean
  stack?: boolean
  barChart?: boolean
  percentage?: boolean
  step?: boolean
  roseType?: boolean
  circle?: boolean
  sortMode?: string
  alignmentMode?: string
  gapNumber?: number
  shape?: 'polygon' | 'circle'
  roam?: boolean
  layerType?: string
  linesSpeed: number
  symbolType: string
  layout?: 'horizontal' | 'vertical'

  // for sankey
  nodeWidth: number
  nodeGap: number,
  orient: 'horizontal' | 'vertical'
  draggable: boolean
  symbol?: boolean
  label?: boolean
}

interface ISpecSectionProps {
  name: string
  title: string
  config: ISpecConfig
  onChange: (prop: string, value: any) => void
  isLegendSection: boolean
}

export class SpecSection extends React.PureComponent<ISpecSectionProps, {}> {
  private checkboxChange = (prop) => (e) => {
    this.props.onChange(prop, e.target.checked)
  }

  private selectChange = (prop) => (value) => {
    this.props.onChange(prop, value)
  }

  private inputNumberChange = (prop) => (value) => {
    this.props.onChange(prop, value)
  }

  public render () {
    const { name, title, config, isLegendSection } = this.props

    const {
      smooth,
      stack,
      barChart,
      percentage,
      step,
      roseType,
      circle,
      sortMode,
      alignmentMode,
      gapNumber,
      shape,
      layerType,
      linesSpeed,
      symbolType,
      roam,
      layout,
      // for sankey
      nodeWidth,
      nodeGap,
      orient,
      draggable,
      symbol,
      label
    } = config

    const sortModes = CHART_SORT_MODES.map((f) => (
      <Option key={f.value} value={f.value}>{f.name}</Option>
    ))

    const alignmentModes = CHART_ALIGNMENT_MODES.map((f) => (
      <Option key={f.value} value={f.value}>{f.name}</Option>
    ))

    const layerTypes = CHART_LAYER_TYPES.map((p) => (
      <Option key={p.value} value={p.value}>{p.name}</Option>
    ))

    const symbolTypes = CHART_LINES_SYMBOL_TYPE.map((p) => (
      <Option key={p.value} value={p.value}>{p.name}</Option>
    ))

    let renderHtml
    switch (name) {
      case 'line':
        renderHtml = (
          <div className={styles.paneBlock}>
            <h4>{title}</h4>
            <div className={styles.blockBody}>
              <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                <Col span={10}>
                  <Checkbox
                    checked={smooth}
                    onChange={this.checkboxChange('smooth')}
                  >
                    平滑
                  </Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox
                    checked={step}
                    onChange={this.checkboxChange('step')}
                  >
                    阶梯
                  </Checkbox>
                </Col>
              </Row>
            </div>
          </div>
        )
        break
      case 'bar':
        renderHtml = (
          <div className={styles.paneBlock}>
            <h4>{title}</h4>
            <div className={styles.blockBody}>
              <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                <Col span={12}>
                  <Checkbox
                    checked={stack}
                    onChange={this.checkboxChange('stack')}
                  >
                    堆叠
                  </Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox
                    checked={barChart}
                    onChange={this.checkboxChange('barChart')}
                  >
                    条形图
                  </Checkbox>
                </Col>
              </Row>
              <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                <Col span={12}>
                  <Checkbox
                    checked={percentage}
                    onChange={this.checkboxChange('percentage')}
                  >
                    百分比堆积
                  </Checkbox>
                </Col>
              </Row>
            </div>
          </div>
        )
        break
      case 'pie':
        renderHtml = (
          <div className={styles.paneBlock}>
            <h4>{title}</h4>
            <div className={styles.blockBody}>
              <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                <Col span={10}>
                  <Checkbox
                    checked={circle}
                    onChange={this.checkboxChange('circle')}
                  >
                    环状
                  </Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox
                    checked={roseType}
                    onChange={this.checkboxChange('roseType')}
                  >
                    南丁格尔玫瑰
                  </Checkbox>
                </Col>
              </Row>
            </div>
          </div>
        )
        break
      case 'funnel':
        renderHtml = (
          <div className={styles.paneBlock}>
            <h4>{title}</h4>
            <div className={styles.blockBody}>
              <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                <Col span={4}>排序</Col>
                <Col span={8}>
                  <Select
                    placeholder="排序"
                    className={styles.blockElm}
                    value={sortMode}
                    onChange={this.selectChange('sortMode')}
                  >
                    {sortModes}
                  </Select>
                </Col>
                <Col span={4}>间距</Col>
                <Col span={8}>
                  <InputNumber
                    placeholder="gap"
                    className={styles.blockElm}
                    value={gapNumber}
                    min={0}
                    onChange={this.inputNumberChange('gapNumber')}
                  />
                </Col>
              </Row>
              <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                <Col span={4}>对齐</Col>
                <Col span={8}>
                  <Select
                    placeholder="对齐"
                    className={styles.blockElm}
                    value={alignmentMode}
                    onChange={this.selectChange('alignmentMode')}
                  >
                    {alignmentModes}
                  </Select>
                </Col>
              </Row>
            </div>
          </div>
        )
        break
      case 'radar':
        renderHtml = (
          <div className={styles.paneBlock}>
            <h4>{title}</h4>
            <div className={styles.blockBody}>
              <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                <Col span={4}>形状</Col>
                <Col span={8}>
                  <Select
                    placeholder="形状"
                    className={styles.blockElm}
                    value={shape}
                    onChange={this.selectChange('shape')}
                  >
                    <Option key="polygon" value="polygon">多边形</Option>
                    <Option key="circle" value="circle">圆形</Option>
                  </Select>
                </Col>
              </Row>
            </div>
          </div>
        )
        break
      case 'map':
        renderHtml = (
          <div className={styles.paneBlock}>
            <h4>{title}</h4>
            <div className={styles.blockBody}>
              <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                <Col span={10}>
                  <Checkbox
                    checked={roam}
                    onChange={this.checkboxChange('roam')}
                  >
                    移动&缩放
                  </Checkbox>
                </Col>
                <Col span={4}>类型</Col>
                <Col span={10}>
                  <Select
                    placeholder="类型"
                    className={styles.blockElm}
                    value={layerType}
                    onChange={this.selectChange('layerType')}
                  >
                    {layerTypes}
                  </Select>
                </Col>
                </Row>
                {
                  isLegendSection
                    ? (
                        <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                          <Col span={4}>速度</Col>
                          <Col span={6}>
                            <InputNumber
                              placeholder="speed"
                              className={styles.blockElm}
                              value={linesSpeed}
                              min={0}
                              onChange={this.inputNumberChange('linesSpeed')}
                            />
                          </Col>
                          <Col span={4}>标记</Col>
                          <Col span={10}>
                            <Select
                              placeholder="标记"
                              className={styles.blockElm}
                              value={symbolType}
                              onChange={this.selectChange('symbolType')}
                            >
                              {symbolTypes}
                            </Select>
                          </Col>
                        </Row>
                    )
                    : null
                }
            </div>
          </div>
        )
        break
      case 'parallel':
        renderHtml = (
          <div className={styles.paneBlock}>
            <h4>{title}</h4>
            <div className={styles.blockBody}>
              <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                <Col span={18}>
                  <Checkbox
                    checked={smooth}
                    onChange={this.checkboxChange('smooth')}
                  >
                    平滑曲线
                  </Checkbox>
                </Col>
              </Row>
              <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                <Col span={8}>坐标轴排列</Col>
                <Col span={10}>
                  <Select
                    placeholder="排列"
                    className={styles.blockElm}
                    value={layout}
                    onChange={this.selectChange('layout')}
                  >
                    <Option key="horizontal" value="horizontal">水平排列</Option>
                    <Option key="vertical" value="vertical">垂直排列</Option>
                  </Select>
                </Col>
              </Row>
            </div>
          </div>
        )
        break
      case 'sankey':
        renderHtml = (
          <div className={styles.paneBlock}>
            <h4>{title}</h4>
            <div className={styles.blockBody}>
              <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                <Col span={18}>
                  <Checkbox
                    checked={draggable}
                    onChange={this.checkboxChange('draggable')}
                  >
                    允许拖动
                  </Checkbox>
                </Col>
              </Row>
              {/* TODO feature in echarts@4.2.0 */}
              {/* <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                <Col span={10}>节点布局方向</Col>
                <Col span={10}>
                  <Select
                    placeholder="排列"
                    className={styles.blockElm}
                    value={orient}
                    onChange={this.selectChange('orient')}
                  >
                    <Option key="horizontal" value="horizontal">水平排列</Option>
                    <Option key="vertical" value="vertical">垂直排列</Option>
                  </Select>
                </Col>
              </Row> */}
              <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                <Col span={6}>节点宽度</Col>
                <Col span={6}>
                  <InputNumber
                    placeholder="nodeWidth"
                    className={styles.blockElm}
                    value={nodeWidth}
                    min={0}
                    onChange={this.inputNumberChange('nodeWidth')}
                  />
                </Col>
                <Col span={6}>节点间隔</Col>
                <Col span={6}>
                  <InputNumber
                    placeholder="nodeGap"
                    className={styles.blockElm}
                    value={nodeGap}
                    min={0}
                    onChange={this.inputNumberChange('nodeGap')}
                  />
                </Col>
              </Row>
            </div>
          </div>
        )
        break
      case 'doubleYAxis':
        renderHtml = (
          <div className={styles.paneBlock}>
            <h4>{title}</h4>
            <div className={styles.blockBody}>
              <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                <Col span={10}>
                  <Checkbox
                    checked={smooth}
                    onChange={this.checkboxChange('smooth')}
                  >
                    平滑
                  </Checkbox>
                </Col>
                <Col span={10}>
                  <Checkbox
                    checked={step}
                    onChange={this.checkboxChange('step')}
                  >
                    阶梯
                  </Checkbox>
                </Col>
              </Row>
              <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                <Col span={10}>
                  <Checkbox
                    checked={symbol}
                    onChange={this.checkboxChange('symbol')}
                  >
                    节点标记
                  </Checkbox>
                </Col>
                {/* <Col span={7}>
                  <Checkbox
                    checked={stack}
                    onChange={this.checkboxChange('stack')}
                  >
                    堆叠
                  </Checkbox>
                </Col> */}
                <Col span={10}>
                  <Checkbox
                    checked={label}
                    onChange={this.checkboxChange('label')}
                  >
                    数值
                  </Checkbox>
                </Col>
                </Row>
            </div>
          </div>
        )
        break
      default:
        renderHtml = (
          <div />
        )
        break
    }

    return renderHtml
  }
}

export default SpecSection
