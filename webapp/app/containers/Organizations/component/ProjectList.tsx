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
import {WrappedFormUtils} from 'antd/lib/form/Form'
import ProjectForm from '../../Projects/ProjectForm'
import * as Organization from '../Organization'
import ComponentPermission from '../../Account/components/checkMemberPermission'
import { CREATE_ORGANIZATION_PROJECT } from '../../App/constants'
import {IStarUser} from '../../Projects'

interface IProjectsState {
  formType?: string
  formVisible: boolean
  modalLoading: boolean
  pageNum: number
  pageSize: number
}

interface IProjectsProps {
  loginUser: any
  organizationId: number
  currentOrganization: Organization.IOrganization
  toProject: (id: number) => any
  deleteProject: (id: number) => any
  starUser: IStarUser[]
  onAddProject: (project: any, resolve: () => any) => any
  organizationProjects: Organization.IOrganizationProjects[]
  organizationProjectsDetail: {total?: number, list: Organization.IOrganizationProjects[]}
  unStar?: (id: number) => any
  userList?: (id: number) => any
  onCheckUniqueName: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
  getOrganizationProjectsByPagination: (obj: {pageNum: number, pageSize: number}) => any
}

export class ProjectList extends React.PureComponent<IProjectsProps, IProjectsState> {
  constructor (props) {
    super(props)
    this.state = {
      formType: '',
      formVisible: false,
      modalLoading: false,
      pageNum: 1,
      pageSize: 10
    }
  }
  private ProjectForm: WrappedFormUtils
  private showProjectForm = (type: string) => (e) => {
    e.stopPropagation()
    this.setState({
      formVisible: true,
      formType: type
    })
  }
  private onSearchProject = () => {
    console.log(1)
  }
  private onSearchProjectType = () => {
    console.log(1)
  }
  private hideProjectForm = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    }, () => {
      this.ProjectForm.resetFields()
    })
  }
  private checkUniqueName = (rule, value = '', callback) => {
    const { onCheckUniqueName, organizationId } = this.props
    const { getFieldsValue } = this.ProjectForm
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
    const { organizationId } = this.props
    this.ProjectForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ modalLoading: true })
        if (this.state.formType === 'organizationProject') {
          this.props.onAddProject({
            ...values,
            ...{orgId: organizationId},
            pic: `${Math.ceil(Math.random() * 19)}`,
            config: '{}'
          }, () => {
            this.hideProjectForm() })
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
  public render () {
    const { formVisible, formType, modalLoading } = this.state
    const { organizationProjects, currentOrganization, organizationProjectsDetail } = this.props
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
        (<Pagination
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
        currentOrganization={currentOrganization}
        key={index}
        loginUser={this.props.loginUser}
        options={lists}
        toProject={this.props.toProject}
        deleteProject={this.props.deleteProject}
      />
    )) : ''
    return (
      <div className={styles.listWrapper}>
        <Row>
          <Col span={16}>
            <Input.Search
              size="large"
              placeholder="Project 名称"
              onSearch={this.onSearchProject}
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
            ref={(f) => { this.ProjectForm = f }}
          />
        </Modal>
      </div>
    )
  }
}

export default ProjectList

