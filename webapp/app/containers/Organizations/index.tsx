import React from 'react'
import { connect } from 'react-redux'
import { Icon, Row, Col, Modal, Breadcrumb } from 'antd'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import { Link } from 'react-router-dom'
import Box from 'components/Box'
import { compose } from 'redux'
import { makeSelectLoginUser } from '../App/selectors'
import { OrganizationActions } from './actions'
const { addOrganization, loadOrganizations } = OrganizationActions
import { createStructuredSelector } from 'reselect'
import { makeSelectOrganizations } from './selectors'
const styles = require('./Organization.less')
import OrganizationForm from './component/OrganizationForm'
const utilStyles = require('assets/less/util.less')
import Avatar from 'components/Avatar'
import { checkNameUniqueAction } from '../App/actions'
import { RouteComponentWithParams } from 'utils/types'

interface IOrganizationsState {
  formVisible: boolean
  modalLoading: boolean
}
interface IOrganizationsProps {
  organizations: IOrganization[]
  onLoadOrganizations: () => any
  onAddOrganization: (organization: any, resolve: () => any) => any
  onCheckUniqueName: (pathname: string, data: any, resolve: () => any, reject: (error: string) => any) => any
}
interface IOrganization {
  id?: number
  name?: string
  description?: string
  avatar?: any
  role?: number
}
export class Organizations extends React.PureComponent<IOrganizationsProps & RouteComponentWithParams, IOrganizationsState> {
  constructor (props) {
    super(props)
    this.state = {
      formVisible: false,
      modalLoading: false
    }
  }
  private checkNameUnique = (rule, value = '', callback) => {
    const { onCheckUniqueName } = this.props
    const { getFieldsValue } = this.OrganizationForm
    const id = getFieldsValue()['id']
    const data = {
      name: value,
      id
    }
    onCheckUniqueName('organization', data,
      () => {
        callback()
      }, (err) => {
        callback(err)
      })
  }
  private toOrganization = (organization) => () => {
    this.props.history.push(`/account/organization/${organization.id}`)
  }
  private OrganizationForm: WrappedFormUtils
  private showOrganizationForm = () => (e) => {
    e.stopPropagation()
    this.setState({
      formVisible: true
    })
  }
  public componentWillMount () {
    const { onLoadOrganizations } = this.props
    onLoadOrganizations()
  }
  private onModalOk = () => {
    this.OrganizationForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ modalLoading: true })
        this.props.onAddOrganization({
          ...values,
          config: '{}'
        }, () => { this.hideOrganizationForm() })
      }
    })
  }
  private hideOrganizationForm = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    })
  }

  private afterOrganizationFormClose = () => {
    this.OrganizationForm.resetFields()
  }

  public render () {
    const { formVisible, modalLoading } = this.state
    const { organizations } = this.props
    const organizationArr = organizations ? organizations.map((org) => (
        <div className={styles.groupList} key={org.id} onClick={this.toOrganization(org)}>
          <div className={styles.orgHeader}>
            <div className={styles.avatar}>
              <Avatar path={org.avatar} enlarge={false} size="small"/>
              <div className={styles.name}>
                <div className={styles.title}>
                  {org.name}
                  {org.role === 1 ? <span className={styles.nameTag}>Owner</span> : null}
                </div>
                <div className={styles.desc}>{org.description}</div>
              </div>
            </div>
          </div>
          <div className={styles.setting}>
            <Icon type="setting"/>
          </div>
        </div>
      )
    ) : ''
    return (
      <Box>
        <Box.Header>
          <Box.Title>
            <Row>
              <Col span={20}>
                <Breadcrumb className={utilStyles.breadcrumb}>
                  <Breadcrumb.Item>
                    <Link to="/account/organizations">
                      <Icon type="bars" />我的组织
                    </Link>
                  </Breadcrumb.Item>
                </Breadcrumb>
              </Col>
              <Col span={1} offset={3}>
                <Icon type="plus-circle-o"  className={styles.create} onClick={this.showOrganizationForm()}/>
              </Col>
            </Row>
          </Box.Title>
        </Box.Header>
        {organizationArr}
        <Modal
          title={null}
          visible={formVisible}
          footer={null}
          onCancel={this.hideOrganizationForm}
          afterClose={this.afterOrganizationFormClose}
        >
          <OrganizationForm
            ref={(f) => { this.OrganizationForm = f }}
            modalLoading={modalLoading}
            onModalOk={this.onModalOk}
            onCheckUniqueName={this.checkNameUnique}
          />
        </Modal>
      </Box>
    )
  }
}


const mapStateToProps = createStructuredSelector({
  organizations: makeSelectOrganizations(),
  loginUser: makeSelectLoginUser()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadOrganizations: () => dispatch(loadOrganizations()),
    onAddOrganization: (organization, resolve) => dispatch(addOrganization(organization, resolve)),
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

// const withReducer = injectReducer({ key: 'organization', reducer })
// const withSaga = injectSaga({ key: 'organization', saga })

// const withAppReducer = injectReducer({key: 'global', reducer: reducerApp})
// const withAppSaga = injectSaga({key: 'global', saga: sagaApp})

export default compose(
  // withReducer,
  // withAppReducer,
  // withAppSaga,
  // withSaga,
  withConnect
)(Organizations)


