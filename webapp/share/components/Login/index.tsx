import React, { ChangeEvent, FormEvent } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import LoginForm from 'containers/Login/LoginForm'
import styles from 'containers/Background/Background.less'
import loginStyles from 'containers/Login/Login.less'

import { login } from 'share/containers/App/actions'

import { Icon } from 'antd'

interface ILoginProps {
  loading: boolean
  shareToken: any,
  legitimateUser: () => void
  onLogin?: (username: string, password: string, shareToken: any, resolve: (res) => void) => void
}

interface ILoginStates {
  username: string
  password: string
}

class Login extends React.PureComponent<ILoginProps, ILoginStates> {
  constructor (props) {
    super(props)
    this.state = {
      username: '',
      password: ''
    }
  }

  private changeUsername = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      username: e.target.value.trim()
    })
  }

  private changePassword = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      password: e.target.value
    })
  }

  private doLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { onLogin, shareToken, legitimateUser } = this.props
    const { username, password } = this.state

    if (username && password) {
      onLogin(username, password, shareToken, () => {
        legitimateUser()
      })
    }
  }

  public render () {
    const { loading } = this.props
    const { username, password } = this.state
    return (
      <div className={`${styles.container} ${styles.share}`}>
        <Helmet title="Login" />
        <img className={styles.logo} src={require('assets/images/logo_light.svg')} />
        <div className={`${styles.window} ${loginStyles.window}`}>
          <LoginForm
            username={username}
            password={password}
            loading={loading}
            onChangeUsername={this.changeUsername}
            onChangePassword={this.changePassword}
            onLogin={this.doLogin}
          />
        </div>
      </div>
    )
  }
}

export function mapDispatchToProps (dispatch) {
  return {
    onLogin: (username: string, password: string, shareToken: any, resolve: () => void) => dispatch(login(username, password, shareToken, resolve))
  }
}

export default connect<{}, {}, ILoginProps>(null, mapDispatchToProps)(Login)
