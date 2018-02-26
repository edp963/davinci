import React, { PureComponent, PropTypes } from 'react'

import Input from 'antd/lib/input'
import Button from 'antd/lib/button'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import config, { env } from '../../globalConfig'
// FIXME
const apiHost = `${location.origin}${config[env].host}`
const shareHost = `${location.origin}${config[env].shareHost}`

import styles from './SharePanel.less'

export class ShareForm extends PureComponent {
  handleInputSelect = (inputRefName) => () => {
    this.refs[inputRefName].refs.input.select()
    document.execCommand('copy')
  }

  render () {
    const {
      type,
      shareInfo,
      // downloadCsvLoading,
      // onDownloadCsv
    } = this.props

    let linkValue = ''

    switch (type) {
      case 'dashboard':
        linkValue = `${shareHost}/#share?shareInfo=${encodeURI(shareInfo)}&type=dashboard`
        break
      case 'widget':
        linkValue = `${shareHost}/#share?shareInfo=${encodeURI(shareInfo)}&type=widget`
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
              ref="shareLinkInput"
              value={linkValue}
              addonAfter={
                <span
                  style={{cursor: 'pointer'}}
                  onClick={this.handleInputSelect('shareLinkInput')}
                >
                  复制
                </span>
              }
              readOnly
            />
          </Col>
        </Row>
        {
          type !== 'dashboard'
            ? <div>
              <Row className={styles.shareRow}>
                <Col span={5}>
                  <span className={styles.shareText}>HTML：</span>
                </Col>
                <Col span={19}>
                  <Input
                    className={styles.shareInput}
                    ref="shareHtmlInput"
                    value={`${apiHost}/shares/html/${encodeURI(shareInfo)}`}
                    addonAfter={
                      <span
                        style={{cursor: 'pointer'}}
                        onClick={this.handleInputSelect('shareHtmlInput')}
                      >
                        复制
                      </span>
                    }
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

ShareForm.propTypes = {
  type: PropTypes.string,
  shareInfo: PropTypes.string,
  // downloadCsvLoading: PropTypes.bool,
  // onDownloadCsv: PropTypes.func
}

export default ShareForm
