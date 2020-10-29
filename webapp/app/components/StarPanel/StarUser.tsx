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
import { Modal } from 'antd'
const styles = require('./Star.less')
import { IStarUserList } from './types'
import Avatar from 'components/Avatar'
import { IStarUser } from 'containers/Projects/types'

const StarUsr: React.FC<IStarUserList> = ({
  visible,
  starUser,
  closeUserListModal
}) => {
  return (
    <Modal title={null} visible={visible} footer={null} onCancel={closeUserListModal}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <div className={styles.title}>点赞用户</div>
        </div>
        <div className={styles.body}>
          {starUser
            ? starUser.map((user: IStarUser, index) => (
                <div className={styles.avatar} key={`star${index}list`}>
                  <Avatar path={user.avatar} size="small" enlarge={true} />
                  <p className={styles.title}>{user.username}</p>
                </div>
              ))
            : ''}
        </div>
      </div>
    </Modal>
  )
}

export default StarUsr



