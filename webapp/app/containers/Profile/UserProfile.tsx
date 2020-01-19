import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Icon, Col, Row, Input, Form, Tooltip, Breadcrumb } from 'antd'
const FormItem = Form.Item
const styles = require('./profile.less')
import Box from 'components/Box'
import Avatar from 'components/Avatar'
import { createStructuredSelector } from 'reselect'
import { makeSelectLoading, makeSelectUserProfile } from './selectors'
import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import { getUserProfile } from './actions'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'
const utilStyles = require('assets/less/util.less')

interface IProfileProps {
  form: any
  loading: boolean
  params: any
  userProfile: any
  onGetUserProfile: (id: number) => any
}

export class UserProfile extends React.PureComponent<IProfileProps, {}> {
  public componentDidMount () {
    const { params: {uid}, onGetUserProfile } = this.props
    onGetUserProfile(uid)
  }
  public componentWillReceiveProps (nextProps) {
    if (nextProps && nextProps.userProfile !== this.props.userProfile) {
      const { name, description, department } = nextProps.userProfile
      this.props.form.setFieldsValue({name, description, department})
    }
  }
  public render () {
    const { userProfile } = this.props
    const commonFormItemStyle = {
      labelCol: { span: 20 },
      wrapperCol: { span: 20 }
    }
    let organizations = void 0
    if (userProfile) {
        organizations = userProfile.organizations.map((org, index) => (
          <Tooltip key={`${org}_${index}_tooltip`} placement="bottom" title={org.name}>
            <div key={`${org}_${index}`} className={styles.avatarWrapper}>
              <Avatar path={org.avatar} size="small"/>
            </div>
          </Tooltip>)
        )
    }
    const name = userProfile.name ? userProfile.name : '他'
    const { getFieldDecorator } = this.props.form
    return (
      <Box>
        <Box.Header>
          <Box.Title>
            <Breadcrumb className={utilStyles.breadcrumb}>
              <Breadcrumb.Item>
                <Link to="/account/profile">
                  <Icon type="bars" />{`${name}的信息`}
                </Link>
              </Breadcrumb.Item>
            </Breadcrumb>
          </Box.Title>
        </Box.Header>
        <Box.Body>
          <div className={styles.containerWarp}>
            <div className={styles.form}>
              <Form
                layout="vertical"
                className={styles.formView}
              >
                <Row>
                  <Col>
                    <FormItem
                      {...commonFormItemStyle}
                      label="姓名"
                    >
                      {getFieldDecorator('name', {})(
                        <Input disabled/>
                      )}
                    </FormItem>
                  </Col>
                  <Col>
                    <FormItem
                      {...commonFormItemStyle}
                      label="描述"
                    >
                      {getFieldDecorator('description', {})(
                        <Input disabled/>
                      )}
                    </FormItem>
                  </Col>
                  <Col>
                    <FormItem
                      {...commonFormItemStyle}
                      label="部门"
                    >
                      {getFieldDecorator('department', {})(
                        <Input disabled/>
                      )}
                    </FormItem>
                  </Col>
                  <Col>
                    <FormItem
                      {...commonFormItemStyle}
                      label="组织"
                    >
                      {getFieldDecorator('org', {})(
                        <div className={styles.orgIcon}>{organizations}</div>
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </div>
            <div className={styles.avatar}>
              <Avatar path="" size="large"/>
            </div>
          </div>
        </Box.Body>
      </Box>
    )
  }
}

export function mapDispatchToProps (dispatch) {
  return {
    onGetUserProfile: (id) => dispatch(getUserProfile(id))
  }
}

const mapStateToProps = createStructuredSelector({
  loading: makeSelectLoading(),
  userProfile: makeSelectUserProfile()
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withReducerProfile = injectReducer({key: 'profile', reducer})
const withSagaProfile = injectSaga({key: 'profile', saga})

export default compose(
  withReducerProfile,
  withSagaProfile,
  withConnect
)(Form.create()(UserProfile))
