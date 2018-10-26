import * as React from 'react'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Checkbox = require('antd/lib/checkbox')
const Radio = require('antd/lib/radio/radio')
const RadioGroup = Radio.Group
const Select = require('antd/lib/select')
const Option = Select.Option
const InputNumber = require('antd/lib/input-number')
const styles = require('../Workbench.less')
import { CHART_SORT_MODES, CHART_ALIGNMENT_MODES, CHART_LAYER_TYPES, CHART_LAYER_TYPES_NO_LINES } from '../../../../../globalConstants'

export interface ISpecConfig {
  smooth?: boolean
  step?: boolean
  roseType?: boolean
  circle?: boolean
  sortMode?: string
  alignmentMode?: string
  gapNumber?: number
  shape?: 'polygon' | 'circle'
  roam?: boolean
  layerType?: string
  layout?: 'horizontal' | 'vertical'

  // for sankey
  nodeWidth: number
  nodeGap: number,
  orient: 'horizontal' | 'vertical'
  draggable: boolean
}

interface ISpecSectionProps {
  isShowLines: boolean
  title: string
  config: ISpecConfig
  onChange: (prop: string, value: any) => void
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
    const { title, config, isShowLines } = this.props

    const {
      roseType,
      circle,
      sortMode,
      alignmentMode,
      gapNumber,
      shape,
      layerType,
      roam,
      layout,
      smooth,
      // for sankey
      nodeWidth,
      nodeGap,
      orient,
      draggable
    } = config

    const sortModes = CHART_SORT_MODES.map((f) => (
      <Option key={f.value} value={f.value}>{f.name}</Option>
    ))

    const alignmentModes = CHART_ALIGNMENT_MODES.map((f) => (
      <Option key={f.value} value={f.value}>{f.name}</Option>
    ))

    const layerTypes = isShowLines
      ? CHART_LAYER_TYPES.map((p) => (
        <Option key={p.value} value={p.value}>{p.name}</Option>
      ))
      : CHART_LAYER_TYPES_NO_LINES.map((p) => (
        <Option key={p.value} value={p.value}>{p.name}</Option>
      ))

    let renderHtml
    switch (title) {
      case '饼图':
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
      case '漏斗图':
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
      case '雷达图':
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
      case '地图':
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
            </div>
          </div>
        )
        break
      case '平行坐标图':
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
      case '桑基图':
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
