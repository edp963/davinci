import * as React from 'react'
const Icon = require('antd/lib/icon')
const Message = require('antd/lib/message')
import { Link } from 'react-router'
import Box from '../../components/Box'
const styles = require('../Profile/profile.less')
const utilStyles = require('../../assets/less/util.less')
const Breadcrumb = require('antd/lib/breadcrumb')
import ResetPasswordForm from './ResetPasswordForm'

import {changeUserPassword} from '../App/actions'
import injectReducer from '../../utils/injectReducer'
import {connect} from 'react-redux'
import injectSaga from '../../utils/injectSaga'
// import saga from '../App/sagas'
// import reducer from '../App/reducer'
import {compose} from 'redux'
import {makeSelectLoginUser} from '../App/selectors'
import {createStructuredSelector} from 'reselect'
import {WrappedFormUtils} from 'antd/lib/form/Form'


interface IResetPasswordProps {
  form: any
  type: string
  loginUser: any,
  onChangeUserPassword: (user: IUser, resolve: () => any, reject: (msg: string) => any) => any
}

interface IUser {
  id: number
  oldPassword?: string
  password?: string
}


export class ResetPassword extends React.PureComponent<IResetPasswordProps> {
  private resetPasswordForm: WrappedFormUtils
  public componentWillMount () {
    const {id} = this.props.loginUser
    this.forceUpdate(() => {
      this.resetPasswordForm.setFieldsValue({id})
    })
  }
  private submit = () => {
    this.resetPasswordForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.onChangeUserPassword(values, () => {
          Message.success('success')
        }, (msg) => {
          Message.error(msg)
        })
      }
    })
  }
  public render () {
    return (
      <Box>
        <Box.Header>
          <Box.Title>
            <Breadcrumb className={utilStyles.breadcrumb}>
              <Breadcrumb.Item>
                <Link to="/account/resetPassword">
                  <Icon type="bars" />修改密码
                </Link>
              </Breadcrumb.Item>
            </Breadcrumb>
          </Box.Title>
        </Box.Header>
        <Box.Body>
          <div className={styles.container}>
              <ResetPasswordForm
                ref={(f) => {this.resetPasswordForm = f }}
                submit={this.submit}
              />
          </div>
        </Box.Body>
      </Box>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  loginUser: makeSelectLoginUser()
})

function mapDispatchToProps (dispatch) {
  return {
    onChangeUserPassword: (user, resolve, reject) => dispatch(changeUserPassword(user, resolve, reject))
  }
}

const withConnect = connect<{}, {}, IResetPasswordProps>(mapStateToProps, mapDispatchToProps)
// const withReducer = injectReducer({ key: 'global', reducer })
// const withSaga = injectSaga({ key: 'global', saga })

export default compose(
  // withReducer,
  // withSaga,
  withConnect
)(ResetPassword)












