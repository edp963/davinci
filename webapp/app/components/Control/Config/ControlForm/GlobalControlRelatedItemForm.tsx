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

import React, { FC, memo } from 'react'
import { Checkbox, Input } from 'antd'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { IFlatRelatedItem } from './types'
import utilStyles from 'assets/less/util.less'
import styles from '../../Control.less'

interface IGlobalControlRelatedItemFormProps {
  form: WrappedFormUtils
  relatedItems: IFlatRelatedItem[]
  onItemCheck: (id: number) => () => void
  onCheckAll: (e: CheckboxChangeEvent) => void
}

const GlobalControlRelatedItemForm: FC<IGlobalControlRelatedItemFormProps> = ({
  form,
  relatedItems,
  onItemCheck,
  onCheckAll
}) => {
  const { getFieldDecorator } = form
  const checkAll = relatedItems.every((item) => item.checked)

  return (
    <div className={styles.itemContainer}>
      <div className={styles.title}>
        <h2>关联图表</h2>
        <Checkbox
          className={`${styles.checkAll} ${styles.action}`}
          checked={checkAll}
          onChange={onCheckAll}
        >
          全选
        </Checkbox>
      </div>
      <ul>
        {relatedItems.map(({ id, name }) => (
          <li key={id}>
            {getFieldDecorator(
              `relatedItems[${id}].viewId`,
              {}
            )(<Input className={utilStyles.hide} />)}
            {getFieldDecorator(`relatedItems[${id}].checked`, {
              valuePropName: 'checked'
            })(
              <Checkbox className={styles.checkbox} onChange={onItemCheck(id)}>
                {name}
              </Checkbox>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default memo(GlobalControlRelatedItemForm)
