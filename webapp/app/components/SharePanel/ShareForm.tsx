/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import React, { useRef, useMemo, useCallback, ReactElement } from 'react'

import { Input, Row, Col, Button, message } from 'antd'
import config, { env } from 'app/globalConfig'
// FIXME
const apiHost = `${location.origin}${config[env].host}`
const shareHost = `${location.origin}${config[env].shareHost}`
const styles = require('./SharePanel.less')
import { copyTextToClipboard } from './utils'
import { TCopyType } from './types'
interface IShareFormProps {
  type: string
  shareToken: string
  pwd?: string
}
const ShareForm: React.FC<IShareFormProps> = ({ type, shareToken, pwd }) => {
  const resolve = useCallback(() => message.success('复制链接成功'), [])

  const reject = useCallback(
    () => message.warning('复制链接失败，请稍后重试'),
    []
  )

  const copy = useCallback(
    (copytype: TCopyType) => () => {
      const text =
        copytype === 'link' ? linkValue : `链接: ${linkValue} 口令: ${pwd}`
      copyTextToClipboard(text, resolve, reject)
    },
    [type, shareToken, pwd]
  )

  const linkValue = useMemo(() => {
    let linkValue = ''

    switch (type) {
      case 'dashboard':
        linkValue = `${shareHost}?shareToken=${encodeURI(
          shareToken
        )}&type=dashboard#share/dashboard`
        break
      case 'widget':
        linkValue = `${shareHost}?shareToken=${encodeURI(
          shareToken
        )}&type=widget#share/dashboard`
        break
      case 'display':
        linkValue = `${shareHost}?shareToken=${encodeURI(
          shareToken
        )}&type=display#share/display`
        break
      default:
        break
    }
    return linkValue
  }, [type, shareToken])

  const Content: ReactElement = useMemo(() => {
    if (pwd && pwd.length) {
      return (
        <>
          <Row className={styles.shareRow}>
            <Col span={24}>
              <Input
                className={styles.shareInput}
                value={linkValue}
                addonAfter={
                  <>
                    <span style={{ cursor: 'pointer' }} onClick={copy('link')}>
                      复制链接
                    </span>
                  </>
                }
                readOnly
              />
            </Col>
          </Row>
          <Row type="flex" justify="space-between">
            <Col span={11}>
              <Input
                className={styles.shareInput}
                value={pwd}
                addonBefore={
                  <>
                    <span>口令:</span>
                  </>
                }
                readOnly
              />
            </Col>
            <Col span={9}>
              <Button
                className={styles.pwdButton}
                onClick={copy('linkPwd')}
                type="primary"
              >
                复制链接及口令
              </Button>
            </Col>
          </Row>
        </>
      )
    } else {
      return (
        <Row className={styles.shareRow}>
          <Col span={24}>
            <Input
              className={styles.shareInput}
              value={linkValue}
              addonAfter={
                <>
                  <span style={{ cursor: 'pointer' }} onClick={copy('link')}>
                    复制链接
                  </span>
                </>
              }
              readOnly
            />
          </Col>
        </Row>
      )
    }
  }, [pwd, shareToken, type])

  return Content
}

export default ShareForm
