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

import React from 'react'

import { Row, Col, Button, InputNumber, Tooltip, Popover, Tag } from 'antd'

import Styles from '../View.less'

export interface IEditorBottomProps {
  sqlLimit: number
  loading: boolean
  nextDisabled: boolean
  isLastExecuteWholeSql: boolean
  sqlFragment: string
  onSetSqlLimit: (limit: number) => void
  onExecuteSql: () => void
  onStepChange: (stepChange: number) => void
}

const stepChange = (onStepChange: IEditorBottomProps['onStepChange'], step: number) => () => {
  onStepChange(step)
}

export const EditorBottom = (props: IEditorBottomProps) => {
  const { sqlLimit, loading, nextDisabled, isLastExecuteWholeSql, sqlFragment, onSetSqlLimit, onExecuteSql, onStepChange } = props
  const STATUS_BTN_TEXT = !loading ? '执行' : '中止'
  const SELECT_CONTENT_BTN_TEXT = sqlFragment ? '选中内容' : ''
  const NEXT_DISABLED_AS_EXECUTE_FRAGMENT_TEXT = !isLastExecuteWholeSql ? '执行完整sql后可用' : ''
  const NEXT_DISABLED_AS_SQL_CHANGED_TEXT = nextDisabled ? '执行后下一步可用' : NEXT_DISABLED_AS_EXECUTE_FRAGMENT_TEXT
  const shortcutsContent = (
    <Row>
      <Col span={8}>执行 / 中止：</Col>
      <Col span={16}>
        <Tag color="orange">Ctrl + Enter</Tag>(Windows)
      </Col>
      <Col offset={8} span={16}>
        <Tag color="orange">Cmd + Enter</Tag>(Mac OS)
      </Col>
    </Row>
  )
  return (
    <Row className={Styles.bottom} type="flex" align="middle" justify="start">
    <Col span={12} className={Styles.previewInput}>
      <span>展示前</span>
      <InputNumber value={sqlLimit} onChange={onSetSqlLimit} />
      <span>条数据</span>
    </Col>
    <Col span={12} className={Styles.toolBtns}>
      <Popover
        title="快捷键"
        content={shortcutsContent}
        overlayClassName={Styles.shortcuts}
      >
        <i className="iconfont icon-shortcuts_icon" />
      </Popover>
      <Button onClick={stepChange(onStepChange, -1)}>取消</Button>
      <Button
        type="primary"
        icon={!loading ? 'caret-right' : 'pause-circle'}
        onClick={onExecuteSql}
      >
        {STATUS_BTN_TEXT + SELECT_CONTENT_BTN_TEXT}
      </Button>
      <Tooltip title={NEXT_DISABLED_AS_SQL_CHANGED_TEXT}>
        <Button onClick={stepChange(onStepChange, 1)} disabled={nextDisabled || !isLastExecuteWholeSql}>
          下一步
        </Button>
      </Tooltip>
    </Col>
  </Row>
  )
}

export default React.memo(EditorBottom)
