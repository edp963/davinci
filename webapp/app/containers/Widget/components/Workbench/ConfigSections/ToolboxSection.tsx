import React from 'react'
import { Row, Col, Checkbox } from 'antd'
const styles = require('../Workbench.less')

export interface IToolboxConfig {
  showToolbox: boolean
}

interface IToolboxSectionProps {
  title: string
  config: IToolboxConfig
  onChange: (prop: string, value: any) => void
}

export class ToolboxSection extends React.PureComponent<IToolboxSectionProps, {}> {
  private checkboxChange = (prop) => (e) => {
    this.props.onChange(prop, e.target.checked)
  }

  public render () {
    const { title, config } = this.props
    const { showToolbox } = config

    return (
      <div className={styles.paneBlock}>
        <h4>{title}</h4>
        <div className={styles.blockBody}>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={24}>
              <Checkbox
                checked={showToolbox}
                onChange={this.checkboxChange('showToolbox')}
              >
                Toolbox
              </Checkbox>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

export default ToolboxSection
