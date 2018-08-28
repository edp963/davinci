import * as React from 'react'
import * as classnames from 'classnames'
import {compose} from 'redux'
import Helmet from 'react-helmet'
import Background from '../../containers/Login/Background'

const Icon = require('antd/lib/icon')
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'
import reducer from '../App/reducer'
import saga from '../App/sagas'

import {connect} from 'react-redux'
import {joinOrganization, login} from '../App/actions'
import {createStructuredSelector} from 'reselect'
import {InjectedRouter} from 'react-router/lib/Router'
import {makeSelectLoginLoading} from '../App/selectors'

const Spin = require('antd/lib/spin')
const styles = require('../Login/Login.less')
const utilStyles = require('../../assets/less/util.less')
const registerStyles = require('./register.less')

interface IJoinOrganizationProps {
  onJoinOrganization: (token?: string, resolve?: (res?: {id?: number}) => any, reject?: (err?: string) => any) => any
  router: InjectedRouter
  loginLoading: boolean
  onLogin: (username: string, password: string, resolve?: () => any) => any
  onLogged: () => any
  onSetLoginUser: (user: object) => any
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

  public componentWillMount () {
    this.joinOrganization()
  }

  public render () {
    const {username, password} = this.state
    const {loginLoading} = this.props
    const loginStyle = classnames({
      [utilStyles.hide]: !this.state.needLogin,
      [styles.login]: true
    })
    const activeWrapper = classnames({
      [utilStyles.hide]: this.state.needLogin,
      [registerStyles.activeWrapper]: true
    })
    return (
      <div className={loginStyle}>
        <Helmet title="Login"/>
        <Background/>
        <img className={styles.logo} src={require('../../assets/images/logo_light.svg')}/>
        <div className={styles.window}>
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
        <div className={activeWrapper}>
          <Spin size="large"/>
        </div>
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
const withReducer = injectReducer({key: 'app', reducer})
const withSaga = injectSaga({key: 'app', saga})

export default compose(
  withReducer,
  withSaga,
  withConnect
)(JoinOrganization)




