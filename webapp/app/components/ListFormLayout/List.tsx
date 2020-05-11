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

import React, { FC } from 'react'
import classnames from 'classnames'
import { Icon } from 'antd'
import styles from './ListFormLayout.less'

interface IListProps {
  title?: string
  className?: string
  onAddItem?: () => void
}

export const List: FC<IListProps> = ({
  title,
  className,
  onAddItem,
  children
}) => {
  const listClass = classnames({
    [styles.list]: true,
    [className]: !!className
  })
  return (
    <div className={styles.listContainer}>
      <div className={styles.title}>
        <h2>{title}</h2>
        <Icon type="plus" {...(onAddItem && { onClick: onAddItem })} />
      </div>
      <div className={listClass}>{children}</div>
    </div>
  )
}

export default List
