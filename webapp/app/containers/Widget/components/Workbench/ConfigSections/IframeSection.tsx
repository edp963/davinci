import * as React from 'react'
import * as debounce from 'lodash/debounce'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Input from 'antd/lib/input'
const styles = require('../Workbench.less')

export interface IframeConfig {
  src: string
}

interface IframeSectionProps {
  title: string
  config: IframeConfig
  onChange: (prop: string, value: any) => void
}

export class IframeSection extends React.PureComponent<IframeSectionProps, {}> {

  private debounceInputChange = null

  constructor (props: IframeSectionProps) {
    super(props)
    this.debounceInputChange = debounce(props.onChange, 2000)
  }

  private inputChange = (prop) => (e: React.ChangeEvent<HTMLInputElement>) => {
    this.debounceInputChange(prop, e.target.value)
  }

  public render () {
    const { title, config } = this.props
    const { src } = config

    return (
      <div className={styles.paneBlock}>
        <h4>{title}</h4>
        <div className={styles.blockBody}>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={24}>
              <Input onChange={this.inputChange('src')} placeholder="网页地址" value={src}/>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

export default IframeSection
