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
import Dropdown from 'antd/lib/dropdown'
import Menu from 'antd/lib/menu'
import { makeSelectLoginUser } from '../../containers/App/selectors'

import styles from './Navigator.less'

const goGithub = () => window.open('https://github.com/edp963/davinci')
export function Navigator (props) {
  const headerClass = classnames({
    [styles.header]: true,
    [styles.hide]: !props.show
  })
  const menu = (
    <Menu>
      <Menu.Item key="0">
        <Link to="/account" >
          用户设置
        </Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="3">
        <a href="javascript:;" onClick={props.onLogout}>
          退出登录
        </a>
      </Menu.Item>
    </Menu>
  )

  return (
    <nav className={headerClass}>
      <div className={styles.logoPc}>
        <div className={styles.logo}>
          {/*<Link to="/report/dashboards">*/}
          <Link to="/projects">
            <img src={require('../../assets/images/logo.svg')} />
          </Link>
        </div>
      </div>
      <div className={styles.logoMobile}>
        <div className={styles.logo}>
          <Link to="/projects">
            <img src={require('../../assets/images/logo_mobile.svg')} />
          </Link>
        </div>
      </div>
      <ul className={styles.tools}>
        {/*<li className={styles.emailHide}>*/}
          {/*<p>{props.loginUser.email}</p>*/}
        {/*</li>*/}
        <li>
          {/*<Icon type="github" onClick={goGithub}/>*/}
          <i className="iconfont icon-GitHub" onClick={goGithub} style={{lineHeight: '38px'}}/>
        </li>
        <li>
          <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            {/*<Icon type="user" />*/}
            <i className="iconfont icon-user_circle" style={{fontSize:'26px'}}/>
          </Dropdown>
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
