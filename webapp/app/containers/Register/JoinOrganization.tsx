import * as React from 'react'
import { compose } from 'redux'
import Helmet from 'react-helmet'

import { Icon } from 'antd'

import { connect } from 'react-redux'
import { joinOrganization, login } from '../App/actions'
import { createStructuredSelector } from 'reselect'
import { InjectedRouter } from 'react-router/lib/Router'
import { makeSelectLoginLoading } from '../App/selectors'

const styles = require('../Login/Login.less')
const utilStyles = require('assets/less/util.less')
const registerStyles = require('./register.less')

interface IJoinOrganizationProps {
  onJoinOrganization: (token?: string, resolve?: (res?: {id?: number}) => any, reject?: (err?: string) => any) => any
  router: InjectedRouter
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

  private enterLogin: (e: KeyboardEvent) => any = null

  public componentWillUnmount () {
    this.unbindDocumentKeypress()
  }

  public componentWillMount () {
    this.joinOrganization()
  }

  private bindDocumentKeypress = () => {
    this.enterLogin = (e) => {
      if (e.keyCode === 13) {
        this.doLogin()
      }
    }

    document.addEventListener('keypress', this.enterLogin, false)
  }

  private unbindDocumentKeypress = () => {
    document.removeEventListener('keypress', this.enterLogin, false)
    this.enterLogin = null
  }

  private changeUsername = (e) => {
    this.setState({
      username: e.target.value.trim()
    })
  }

  private changePassword = (e) => {
    this.setState({
      password: e.target.value
    })
  }

  private joinOrganization = () => {
    const {onJoinOrganization} = this.props
    const token = this.getParamsByLocation('token')
    console.log(token)
    if (token) {
      onJoinOrganization(token, (res) => {
        console.log(res)
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

  private doLogin = () => {
    const {onLogin, router, onJoinOrganization} = this.props
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
          <div className={styles.form}>
            <div className={styles.input}>
              <Icon type="user"/>
              <input
                placeholder="用户名"
                value={username}
                onFocus={this.bindDocumentKeypress}
                onBlur={this.unbindDocumentKeypress}
                onChange={this.changeUsername}
              />
            </div>
            <div className={styles.input}>
              <Icon type="unlock"/>
              <input
                placeholder="密码"
                type="password"
                value={password}
                onFocus={this.bindDocumentKeypress}
                onBlur={this.unbindDocumentKeypress}
                onChange={this.changePassword}
              />
            </div>
          </div>
          <button
            disabled={loginLoading}
            onClick={this.doLogin}
          >
            {
              loginLoading
                ? <Icon type="loading"/>
                : ''
            }
            登 录
          </button>
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




