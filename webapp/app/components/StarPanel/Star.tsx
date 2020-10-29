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
import { IStar, IEvent, IStarUserList } from './types'
const styles = require('./Star.less')
import StarUser from './StarUser'

function stopPPG(e: IEvent) {
  e.stopPropagation()
}

const Star: React.FC<IStar> & {
  StarUser: React.FC<IStarUserList>
} = ({ proId, isStar, unStar, starNum, userList }) => {
  return (
    <div className={styles.starWrapper} onClick={stopPPG}>
      <span onClick={stopPPG}>
        <span className={styles.leftWrapper} onClick={unStar(proId)}>
          <span
            className={`iconfont ${isStar ? 'icon-star1' : 'icon-star'}`}
            style={{ fontSize: '12px' }}
          />
          &nbsp;
          <span>{isStar ? 'Unstar' : 'star'}</span>
        </span>
      </span>
      <span>
        <span className={styles.starCount} onClick={userList(proId)}>
          {starNum}
        </span>
      </span>
    </div>
  )
}

Star.StarUser = StarUser
export default Star
