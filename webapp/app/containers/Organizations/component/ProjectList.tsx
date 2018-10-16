import * as React from 'react'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Tooltip = require('antd/lib/tooltip')
const Button = require('antd/lib/button')
const Pagination = require('antd/lib/pagination')
const Input = require('antd/lib/input')
const styles = require('../Organization.less')
const Modal = require('antd/lib/modal')
import ProjectItem from './ProjectItem'
import AntdFormType from 'antd/lib/form/Form'
import ProjectForm from '../../Projects/ProjectForm'
import * as Organization from '../Organization'
import ComponentPermission from '../../Account/components/checkMemberPermission'
import { CREATE_ORGANIZATION_PROJECT } from '../../App/constants'
import {IStarUser, IProject} from '../../Projects'

interface IProjectsState {
  formType?: string
  formVisible: boolean
  modalLoading: boolean
  pageNum: number
  pageSize: number
  organizationProjects: boolean | Organization.IOrganizationProjects[]
}

interface IProjectsProps {
  loginUser: any
  organizationId: number
  currentOrganization: Organization.IOrganization
  toProject: (id: number) => any
  deleteProject: (id: number) => any
  starUser: IStarUser[]
  collectProjects: IProject[]
  onAddProject: (project: any, resolve: () => any) => any
  onEditProject: (project: any, resolve: () => any) => any
  organizationProjects: Organization.IOrganizationProjects[]
  organizationProjectsDetail: {total?: number, list: Organization.IOrganizationProjects[]}
  unStar?: (id: number) => any
  userList?: (id: number) => any
  onCheckUniqueName: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
  getOrganizationProjectsByPagination: (obj: {keyword?: string, pageNum: number, pageSize: number}) => any
  onLoadOrganizationProjects: (param: {id: number, pageNum?: number, pageSize?: number}) => any
  onClickCollectProjects: (formType, project: object, resolve: (id: number) => any) => any
  onLoadCollectProjects: () => any
}

export class ProjectList extends React.PureComponent<IProjectsProps, IProjectsState> {
  constructor (props) {
    super(props)
    this.state = {
      formType: '',
      formVisible: false,
      modalLoading: false,
      pageNum: 1,
      pageSize: 10,
      organizationProjects: false
    }
  }

  private ProjectForm: AntdFormType = null
  private refHandlers = {
    ProjectForm: (ref) => this.ProjectForm = ref
  }

  private showProjectForm = (type: string) => (e) => {
    e.stopPropagation()
    this.setState({
      formVisible: true,
      formType: type
    })
  }

  private showEditProjectForm = (formType, option) => (e) => {
    this.setState({
      formType,
      formVisible: true
    }, () => {
      const {orgId, id, name, pic, description, visibility} = option
      this.ProjectForm.props.form.setFieldsValue({
        orgId: `${orgId}`,
        id,
        name,
        pic,
        description,
        visibility: `${visibility}`
      })
    })
  }

  private onSearchProject = (event) => {
    const value = event.target.value
    const {organizationProjects} = this.props
    const result = (organizationProjects as Organization.IOrganizationProjects[]).filter((project, index) => {
      return project && project.name.indexOf(value.trim()) > -1
    })

    const param = {
      keyword: value,
      pageNum: this.state.pageNum,
      pageSize: this.state.pageSize
    }

    this.props.getOrganizationProjectsByPagination(param)
    // this.setState({
    //   organizationProjects: value && value.length ? result : this.props.organizationProjects
    // })
  }

