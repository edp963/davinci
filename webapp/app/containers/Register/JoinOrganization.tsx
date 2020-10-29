import React, { ChangeEvent, FormEvent } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import LoginForm from 'containers/Login/LoginForm'
import { joinOrganization, login } from '../App/actions'
import { createStructuredSelector } from 'reselect'
import { makeSelectLoginLoading } from '../App/selectors'

import styles from 'containers/Login/Login.less'

interface IJoinOrganizationProps {
  onJoinOrganization: (token?: string, resolve?: (res?: {id?: number}) => any, reject?: (err?: string) => any) => any
  loginLoading: boolean
  onLogin: (username: string, password: string, resolve?: () => any) => any
  onLogged: () => any
}

interface IJoinOrganizationStates {
  username: string
  password: string
  needLogin: boolean
}

export class JoinOrganization extends React.PureComponent <IJoinOrganizationProps, IJoinOrganizationStates> {

  constructor (props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      needLogin: false
    }
  }

  public componentWillMount () {
    this.joinOrganization()
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

  private joinOrganization = () => {
    const {onJoinOrganization} = this.props
    const token = this.getParamsByLocation('token')
    if (token) {
      onJoinOrganization(token, (res) => {
        if (res && res.id) {
          const path = `${window.location.protocol}//${window.location.host}/#/account/organization/${res.id}`
          location.replace(path)
        }
      }, (err) => {
        this.setState({
          needLogin: true
        })
      })
    }
  }

  private doLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const {onLogin, onJoinOrganization} = this.props
    const {username, password} = this.state
    const token = this.getParamsByLocation('token')
    if (username && password) {
      onLogin(username, password, () => {
        if (token) {
          onJoinOrganization(token, (res) => {
            if (res && res.id) {
              const path = `${window.location.protocol}//${window.location.host}/#/account/organization/${res.id}`
              location.replace(path)
            }
          })
        }
      })
    }
  }

  private isEmptyOrNull = (str) => str == null || str === undefined || str === '' || str === 'null' || typeof str === 'undefined'

  private getParamsByLocation = (name) => {
    let values = decodeURIComponent((window.location.search.match(RegExp(`[?|&|/]${name}=([^\\&|?&]+)`)) || [void 0, null])[1])
    if (this.isEmptyOrNull(values)) {
      values = decodeURIComponent((window.location.hash.match(RegExp(`[?|&|/]${name}=([^\&|?&]+)`)) || [void 0, null])[1])
    }
    return this.isEmptyOrNull(values) || values === 'null' ? '' : values
  }


  public render () {
    const {username, password} = this.state
    const {loginLoading} = this.props

    return this.state.needLogin
      ? (
        <div className={styles.window}>
          <Helmet title="Login - Join Organization" />
          <LoginForm
            username={username}
            password={password}
            loading={loginLoading}
            onChangeUsername={this.changeUsername}
            onChangePassword={this.changePassword}
            onLogin={this.doLogin}
          />
        </div>
      )
     : (
        <div className={styles.window}>
          <Helmet title="Join Organization" />
          <h1 className={styles.joinOrganizationLoadingContent}>
            {this.state.needLogin ? '加入组织中，请稍候…' : ''}
          </h1>
        </div>
      )
  }
}

const mapStateToProps = createStructuredSelector({
  loginLoading: makeSelectLoginLoading()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLogin: (username, password, resolve) => dispatch(login(username, password, resolve)),
    onJoinOrganization: (token, resolve, reject) => dispatch(joinOrganization(token, resolve, reject))
  }
}

const withConnect = connect<{}, {}, IJoinOrganizationProps>(mapStateToProps, mapDispatchToProps)

export default compose(
  withConnect
)(JoinOrganization)




