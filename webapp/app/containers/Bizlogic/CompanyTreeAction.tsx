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

import * as React from 'react'
const Tag = require('antd/lib/tag')
const Input = require('antd/lib/input')
const styles = require('./Bizlogic.less')
import { ITeamParams } from '../Bizlogic'

interface ICompanyTreeActionProps {
  depth: number
  currentItem: {
    id: number,
    name: string,
    checked: boolean,
    params: [ITeamParams]
    initValue?: any
    value?: any
  },
  // teamParams: [ITeamParams]
  teamParams: any
  teamSelectData: any
}

export class CompanyTreeAction extends React.PureComponent<ICompanyTreeActionProps, {}> {
  public render () {
    const {
      depth,
      currentItem,
      teamParams,
      teamSelectData
    } = this.props

    const titleWidth = `${-18 * depth}px`
    return (
      <div className={styles.teamTree}>
        <span className={styles.teamTreeTitle} title={currentItem.name}>{currentItem.name}</span>
        <span style={{ marginLeft: titleWidth }}>
          <Input
            type="textarea"
            autosize={{minRows: 2, maxRows: 6}}
            key={currentItem.id}
            className={styles.treeTag}
            defaultValue={currentItem.value.toString()}
            disabled
          />
        </span>
      </div>
    )
  }
}

export default CompanyTreeAction
