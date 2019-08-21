import React, { createRef } from 'react'

import { Input, Row, Col} from 'antd'
import config, { env } from 'app/globalConfig'
// FIXME
const apiHost = `${location.origin}${config[env].host}`
const shareHost = `${location.origin}${config[env].shareHost}`

const styles = require('./SharePanel.less')

interface IShareFormProps {
  type: string
  shareInfo: string
}

export class ShareForm extends React.PureComponent<IShareFormProps, {}> {

  private shareLinkInput = createRef<Input>()

  private handleInputSelect = () => {
    this.shareLinkInput.current.input.select()
    document.execCommand('copy')
  }

  public render () {
    const {
      type,
      shareInfo
    } = this.props

    let linkValue = ''

    switch (type) {
      case 'dashboard':
        linkValue = `${shareHost}#share/dashboard?shareInfo=${encodeURI(shareInfo)}&type=dashboard`
        break
      case 'widget':
        linkValue = `${shareHost}#share/dashboard?shareInfo=${encodeURI(shareInfo)}&type=widget`
        break
      case 'display':
        linkValue = `${shareHost}#share/display?shareInfo=${encodeURI(shareInfo)}`
        break
      default:
        break
    }

    return (
      <div>
        <Row className={styles.shareRow}>
          <Col span={5}>
            <span className={styles.shareText}>链接：</span>
          </Col>
          <Col span={19}>
            <Input
              className={styles.shareInput}
              value={linkValue}
              addonAfter={
                <span
                  style={{cursor: 'pointer'}}
                  onClick={this.handleInputSelect}
                >
                  复制
                </span>
              }
              ref={this.shareLinkInput}
              readOnly
            />
          </Col>
        </Row>
      </div>
    )
  }
}

export default ShareForm
