import * as React from 'react'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Checkbox = require('antd/lib/checkbox')
const Select = require('antd/lib/select')
const Option = Select.Option
const InputNumber = require('antd/lib/input-number')
const styles = require('../Workbench.less')

export interface ISpecConfig {
  smooth?: boolean
  step?: boolean
  roseType?: boolean
  circle?: boolean
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

  public render () {
    const { title, config } = this.props

    const {
      roseType,
      circle
    } = config

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
