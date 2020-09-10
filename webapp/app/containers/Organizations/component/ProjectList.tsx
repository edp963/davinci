import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Row, Col, Tooltip, Button, Pagination, Input, Modal } from 'antd'
import ProjectItem from './ProjectItem'
import AntdFormType from 'antd/lib/form/Form'
import ProjectEditForm from './Project'
import ProjectForm from './ProjectForm'
import ComponentPermission from 'containers/Account/components/checkMemberPermission'
import { CREATE_ORGANIZATION_PROJECT } from 'containers/App/constants'
import { checkNameUniqueAction } from 'containers/App/actions'
import { createStructuredSelector } from 'reselect'
import { OrganizationActions } from '../actions'
import {
  makeSelectOrganizations,
  makeSelectCurrentOrganizations,
  makeSelectCurrentOrganizationProjects,
  makeSelectCurrentOrganizationProjectsDetail,
  makeSelectCurrentOrganizationRole,
  makeSelectCurrentOrganizationMembers,
  makeSelectInviteMemberList,
  makeSelectCurrentOrganizationProject
} from '../selectors'
import { makeSelectVizs } from 'containers/Schedule/selectors'
import { ProjectActions } from 'containers/Projects/actions'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import scheduleReducer from 'containers/Schedule/reducer'
import scheduleSaga from 'containers/Schedule/sagas'
import { ScheduleActions } from 'containers/Schedule/actions'
import { makeSelectLoginUser } from 'containers/App/selectors'
import Star from 'components/StarPanel/Star'
const StarUserModal = Star.StarUser
const styles = require('../Organization.less')
import {
  makeSelectStarUserList,
  makeSelectCollectProjects
} from 'containers/Projects/selectors'
import {IProjectsProps, IProjectsStates } from '../types'

export class ProjectList extends React.PureComponent<
  IProjectsProps,
  IProjectsStates
