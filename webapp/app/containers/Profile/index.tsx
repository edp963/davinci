import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Icon, Col, message, Row, Input, Form, Button, Breadcrumb } from 'antd'
const FormItem = Form.Item
const styles = require('./profile.less')
import Box from 'components/Box'
import UploadAvatar from 'components/UploadAvatar'
import { createStructuredSelector } from 'reselect'
import { makeSelectLoginUser } from '../App/selectors'
import { compose } from 'redux'
import { updateProfile, checkNameUniqueAction, uploadAvatarSuccess } from '../App/actions'
const utilStyles = require('assets/less/util.less')

interface IProfileProps {
  form: any
  type: string
  loginUser: any
  profileForm: any,
  onUploadAvatarSuccess: (path: string) => any,
  onUpdateProfile: (id: number, name: string, description: string, department: string, resolve: (data: any) => any) => any
  onCheckUniqueName: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
}

export class Profile extends React.PureComponent<IProfileProps, {}> {
  private checkNameUnique = (rule, value = '', callback) => {
    const { onCheckUniqueName, loginUser: {id} } = this.props
    const data = {
      username: value,
      id
    }
    onCheckUniqueName('user', data,
      () => {
        callback()
      }, (err) => {
        callback(err)
      })
  }
  private submit = () => {
    const { onUpdateProfile, loginUser: {id} } = this.props
    const values = this.props.form.getFieldsValue()
    const {name, description, department} = values
    onUpdateProfile(id, name, description, department, (data) => {
      message.success(data.header && data.header.msg)
    })
  }
  public componentDidMount () {
    const { name, description, department } = this.props.loginUser
    this.props.form.setFieldsValue({name, description, department })
  }
  public uploadAvatarSuccessCallback = (path) => {
    const { onUploadAvatarSuccess, loginUser } = this.props
    const newLoginUser = {...loginUser,  ...{avatar: path}}
    if (onUploadAvatarSuccess) {
      onUploadAvatarSuccess(path)
    }
    localStorage.setItem('loginUser', JSON.stringify(newLoginUser))
  }
  public render () {
    const {getFieldDecorator} = this.props.form
    const { id, avatar } = this.props.loginUser
    const commonFormItemStyle = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 }
    }
    return (
      <Box>
        <Box.Header>
          <Box.Title>
            <Breadcrumb className={utilStyles.breadcrumb}>
              <Breadcrumb.Item>
                <Link to="/account/profile">
                  <Icon type="bars" />个人信息
                </Link>
              </Breadcrumb.Item>
            </Breadcrumb>
          </Box.Title>
        </Box.Header>
        <Box.Body>
          <div className={styles.container}>
            <div className={styles.uploadWrapper}>
              <UploadAvatar type="profile" xhrParams={{id, callback: this.uploadAvatarSuccessCallback}} path={avatar}/>
            </div>
            <hr/>
            <div className={styles.form}>
              <Form
                className={styles.formView}
              >
                <Row>
                  <Col>
                    <FormItem
                      className={styles.hide}
                      {...commonFormItemStyle}
                    >
                      {getFieldDecorator('id', {})(
                        <Input />
                      )}
                    </FormItem>
                    <FormItem
                      {...commonFormItemStyle}
                      label="姓名"
                    >
                      {getFieldDecorator('name', {
                        initialValue: '',
                        rules: [{ required: true }, {validator: this.checkNameUnique}]
                      })(
                        <Input size="large"/>
                      )}
                    </FormItem>
                  </Col>
                  <Col>
                    <FormItem
                      {...commonFormItemStyle}
                      label="描述"
                    >
                      {getFieldDecorator('description', {
                        initialValue: ''
                      })(
                        <Input />
                      )}
                    </FormItem>
                  </Col>
                  <Col>
                    <FormItem
                      {...commonFormItemStyle}
                      label="部门"
                    >
                      {getFieldDecorator('department', {
                        initialValue: ''
                      })(
                        <Input size="large"/>
                      )}
                    </FormItem>
                  </Col>
                  <Col offset={4}>
                    <Button size="large" type="primary" onClick={this.submit}>保存设置</Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
        </Box.Body>
      </Box>
    )
  }
}

export function mapDispatchToProps (dispatch) {
  return {
    onUpdateProfile: (id, name, description, department, resolve) => dispatch(updateProfile(id, name, description, department, resolve)),
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject)),
    onUploadAvatarSuccess: (path) => dispatch(uploadAvatarSuccess(path))
  }
}

const mapStateToProps = createStructuredSelector({
  loginUser: makeSelectLoginUser()
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default compose(
  withConnect
)(Form.create()(Profile))
