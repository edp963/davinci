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
const Input = require('antd/lib/input')
const styles = require('./Bizlogic.less')

interface ITeamTreeActionProps {
  currentItem: {
    id: number,
    name: string,
    checked: boolean,
    params: ITeamParams[]
  },
  teamParams: ITeamParams[]
  onTeamParamChange: (id: number, index: number) => any
}

interface ITeamParams {
  k: string,
  v: string
}

export class TeamTreeAction extends React.PureComponent<ITeamTreeActionProps, {}> {


  public render () {
    const {
      currentItem,
      teamParams,
      onTeamParamChange
    } = this.props

    const paramsInput = (teamParams.length === 1 && teamParams[0].k === '')
    ? ''
    : teamParams.map((tp, index) => {
        return (
          <Input
            defaultValue={(currentItem.params.length && currentItem.params[index]) ? currentItem.params[index].v : ''}
            className={styles.teamInput}
            key={index}
            onChange={onTeamParamChange(currentItem.id, index)}
            disabled={!currentItem.checked}
            placeholder={tp.k}
          />
          )
      })

    return (
      <div className={styles.teamTree}>
        <span className={styles.teamTreeTitle}>{currentItem.name}</span>
        {paramsInput}
      </div>
    )
  }
}

export default TeamTreeAction