> {
  constructor(props) {
    super(props)
    this.state = {
      formType: '',
      formVisible: false,
      editFormVisible: false,
      adminFormVisible: false,
      modalLoading: false,
      pageNum: 1,
      pageSize: 10,
      organizationProjects: null,
      currentProject: null,
      starModalVisble: false
    }
  }

  private ProjectForm: AntdFormType = null
  private ProjectEditForm: AntdFormType = null
  private refHandlers = {
    ProjectForm: (ref) => (this.ProjectForm = ref),
    ProjectEditForm: (ref) => (this.ProjectEditForm = ref)
  }

  private onCloseStarModal = () => {
    this.setState({starModalVisble: false})
  }

  private showProjectForm = (type: string) => (e) => {
    e.stopPropagation()
    this.setState({
      formVisible: true,
      formType: type
    })
  }

  public componentWillMount() {
    const {
      onLoadOrganizationProjects,
      onLoadCollectProjects,
      organizationId,
      onLoadVizs
    } = this.props
    this.props.onLoadOrganizations()
    onLoadOrganizationProjects({ id: Number(organizationId) })
    onLoadCollectProjects()
  }

  private showEditProjectForm = (formType, option) => (e) => {
    const { onLoadVizs } = this.props
    const { orgId, id, name, pic, description, visibility } = option
    onLoadVizs(Number(id))
    this.setState(
      {
        formType,
        editFormVisible: true,
        currentProject: option
      },
      () => {
        setTimeout(() => {
          this.props.onSetCurrentProject(option)
          this.ProjectEditForm.props.form.setFieldsValue({
            orgId: `${orgId}`,
            id,
            name,
            pic,
            description,
            visibility: `${visibility}`
          })
        }, 0)
      }
    )
  }
  private getOrganizationProjectsByPagination = (obj) => {
    const { onLoadOrganizationProjects, organizationId } = this.props
    this.setState({
      pageNum: obj.pageNum,
      pageSize: obj.pageSize
    })
    const param = {
      keyword: obj.keyword,
      id: organizationId,
      pageNum: obj.pageNum,
      pageSize: obj.pageSize
    }
    onLoadOrganizationProjects(param)
  }

  private onSearchProject = (event) => {
    const value = event.target.value

    const param = {
      keyword: value,
      pageNum: this.state.pageNum,
      pageSize: this.state.pageSize
    }
    this.getOrganizationProjectsByPagination(param)
  }

  private hideProjectForm = () => {
    this.setState({
      formVisible: false,
      editFormVisible: false,
      modalLoading: false
    })
  }

  private afterProjectFormClose = () => {
    this.ProjectForm.props.form.resetFields()
  }

  private afterProjectEditFormClose = () => {
    this.ProjectEditForm.props.form.resetFields()
  }

  private checkUniqueName = (rule, value = '', callback) => {
    const { onCheckUniqueName, organizationId } = this.props
    const { formVisible, editFormVisible } = this.state
    const { getFieldsValue } = formVisible
      ? this.ProjectForm.props.form
      : this.ProjectEditForm.props.form
    const id = getFieldsValue()['id']
    const data = {
      name: value,
      orgId: organizationId,
      id
    }

    onCheckUniqueName(
      'project',
      data,
      () => {
        callback()
      },
      (err) => {
        callback(err)
      }
    )
  }

  private onModalOk = () => {
    const {
      organizationId,
      currentOrganization,
      onAddProject,
      onEditProject,
      onLoadOrganizationProjects
    } = this.props
    const { formType } = this.state
    const targetForm =
      formType === 'edit' ? this.ProjectEditForm : this.ProjectForm
    targetForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ modalLoading: true })
        values.visibility = values.visibility === 'true' ? true : false

        if (formType === 'organizationProject') {
          onAddProject(
            {
              ...values,
              ...{ orgId: organizationId },
              pic: `${Math.ceil(Math.random() * 19)}`
            },
            () => {
              this.hideProjectForm()
            }
          )
        } else if (formType === 'edit') {
          onEditProject({ ...values }, () => {
            onLoadOrganizationProjects({ id: currentOrganization.id })
            this.hideProjectForm()
          })
        }
      }
    })
  }

  private onShowSizeChange = (current, pageSize) => {
    this.setState(
      {
        pageNum: current,
        pageSize
      },
      () => {
        const param = {
          pageNum: this.state.pageNum,
          pageSize: this.state.pageSize
        }
        this.getOrganizationProjectsByPagination(param)
      }
    )
  }

  private onPaginationChange = (page) => {
    this.setState(
      {
        pageNum: page
      },
      () => {
        const param = {
          pageNum: this.state.pageNum,
          pageSize: this.state.pageSize
        }
        this.getOrganizationProjectsByPagination(param)
      }
    )
  }

  public componentWillReceiveProps(nextProps) {
    const { currentOrganizationProjects } = this.props
    const nextOrgProjects = nextProps.currentOrganizationProjects
    if (nextOrgProjects && nextOrgProjects !== currentOrganizationProjects) {
      this.setState({
        organizationProjects: nextOrgProjects
      })
    }
  }

  private starProject = (id) => () => {
    const { onStarProject, organizationId } = this.props
    const param = {
      id: Number(organizationId),
      pageNum: this.state.pageNum,
      pageSize: this.state.pageSize
    }
    onStarProject(id, () => {
      this.props.onLoadOrganizationProjects(param)
    })
  }

  private deleteProject = (id) => () => {
    if (id) {
      this.props.onDeleteProject(id)
    }
  }

  private tabsChange = (mode) => {
    if (mode === 'basic') {
      const {
        orgId,
        id,
        name,
        pic,
        description,
        visibility
      } = this.state.currentProject
      this.ProjectEditForm.props.form.setFieldsValue({
        orgId: `${orgId}`,
        id,
        name,
        pic,
        description,
        visibility: `${visibility}`
      })
    }
  }

  private onTransfer = () => {
    this.ProjectForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ modalLoading: true })
        const {
          projectDetail: { id }
        } = this.props
        const { orgId } = values
        this.props.onTransferProject(id, Number(orgId), () => {
          const param = {
            id: orgId,
            pageNum: 1,
            pageSize: 10
          }
          this.props.onLoadOrganizationProjects(param)
        })
        this.hideProjectForm()
      }
    })
  }

  private getStarProjectUserList = (id) => () => {
    const { onGetProjectStarUser } = this.props
    onGetProjectStarUser(id)
    this.setState({starModalVisble: true})
  }

  public render() {
    const {
      formVisible,
      formType,
      modalLoading,
      organizationProjects,
      editFormVisible,
      currentProject,
      adminFormVisible,
      starModalVisble
    } = this.state
    const {
      onLoadOrganizationProjects,
      loginUser,
      currentOrganization,
      organizationProjectsDetail,
      onCheckUniqueName,
      collectProjects,
      starUserList,
      organizations
    } = this.props

    let CreateButton = void 0
    if (currentOrganization) {
      CreateButton = ComponentPermission(
        currentOrganization,
        CREATE_ORGANIZATION_PROJECT
      )(Button)
    }
    const addButton = (
      <Tooltip placement="bottom" title="创建">
        <CreateButton
          type="primary"
          icon="plus"
          onClick={this.showProjectForm('organizationProject')}
        />
      </Tooltip>
    )
    let projectSearchPagination = void 0
    if (organizationProjectsDetail) {
      projectSearchPagination = (
        <Pagination
          showSizeChanger
          defaultCurrent={2}
          total={organizationProjectsDetail.total}
          onShowSizeChange={this.onShowSizeChange}
          onChange={this.onPaginationChange}
          defaultPageSize={10}
          pageSizeOptions={['10', '15', '20']}
          current={this.state.pageNum}
        />
      )
    }

    const ProjectItems = Array.isArray(organizationProjects)
      ? organizationProjects.map((lists, index) => (
          <ProjectItem
            key={index}
            pro={lists}
            unStar={this.starProject}
            toProject={this.props.toProject}
            loginUser={this.props.loginUser}
            collectProjects={collectProjects}
            userList={this.getStarProjectUserList}
            currentOrganization={currentOrganization}
            onLoadCollectProjects={this.props.onLoadCollectProjects}
            onClickCollectProjects={this.props.onClickCollectProjects}
            showEditProjectForm={this.showEditProjectForm('edit', lists)}
          />
        ))
      : ''

    return (
      <div className={styles.listWrapper}>
        <Row>
          <Col span={16}>
            <Input.Search
              placeholder="搜索项目"
              onChange={this.onSearchProject}
            />
          </Col>
          <Col span={1} offset={7}>
            {addButton}
          </Col>
        </Row>
        <Row>
          <Col span={24}>{ProjectItems}</Col>
        </Row>
        <Row type="flex" justify="end" style={{ marginTop: '16px' }}>
          <Col>{projectSearchPagination}</Col>
        </Row>
        <Modal
          title={null}
          visible={formVisible}
          footer={null}
          onCancel={this.hideProjectForm}
          afterClose={this.afterProjectFormClose}
        >
          <ProjectForm
            type={formType}
            modalLoading={modalLoading}
            onModalOk={this.onModalOk}
            organizations={organizations}
            onTransfer={this.onTransfer}
            onCheckUniqueName={this.checkUniqueName}
            wrappedComponentRef={this.refHandlers.ProjectForm}
          />
        </Modal>
        <Modal
          wrapClassName="ant-modal-large ant-modal-center"
          title="项目设置"
          visible={editFormVisible}
          footer={null}
          onCancel={this.hideProjectForm}
          afterClose={this.afterProjectEditFormClose}
        >
          <ProjectEditForm
            type={formType}
            onTabsChange={this.tabsChange}
            modalLoading={modalLoading}
            onModalOk={this.onModalOk}
            deleteProject={this.deleteProject}
            currentProject={currentProject}
            onCancel={this.hideProjectForm}
            onCheckUniqueName={this.checkUniqueName}
            showEditProjectForm={this.showProjectForm('transfer')}
            wrappedComponentRef={this.refHandlers.ProjectEditForm}
          />
        </Modal>
        <StarUserModal
          visible={starModalVisble}
          starUser={starUserList}
          closeUserListModal={this.onCloseStarModal}
        />
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  starUserList: makeSelectStarUserList(),
  loginUser: makeSelectLoginUser(),
  projectDetail: makeSelectCurrentOrganizationProject(),
  organizations: makeSelectOrganizations(),
  currentOrganization: makeSelectCurrentOrganizations(),
  currentOrganizationProjects: makeSelectCurrentOrganizationProjects(),
  currentOrganizationProjectsDetail: makeSelectCurrentOrganizationProjectsDetail(),
  currentOrganizationMembers: makeSelectCurrentOrganizationMembers(),
  collectProjects: makeSelectCollectProjects()
})

