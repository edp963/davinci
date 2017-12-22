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

import React, { PropTypes } from 'react'

import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Transfer from 'antd/lib/transfer'

export function GroupTransfer (props) {
  return (
    <Row>
      <Col span={24}>
        <Transfer
          titles={['列表', '已选']}
          listStyle={{width: '220px'}}
          dataSource={props.source}
          rowKey={s => s.id}
          targetKeys={props.target}
          render={item => item.name}
          onChange={(nextTargetKeys, direction, moveKeys) => {
            props.onChange(nextTargetKeys)
          }}
        />
      </Col>
    </Row>
  )
}

GroupTransfer.propTypes = {
  source: PropTypes.array.isRequired,
  target: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
}

export default GroupTransfer
