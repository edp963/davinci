import * as React from 'react'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Checkbox = require('antd/lib/checkbox')
const Radio = require('antd/lib/radio')
const RadioGroup = Radio.Group
const Select = require('antd/lib/select')
const Option = Select.Option
const InputNumber = require('antd/lib/input-number')
const styles = require('../Workbench.less')
import { CHART_SORT_MODES, CHART_ALIGNMENT_MODES } from '../../../../../globalConstants'

export interface ISpecConfig {
  smooth?: boolean
  step?: boolean
  roseType?: boolean
  circle?: boolean
  sortMode?: string
  alignmentMode?: string
  gapNumber?: number
}

interface ISpecSectionProps {
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
    const { title, config } = this.props

    const {
      roseType,
      circle,
      sortMode,
      alignmentMode,
      gapNumber
    } = config

    const sortModes = CHART_SORT_MODES.map((f) => (
      <Option key={f.value} value={f.value}>{f.name}</Option>
    ))

    const alignmentModes = CHART_ALIGNMENT_MODES.map((f) => (
      <Option key={f.value} value={f.value}>{f.name}</Option>
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
