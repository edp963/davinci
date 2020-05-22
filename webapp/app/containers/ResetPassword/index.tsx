import React, { createRef, RefObject } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Icon, message, Breadcrumb } from 'antd'
import FormType, { FormComponentProps } from 'antd/lib/form/Form'
import Box from 'components/Box'
const styles = require('../Profile/profile.less')
const utilStyles = require('assets/less/util.less')
import ResetPasswordForm from './ResetPasswordForm'

import { changeUserPassword } from '../App/actions'
import { makeSelectLoginUser } from '../App/selectors'
import { createStructuredSelector } from 'reselect'


interface IResetPasswordProps {
  type: string
  loginUser: any,
  onChangeUserPassword: (user: IUser, resolve: () => any, reject: (msg: string) => any) => any
}

interface IUser {
  id: number
  oldPassword?: string
  password?: string
}


export class ResetPassword extends React.PureComponent<IResetPasswordProps & FormComponentProps> {

  private resetPasswordForm: FormType

  private refHandler = {
    resetPasswordForm: (ref) => this.resetPasswordForm = ref
  }

  public componentWillMount () {
    const {id} = this.props.loginUser
    this.forceUpdate(() => {
      this.resetPasswordForm.props.form.setFieldsValue({id})
    })
  }
  private submit = () => {
    this.resetPasswordForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.onChangeUserPassword(values, () => {
          message.success('success')
        }, (msg) => {
          message.error(msg)
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
                wrappedComponentRef={this.refHandler.resetPasswordForm}
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

const withConnect = connect<{}, {}, IResetPasswordProps & FormComponentProps>(mapStateToProps, mapDispatchToProps)

export default compose(
  withConnect
)(ResetPassword)