export function mapDispatchToProps(dispatch) {
  return {
    onLoadVizs: (projectId) => dispatch(ScheduleActions.loadVizs(projectId)),
    onSetCurrentProject: (option) =>
      dispatch(OrganizationActions.setCurrentProject(option)),
    onTransferProject: (id, orgId, resolve) =>
      dispatch(ProjectActions.transferProject(id, orgId, resolve)),
    onStarProject: (id, resolve) =>
      dispatch(ProjectActions.unStarProject(id, resolve)),
    onLoadOrganizations: () =>
      dispatch(OrganizationActions.loadOrganizations()),
    onGetProjectStarUser: (id) =>
      dispatch(ProjectActions.getProjectStarUser(id)),
    onAddProject: (project, resolve) =>
      dispatch(ProjectActions.addProject(project, resolve)),
    onEditProject: (project, resolve) =>
      dispatch(ProjectActions.editProject(project, resolve)),
    onLoadOrganizationProjects: (param) =>
      dispatch(OrganizationActions.loadOrganizationProjects(param)),
    onDeleteProject: (id, resolve) =>
      dispatch(ProjectActions.deleteProject(id, resolve)),
    onDeleteOrganizationMember: (id, resolve) =>
      dispatch(OrganizationActions.deleteOrganizationMember(id, resolve)),
    onChangeOrganizationMemberRole: (id, role, resolve) =>
      dispatch(
        OrganizationActions.changeOrganizationMemberRole(id, role, resolve)
      ),
    onClickCollectProjects: (isFavorite, proId, result) =>
      dispatch(ProjectActions.clickCollectProjects(isFavorite, proId, result)),
    onLoadCollectProjects: () => dispatch(ProjectActions.loadCollectProjects()),
    onCheckUniqueName: (pathname, data, resolve, reject) =>
      dispatch(checkNameUniqueAction(pathname, data, resolve, reject))
  }
}


type MappedStates = ReturnType<typeof mapStateToProps>
type MappedDispatches = ReturnType<typeof mapDispatchToProps>

const withConnect = connect<MappedStates, MappedDispatches, IProjectsProps>(
  mapStateToProps,
  mapDispatchToProps
)


const withReducerSchedule = injectReducer({
  key: 'schedule',
  reducer: scheduleReducer
})
const withSagaSchedule = injectSaga({ key: 'schedule', saga: scheduleSaga })

export default compose(
  withConnect,
  withReducerSchedule,
  withSagaSchedule
)(ProjectList)

 


