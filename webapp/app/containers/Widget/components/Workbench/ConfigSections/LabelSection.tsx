import React from 'react'
import { Row, Col, Checkbox, Select } from 'antd'
const Option = Select.Option
const CheckboxGroup = Checkbox.Group
import ColorPicker from 'components/ColorPicker'
import {
  CHART_LABEL_POSITIONS,
  CHART_PIE_LABEL_POSITIONS,
  CHART_FUNNEL_LABEL_POSITIONS
} from 'app/globalConstants'
import { chartFontFamilyOptions, chartFontSizeOptions } from './constants'
const styles = require('../Workbench.less')

export interface ILabelConfig {
  showLabel: boolean
  labelPosition?: string
  labelFontFamily: string
  labelFontSize: string
  labelColor: string
  labelParts?: Array<
    | 'dimensionName'
    | 'dimensionValue'
    | 'indicatorName'
    | 'indicatorValue'
    | 'percentage'
    | 'conversion'
    | 'arrival'
  >
  pieLabelPosition?: string
  funnelLabelPosition?: string
}

interface ILabelSectionProps {
  title: string
  config: ILabelConfig
  onChange: (prop: string, value: any) => void
  name: string
}

export class LabelSection extends React.PureComponent<ILabelSectionProps, {}> {
  private static LabelOptions: Array<{
    label: string
    value: ILabelConfig['labelParts'][number]
    charts: string[]
  }> = [
    { label: '维度名称', value: 'dimensionName', charts: [] },
    { label: '维度值', value: 'dimensionValue', charts: ['pie', 'funnel'] },
    { label: '指标名称', value: 'indicatorName', charts: ['radar'] },
    {
      label: '指标值',
      value: 'indicatorValue',
      charts: ['pie', 'funnel', 'radar']
    },
    { label: '转化率', value: 'conversion', charts: ['funnel'] },
    { label: '到达率', value: 'arrival', charts: ['funnel'] },
    { label: '百分比', value: 'percentage', charts: ['pie', 'funnel'] }
  ]

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
    const { title, config, name } = this.props

    const {
      showLabel,
      labelPosition,
      labelFontFamily,
      labelFontSize,
      labelColor,
      labelParts,
      pieLabelPosition,
      funnelLabelPosition
    } = config

    let positionValues
    let positionName
    let positionChangeName
    const labelOptions = LabelSection.LabelOptions.filter((option) =>
      option.charts.includes(name)
    ).map(({ label, value }) => ({ label, value }))
    switch (name) {
      case 'pie':
        positionValues = CHART_PIE_LABEL_POSITIONS
        positionName = pieLabelPosition
        positionChangeName = 'pieLabelPosition'
        break
      case 'funnel':
        positionValues = CHART_FUNNEL_LABEL_POSITIONS
        positionName = funnelLabelPosition
        positionChangeName = 'funnelLabelPosition'
        break
      default:
        positionValues = CHART_LABEL_POSITIONS
        positionName = labelPosition
        positionChangeName = 'labelPosition'
        break
    }
    const positions = positionValues.map((p) => (
      <Option key={p.value} value={p.value}>
        {p.name}
      </Option>
    ))

    const labelPositionSetting = positionName !== void 0 && (
      <>
        <Col key="posLabel" span={4}>
          位置
        </Col>
        <Col key="posSetting" span={10}>
          <Select
            placeholder="位置"
            className={styles.blockElm}
            value={positionName}
            onChange={this.selectChange(positionChangeName)}
          >
            {positions}
          </Select>
        </Col>
      </>
    )

    return (
      <div className={styles.paneBlock}>
        <h4>{title}</h4>
        <div className={styles.blockBody}>
          <Row
            gutter={8}
            type="flex"
            align="middle"
            className={styles.blockRow}
          >
            <Col span={10}>
              <Checkbox
                checked={showLabel}
                onChange={this.checkboxChange('showLabel')}
              >
                显示标签
              </Checkbox>
            </Col>
            {labelPositionSetting}
          </Row>
          <Row
            gutter={8}
            type="flex"
            align="middle"
            className={styles.blockRow}
          >
            <Col span={10}>
              <Select
                placeholder="字体"
                className={styles.blockElm}
                value={labelFontFamily}
                onChange={this.selectChange('labelFontFamily')}
              >
                {chartFontFamilyOptions}
              </Select>
            </Col>
            <Col span={10}>
              <Select
                placeholder="文字大小"
                className={styles.blockElm}
                value={labelFontSize}
                onChange={this.selectChange('labelFontSize')}
              >
                {chartFontSizeOptions}
              </Select>
            </Col>
            <Col span={4}>
              <ColorPicker
                value={labelColor}
                onChange={this.colorChange('labelColor')}
              />
            </Col>
          </Row>
          {!!labelOptions.length && (
            <Row
              gutter={8}
              type="flex"
              align="middle"
            >
              <Col span={24}>
                <CheckboxGroup
                  value={labelParts}
                  options={labelOptions}
                  onChange={this.selectChange('labelParts')}
                />
              </Col>
            </Row>
          )}
        </div>
      </div>
    )
  }
}

export default LabelSection
