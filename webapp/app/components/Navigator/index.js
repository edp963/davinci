/*-
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
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import Icon from 'antd/lib/icon'

import { makeSelectLoginUser } from '../../containers/App/selectors'

import styles from './Navigator.less'

export function Navigator (props) {
  return (
    <nav className={styles.header}>
      <div className={styles.logo}>
        <span>D</span>
        <span>a</span>
        <span>v</span>
        <span>i</span>
        <span>n</span>
        <span>c</span>
        <span>i</span>
      </div>
      <ul className={styles.tools}>
        <li>
          <p>{props.loginUser.email}</p>
        </li>
        <li>
          <Icon type="logout" onClick={props.onLogout} />
        </li>
      </ul>
    </nav>
  )
}

Navigator.propTypes = {
  loginUser: PropTypes.object,
  onLogout: PropTypes.func
}

const mapStateToProps = createStructuredSelector({
  loginUser: makeSelectLoginUser()
})

export default connect(mapStateToProps, null)(Navigator)
