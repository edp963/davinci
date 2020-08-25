import React, { ChangeEvent, FormEvent } from 'react'
import { connect } from 'react-redux'
import LoginForm from 'app/containers/Login/LoginForm'
import Background from 'share/components/Background'
import { AppActions } from 'share/containers/App/actions'
import checkLogin from 'utils/checkLogin'
import { setToken } from 'utils/request'
import { message } from 'antd'
interface ILoginProps {
  loading: boolean
  shareToken: any
  loginCallback?: () => void
  onLogin?: (
    username: string,
    password: string,
    shareToken: any,
    resolve: (res) => void,
    reject?: () => void
  ) => void
  logged?: (user) => void
}

interface ILoginStates {
  username: string
  password: string
}

class Login extends React.PureComponent<ILoginProps, ILoginStates> {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: ''
    }
  }

  public componentWillMount() {
    this.checkNormalLogin()
  }

  private checkNormalLogin = () => {
    const { loginCallback } = this.props
    if (checkLogin()) {
      const token = localStorage.getItem('TOKEN')
      const loginUser = localStorage.getItem('loginUser')
      setToken(token)
      this.props.logged(JSON.parse(loginUser))
      if (loginCallback) {
        loginCallback()
      }
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
    const { onLogin, shareToken, loginCallback } = this.props
    const { username, password } = this.state

    if (username && password) {
      onLogin(
        username,
        password,
        shareToken,
        () => {
          if (loginCallback) {
            loginCallback()
          }
        },
        () => {
          message.error('该用户无权限')
        }
      )
    }
  }

  public render() {
    const { loading } = this.props
    const { username, password } = this.state
    return (
      <Background>
        <LoginForm
          username={username}
          password={password}
          loading={loading}
          onChangeUsername={this.changeUsername}
          onChangePassword={this.changePassword}
          onLogin={this.doLogin}
        />
      </Background>
    )
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    onLogin: (
      username: string,
      password: string,
      shareToken: any,
      resolve: () => void,
      reject?: () => void
    ) => dispatch(AppActions.login(username, password, shareToken, resolve, reject)),
    logged: (user) => dispatch(AppActions.logged(user))
  }
}

export default connect<{}, {}, ILoginProps>(null, mapDispatchToProps)(Login)
