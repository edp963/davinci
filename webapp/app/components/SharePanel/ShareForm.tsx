import * as React from 'react'

const Input = require('antd/lib/input')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
import config, { env } from '../../globalConfig'
// FIXME
const apiHost = `${location.origin}${config[env].host}`
const shareHost = `${location.origin}${config[env].shareHost}`

const styles = require('./SharePanel.less')

interface IShareFormProps {
  type: string
  shareInfo: string
}

export class ShareForm extends React.PureComponent<IShareFormProps, {}> {
  private shareLinkInput = null
  private shareHtmlInput = null

  private handleInputSelect = (inputRefName) => () => {
    this[inputRefName].refs.input.select()
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
                  onClick={this.handleInputSelect('shareLinkInput')}
                >
                  复制
                </span>
              }
              ref={(f) => this.shareLinkInput = f}
              readOnly
            />
          </Col>
        </Row>
        {
          type === 'widget'
            ? <div>
              <Row className={styles.shareRow}>
                <Col span={5}>
                  <span className={styles.shareText}>HTML：</span>
                </Col>
                <Col span={19}>
                  <Input
                    className={styles.shareInput}
                    value={`${apiHost}/shares/html/${encodeURI(shareInfo)}`}
                    addonAfter={
                      <span
                        style={{cursor: 'pointer'}}
                        onClick={this.handleInputSelect('shareHtmlInput')}
                      >
                        复制
                      </span>
                    }
                    ref={(f) => this.shareHtmlInput = f}
                    readOnly
                  />
                </Col>
              </Row>
            </div>
            : ''
        }
      </div>
    )
  }
}

export default ShareForm
