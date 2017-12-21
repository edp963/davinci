import React, { PropTypes } from 'react'
import {connect} from 'react-redux'
import Helmet from 'react-helmet'
import LoginForm from '../../../app/containers/Login/LoginForm'
import styles from './index.less'

import { login } from '../../containers/App/actions'
import { promiseDispatcher } from '../../../app/utils/reduxPromisation'

import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Button from 'antd/lib/button'
import Message from 'antd/lib/message'

class Login extends React.PureComponent {
  doLogin = () => {
    const {
      onLogin,
      shareInfo,
      legitimateUser
    } = this.props
    this.loginForm.validateFieldsAndScroll((err, { username, password }) => {
      if (!err) {
        onLogin(username, password, shareInfo).then(res => {
          if (res && res.header && res.header.code && res.header.code === 200) {
            legitimateUser()
          } else {
            Message.destroy() // 掩盖 request 批量处理400 的提示语
            Message.error('无权限')
          }
        })
      }
    })
  }

  render () {
    const { loginLoading } = this.props
    return (
      <div className={styles.container}>
        <Helmet title="Login" />
        <div className={styles.logo}>
          <span>D</span>
          <span>a</span>
          <span>v</span>
          <span>i</span>
          <span>n</span>
          <span>c</span>
          <span>i</span>
        </div>
        <div className={styles.window}>
          <Row gutter={8}>
            <Col sm={21}>
              <LoginForm
                onLogin={this.doLogin}
                ref={f => { this.loginForm = f }}
              />
            </Col>
            <Col sm={3}>
              <Button
                size="large"
                disabled={loginLoading}
                loading={loginLoading}
                onClick={this.doLogin}
              >
                登 录
              </Button>
            </Col>
          </Row>
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
