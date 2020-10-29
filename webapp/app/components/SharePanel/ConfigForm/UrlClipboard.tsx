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

import React, { memo } from 'react'
import { Form, Input, Row, Col, Button } from 'antd'
import { TCopyType } from '../types'
import styles from '../SharePanel.less'
const FormItem = Form.Item

interface IUrlClipboardProps {
  shareUrl: string
  password?: string
  onCopy: (copytype: TCopyType) => () => void
}

const UrlClipboard: React.FC<IUrlClipboardProps> = ({
  shareUrl,
  password,
  onCopy
}) => {
  const itemStyle = { labelCol: { span: 6 }, wrapperCol: { span: 17 } }
  return (
    shareUrl && (
      <>
        <Row gutter={8}>
          <Col span={24}>
            <FormItem label="分享链接" {...itemStyle}>
              <Input
                readOnly
                value={shareUrl}
                addonAfter={
                  <span className={styles.copy} onClick={onCopy('link')}>
                    复制链接
                  </span>
                }
              />
            </FormItem>
          </Col>
        </Row>
        {password && (
          <>
            <Row gutter={8}>
              <Col span={24}>
                <FormItem label="口令" {...itemStyle}>
                  <Input
                    readOnly
                    value={password}
                    addonAfter={
                      <span className={styles.copy} onClick={onCopy('all')}>
                        复制链接及口令
                      </span>
                    }
                  />
                </FormItem>
              </Col>
            </Row>
          </>
        )}
      </>
    )
  )
}

export default memo(UrlClipboard)
