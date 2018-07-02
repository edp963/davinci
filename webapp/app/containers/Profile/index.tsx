import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
const Icon = require('antd/lib/icon')
const Col = require('antd/lib/col')
const Row = require('antd/lib/row')
const Input = require('antd/lib/input')
const Form = require('antd/lib/Form')
const FormItem = Form.Item
const styles = require('./profile.less')
const Button = require('antd/lib/button')
import Box from '../../components/Box'
import UploadAvatar from '../../components/UploadAvatar'
import {createStructuredSelector} from 'reselect'
import {makeSelectLoginUser} from '../App/selectors'
import {compose} from 'redux'
import injectReducer from '../../utils/injectReducer'
import {updateProfile, checkNameUniqueAction} from '../App/actions'
import injectSaga from '../../utils/injectSaga'
import reducer from '../App/reducer'
import saga from '../App/sagas'
const utilStyles = require('../../assets/less/util.less')
const Breadcrumb = require('antd/lib/breadcrumb')

interface IProfileProps {
  form: any
  type: string
  loginUser: any
  profileForm: any,
  onUpdateProfile: (id: number, name: string, description: string, department: string, resolve: () => any) => any
  onCheckUniqueName: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
}

export class Profile extends React.PureComponent<IProfileProps, {}> {
  private checkNameUnique = (rule, value = '', callback) => {
    const { onCheckUniqueName, loginUser: {id} } = this.props
    // const { getFieldsValue } = this.props.form
    // const { id } = getFieldsValue()
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
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        console.log(values)
      }
    })
  }
  public componentDidMount () {
    const { name, description, department } = this.props.loginUser
    this.props.form.setFieldsValue({name, description, department })
  }
  public render () {
    const {getFieldDecorator} = this.props.form
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
            <UploadAvatar/>
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
                      hasFeedback
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
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject))
  }
}

const mapStateToProps = createStructuredSelector({
  loginUser: makeSelectLoginUser()
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withReducerApp = injectReducer({key: 'app', reducer})
const withSagaAccount = injectSaga({key: 'account', saga})

export default compose(
  withReducerApp,
  withSagaAccount,
  withConnect
)(Form.create()(Profile))
