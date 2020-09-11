import React, { ChangeEvent, FormEvent } from 'react'
import { connect } from 'react-redux'
import LoginForm from 'app/containers/Login/LoginForm'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import Background from 'share/components/Background'
import { AppActions } from 'share/containers/App/actions'
import { checkLoginStatus } from 'utils/checkLogin'
import { querystring } from 'utils/util'
import { message } from 'antd'
import { compose } from 'redux'
import {setToken} from 'utils/request'
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

class Login extends React.PureComponent<ILoginProps & RouteComponentProps, ILoginStates> {
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
    const {
      location: { pathname }
    } = this.props
    const { userToken } = querystring(window.location.search.substr(1))
    checkLoginStatus(userToken, pathname, (loginUser?) => {
      const loginedUser = localStorage.getItem('loginUser')
      if (loginUser) {
        this.props.logged(loginUser)
      }
      this.props.logged(JSON.parse(loginedUser))
      if (loginCallback) {
        loginCallback()
      }
    })
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
    ) =>
      dispatch(
        AppActions.login(username, password, shareToken, resolve, reject)
      ),
    logged: (user) => dispatch(AppActions.logged(user))
  }
}

const withConnect = connect<{}, {}, ILoginProps>(null, mapDispatchToProps)

export default compose(withConnect, withRouter)(Login)
