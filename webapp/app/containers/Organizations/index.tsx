import * as React from 'react'
import { connect } from 'react-redux'
const Icon = require('antd/lib/icon')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Modal = require('antd/lib/modal')
import { Link } from 'react-router'
import Box from '../../components/Box'
import {InjectedRouter} from 'react-router/lib/Router'
import reducer from './reducer'
import {compose} from 'redux'
import {makeSelectLoginUser} from '../App/selectors'
import saga from './sagas'
import {addOrganization, deleteOrganization, editOrganization, loadOrganizations} from './actions'
import injectReducer from '../../utils/injectReducer'
import {createStructuredSelector} from 'reselect'
import injectSaga from '../../utils/injectSaga'
import {makeSelectOrganizations} from './selectors'
import {WrappedFormUtils} from 'antd/lib/form/Form'
const styles = require('./Organization.less')
import OrganizationForm from './component/OrganizationForm'
const utilStyles = require('../../assets/less/util.less')
const Breadcrumb = require('antd/lib/breadcrumb')
import Avatar from '../../components/Avatar'

interface IOrganizationsState {
  formType?: string
  formVisible: boolean
  modalLoading: boolean
}
interface IOrganizationsProps {
  router: InjectedRouter
  organizations: IOrganization[]
  onLoadOrganizations: () => any
}
interface IOrganization {
  id?: number
  name?: string
  description?: string
  avatar?:any
}
export class Organizations extends React.PureComponent<IOrganizationsProps, IOrganizationsState> {
  constructor (props) {
    super(props)
    this.state = {
      formType: '',
      formVisible: false,
      modalLoading: false
    }
  }
  private toOrganization = (organization) => () => {
    this.props.router.push(`/account/organization/${organization.id}`)
  }
  private OrganizationForm: WrappedFormUtils
  private showOrganizationForm = (formType, organization?: IOrganization) => (e) => {
    e.stopPropagation()
    this.setState({
      formType,
      formVisible: true
    }, () => {
      if (organization) {
        this.OrganizationForm.setFieldsValue(organization)
      }
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
        if (this.state.formType === 'add') {
          this.props.onAddOrganization({
            ...values,
            pic: `${Math.ceil(Math.random() * 19)}`,
            linkage_detail: '[]',
            config: '{}'
          }, () => { this.hideOrganizationForm() })
        }
      }
    })
  }
  private hideOrganizationForm = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    }, () => {
      this.OrganizationForm.resetFields()
    })
  }

  public render () {
    const { formVisible, formType, modalLoading } = this.state
    const { organizations } = this.props
    const organizationArr = organizations ? organizations.map((org) => (
        <div className={styles.groupList} key={org.id}>
          <div className={styles.orgHeader}>
            <div className={styles.avatar}>
              <Avatar path={org.avatar} enlarge={false} size="small"/>
              <div className={styles.title}>{org.name}</div>
            </div>
            <div className={styles.name}>
              <div className={styles.desc}>{org.description}</div>
            </div>
          </div>
          <div className={styles.setting}>
            <Icon type="setting" onClick={this.toOrganization(org)}/>
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
                <Icon type="plus-circle-o"  className={styles.create} onClick={this.showOrganizationForm('add')}/>
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
        >
          <OrganizationForm
            type={formType}
            ref={(f) => { this.OrganizationForm = f }}
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
    onEditOrganization: (organization, resolve) => dispatch(editOrganization(organization, resolve)),
    onDeleteOrganization: (id) => () => dispatch(deleteOrganization(id))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withReducer = injectReducer({ key: 'organization', reducer })
const withSaga = injectSaga({ key: 'organization', saga })

export default compose(
  withReducer,
  withSaga,
  withConnect
)(Organizations)


