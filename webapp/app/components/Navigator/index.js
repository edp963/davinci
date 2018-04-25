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
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router'
import classnames from 'classnames'

import Icon from 'antd/lib/icon'

import { makeSelectLoginUser } from '../../containers/App/selectors'

import styles from './Navigator.less'

export function Navigator (props) {
  const headerClass = classnames({
    [styles.header]: true,
    [styles.hide]: !props.show
  })
  return (
    <nav className={headerClass}>
      <div className={styles.logoPc}>
        <div className={styles.logo}>
          <Link to="/report/dashboards">
            <img src={require('../../assets/images/logo.svg')} />
          </Link>
        </div>
      </div>
      <div className={styles.logoMobile}>
        <div className={styles.logo}>
          <Link to="/report/dashboards">
            <img src={require('../../assets/images/logo_mobile.svg')} />
          </Link>
        </div>
      </div>

      <ul className={styles.tools}>
        <li className={styles.emailHide}>
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
  show: PropTypes.bool,
  loginUser: PropTypes.object,
  onLogout: PropTypes.func
}

const mapStateToProps = createStructuredSelector({
  loginUser: makeSelectLoginUser()
})

export default connect(mapStateToProps, null)(Navigator)