  private hideProjectForm = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    }, () => {
      this.ProjectForm.props.form.resetFields()
    })
  }

  private checkUniqueName = (rule, value = '', callback) => {
    const { onCheckUniqueName, organizationId } = this.props
    const { getFieldsValue } = this.ProjectForm.props.form
    const id = getFieldsValue()['id']
    const data = {
      name: value,
      orgId: organizationId,
      id
    }

    onCheckUniqueName('project', data,
      () => {
        callback()
      }, (err) => {
        callback(err)
      })
  }

  private onModalOk = () => {
    const { organizationId, currentOrganization, onAddProject, onEditProject, onLoadOrganizationProjects } = this.props
    const { formType } = this.state

    this.ProjectForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ modalLoading: true })
        values.visibility = values.visibility === 'true' ? true : false

        if (formType === 'organizationProject') {
          onAddProject({
            ...values,
            ...{orgId: organizationId},
            pic: `${Math.ceil(Math.random() * 19)}`
            // config: '{}'
          }, () => {
            this.hideProjectForm()
          })
        } else if (formType === 'edit') {
          onEditProject({
            ...values,
            ...{orgId: Number(values.orgId)}
          }, () => {
            onLoadOrganizationProjects({id: currentOrganization.id})
            this.hideProjectForm()
          })
        }
      }
    })
  }

  private onShowSizeChange = (current, pageSize) => {
    this.setState({
      pageNum: current,
      pageSize
    }, () => {
      const param = {
        pageNum: this.state.pageNum,
        pageSize: this.state.pageSize
      }
      this.props.getOrganizationProjectsByPagination(param)
    })
  }

  private onPaginationChange = (page) => {
    this.setState({
      pageNum: page
    }, () => {
      const param = {
        pageNum: this.state.pageNum,
        pageSize: this.state.pageSize
      }
      this.props.getOrganizationProjectsByPagination(param)
    })
  }

  public componentWillReceiveProps (nextProps) {
    const {organizationProjects} = this.props
    const nextOrgProjects = nextProps.organizationProjects
    if (nextOrgProjects && nextOrgProjects !== organizationProjects) {
      this.setState({
        organizationProjects: nextOrgProjects
      })
    }
  }

  public render () {
    const { formVisible, formType, modalLoading, organizationProjects } = this.state
    const { currentOrganization, organizationProjectsDetail, onCheckUniqueName, collectProjects } = this.props
    let CreateButton = void 0
    if (currentOrganization) {
       CreateButton = ComponentPermission(currentOrganization, CREATE_ORGANIZATION_PROJECT)(Button)
    }
    const addButton =  (
          <Tooltip placement="bottom" title="创建">
            <CreateButton
              size="large"
              type="primary"
              icon="plus"
              onClick={this.showProjectForm('organizationProject')}
            />
          </Tooltip>
      )
    let projectSearchPagination = void 0
    if (organizationProjectsDetail) {
      projectSearchPagination =
        (
        <Pagination
          //  simple={screenWidth < 768 || screenWidth === 768}
          showSizeChanger
          defaultCurrent={2}
          total={organizationProjectsDetail.total}
          onShowSizeChange={this.onShowSizeChange}
          onChange={this.onPaginationChange}
          defaultPageSize={10}
          pageSizeOptions={['10', '15', '20']}
          current={this.state.pageNum}
        />)
    }

    const ProjectItems = Array.isArray(organizationProjects) ? organizationProjects.map((lists, index) => (
      <ProjectItem
        unStar={this.props.unStar}
        userList={this.props.userList}
        starUser={this.props.starUser}
        collectProjects={collectProjects}
        currentOrganization={currentOrganization}
        key={index}
        loginUser={this.props.loginUser}
        options={lists}
        toProject={this.props.toProject}
        deleteProject={this.props.deleteProject}
        showEditProjectForm={this.showEditProjectForm('edit', lists)}
        onClickCollectProjects={this.props.onClickCollectProjects}
        onLoadCollectProjects={this.props.onLoadCollectProjects}
      />
    )) : ''

    return (
      <div className={styles.listWrapper}>
        <Row>
          <Col span={16}>
            <Input.Search
              size="large"
              placeholder="Project 名称"
              onChange={this.onSearchProject}
            />
          </Col>
          <Col span={1} offset={7}>
              {addButton}
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            {ProjectItems}
          </Col>
        </Row>
        <Row type="flex" justify="end" style={{marginTop: '16px'}}>
          <Col>
            {projectSearchPagination}
          </Col>
        </Row>
        <Modal
          title={null}
          visible={formVisible}
          footer={null}
          onCancel={this.hideProjectForm}
        >
          <ProjectForm
            type={formType}
            modalLoading={modalLoading}
            onModalOk={this.onModalOk}
            onCheckUniqueName={this.checkUniqueName}
            wrappedComponentRef={this.refHandlers.ProjectForm}
          />
        </Modal>
      </div>
    )
  }
}

export default ProjectList

