import React from 'react'
import { Row, Col, InputNumber, Select } from 'antd'
const Option = Select.Option
import ColorPicker from 'components/ColorPicker'
import { PIVOT_CHART_LINE_STYLES } from '../../../../../../app/globalConstants'
import { IBarConfig } from './'

const styles = require('../Workbench.less')

interface IBarSectionProps {
  config: IBarConfig
  onChange: (prop: string, value: number | string, propPath: string[]) => void
}

export class BarSection extends React.PureComponent<IBarSectionProps> {

  private lineStyles = PIVOT_CHART_LINE_STYLES.map((l) => (
    <Option key={l.value} value={l.value}>{l.name}</Option>
  ))

  private propChange = (propName: string, propPath?: string) => (value: number | string) => {
    this.props.onChange(propName, value, propPath ? [propPath] : [])
  }

  public render () {
    const { config } = this.props
    const { border, gap, width: gapWidth } = config
    const { color, width, type, radius } = border

    return (
      <div className={styles.paneBlock}>
        <div className={styles.blockBody}>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={10}>
              <Select
                placeholder="样式"
                className={styles.blockElm}
                value={type}
                onChange={this.propChange('type', 'border')}
              >
                {this.lineStyles}
              </Select>
            </Col>
            <Col span={10}>
              <InputNumber
                placeholder="粗细"
                className={styles.blockElm}
                value={width}
                min={0}
                onChange={this.propChange('width', 'border')}
              />
            </Col>
            <Col span={4}>
              <ColorPicker
                value={color}
                onChange={this.propChange('color', 'border')}
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={14}>边框圆角</Col>
            <Col span={10}>
              <InputNumber
                className={styles.blockElm}
                value={radius}
                min={0}
                onChange={this.propChange('radius', 'border')}
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={14}>柱条宽度</Col>
            <Col span={10}>
              <InputNumber
                className={styles.blockElm}
                value={gapWidth}
                onChange={this.propChange('width')}
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={14}>不同系列间柱条间隔</Col>
            <Col span={10}>
              <InputNumber
                className={styles.blockElm}
                value={gap}
                onChange={this.propChange('gap')}
              />
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

export default BarSection
