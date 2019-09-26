import * as React from 'react'
import { Row, Col, Checkbox, Select} from 'antd'
const Option = Select.Option
import ColorPicker from 'components/ColorPicker'
import { PIVOT_CHART_LINE_STYLES } from 'app/globalConstants'
const styles = require('../Workbench.less')

export interface ISplitLineConfig {
  showHorizontalLine: boolean
  horizontalLineStyle: 'solid' | 'dashed' | 'dotted'
  horizontalLineSize: string
  horizontalLineColor: string
  showVerticalLine: boolean
  verticalLineStyle: 'solid' | 'dashed' | 'dotted'
  verticalLineSize: string
  verticalLineColor: string
}

interface ISplitLineSectionProps {
  title: string
  config: ISplitLineConfig
  onChange: (prop: string, value: any) => void
}

export class SplitLineSection extends React.PureComponent<ISplitLineSectionProps, {}> {
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
      showHorizontalLine,
      horizontalLineStyle,
      horizontalLineSize,
      horizontalLineColor,
      showVerticalLine,
      verticalLineStyle,
      verticalLineSize,
      verticalLineColor
    } = config

    const lineStyles = PIVOT_CHART_LINE_STYLES.map((l) => (
      <Option key={l.value} value={l.value}>{l.name}</Option>
    ))

    return (
      <div className={styles.paneBlock}>
        <h4>{title}</h4>
        <div className={styles.blockBody}>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={24}>
              <Checkbox
                checked={showHorizontalLine}
                onChange={this.checkboxChange('showHorizontalLine')}
              >
                显示横向分隔线
              </Checkbox>
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={10}>
              <Select
                placeholder="样式"
                className={styles.blockElm}
                value={horizontalLineStyle}
                onChange={this.selectChange('horizontalLineStyle')}
              >
                {lineStyles}
              </Select>
            </Col>
            <Col span={10}>
              <Select
                placeholder="粗细"
                className={styles.blockElm}
                value={horizontalLineSize}
                onChange={this.selectChange('horizontalLineSize')}
              >
                {Array.from(Array(10), (o, i) => (
                    <Option key={i} value={`${i + 1}`}>{i + 1}</Option>
                  ))}
              </Select>
            </Col>
            <Col span={4}>
              <ColorPicker
                value={horizontalLineColor}
                onChange={this.colorChange('horizontalLineColor')}
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={24}>
              <Checkbox
                checked={showVerticalLine}
                onChange={this.checkboxChange('showVerticalLine')}
              >
                显示纵向分隔线
              </Checkbox>
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={10}>
              <Select
                placeholder="样式"
                className={styles.blockElm}
                value={verticalLineStyle}
                onChange={this.selectChange('verticalLineStyle')}
              >
                {lineStyles}
              </Select>
            </Col>
            <Col span={10}>
              <Select
                placeholder="粗细"
                className={styles.blockElm}
                value={verticalLineSize}
                onChange={this.selectChange('verticalLineSize')}
              >
                {Array.from(Array(10), (o, i) => (
                    <Option key={i} value={`${i + 1}`}>{i + 1}</Option>
                  ))}
              </Select>
            </Col>
            <Col span={4}>
              <ColorPicker
                value={verticalLineColor}
                onChange={this.colorChange('verticalLineColor')}
              />
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

export default SplitLineSection
