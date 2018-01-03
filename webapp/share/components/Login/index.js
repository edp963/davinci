import React, { PropTypes } from 'react'
import {connect} from 'react-redux'
import Helmet from 'react-helmet'
import LoginForm from '../../../app/containers/Login/LoginForm'
import styles from '../../../app/containers/Login/Login.less'

import { login } from '../../containers/App/actions'
import { promiseDispatcher } from '../../../app/utils/reduxPromisation'

import Icon from 'antd/lib/icon'
import Message from 'antd/lib/message'

class Login extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      username: '',
      password: ''
    }
  }

  changeUsername = (e) => {
    this.setState({
      username: e.target.value.trim()
    })
  }

  changePassword = (e) => {
    this.setState({
      password: e.target.value
    })
  }

  doLogin = () => {
    const { onLogin, shareInfo, legitimateUser } = this.props
    const { username, password } = this.state

    if (username && password) {
      onLogin(username, password, shareInfo).then(res => {
        if (res && res.header && res.header.code && res.header.code === 200) {
          legitimateUser()
        } else {
          Message.destroy() // 掩盖 request 批量处理400 的提示语
          Message.error('无权限')
        }
      })
    }
  }

  render () {
    const { loginLoading } = this.props
    const { username, password } = this.state
    return (
      <div className={`${styles.login} ${styles.share}`}>
        <Helmet title="Login" />
        <img className={styles.logo} src={require('../../../app/assets/images/logo_light.svg')} />
        <div className={styles.window}>
          <LoginForm
            username={username}
            password={password}
            onChangeUsername={this.changeUsername}
            onChangePassword={this.changePassword}
            onLogin={this.doLogin}
          />
          <button
            disabled={loginLoading}
            onClick={this.doLogin}
          >
            {
              loginLoading
                ? <Icon type="loading" />
                : ''
            }
            登 录
          </button>
        </div>
      </div>
    )
  }
}

Login.propTypes = {
  onLogin: PropTypes.func,
  shareInfo: PropTypes.string,
  loginLoading: PropTypes.bool,
  legitimateUser: PropTypes.func
}

export function mapDispatchToProps (dispatch) {
  return {
    onLogin: (username, password, shareInfo) => promiseDispatcher(dispatch, login, username, password, shareInfo)
  }
}

export default connect(null, mapDispatchToProps)(Login)
