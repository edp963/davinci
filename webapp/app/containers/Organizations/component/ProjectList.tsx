import * as React from 'react'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Tooltip = require('antd/lib/tooltip')
const Button = require('antd/lib/button')
const Input = require('antd/lib/input')
const styles = require('../Organization.less')
const Select = require('antd/lib/select')
const Modal = require('antd/lib/modal')
import ProjectItem from './ProjectItem'
import {WrappedFormUtils} from 'antd/lib/form/Form'
import ProjectForm from '../../Projects/ProjectForm'
import * as Organization from '../Organization'

interface IProjectsState {
  formType?: string
  formVisible: boolean
  modalLoading: boolean
}

interface IProjectsProps {
  organizationProjects: Organization.IOrganizationProjects[]
  toProject: (id: number) => any
}
export class ProjectList extends React.PureComponent<IProjectsProps, IProjectsState> {
  constructor (props) {
    super(props)
    this.state = {
      formType: '',
      formVisible: false,
      modalLoading: false
    }
  }
  private ProjectForm: WrappedFormUtils
  private showProjectForm = (type: string) => (e) => {
    e.stopPropagation()
    this.setState({
      formVisible: true
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
  public render () {
    const { formVisible, formType, modalLoading } = this.state
    const { organizationProjects } = this.props
    const addButton =  (
          <Tooltip placement="bottom" title="创建">
            <Button
              size="large"
              type="primary"
              icon="plus"
              onClick={this.showProjectForm('add')}
            />
          </Tooltip>
      )
    const projectLists = [
      {
        title: 'davinci',
        desc: 'Wormhole is a SPaaS (Stream Processing as a Service) Platform',
        tags: [{description: '我创建的'}, {description: '我收藏的'}],
        stars : 170,
        updateTime: '2018-06-13'
      }
    ]
    const ProjectItems = Array.isArray(organizationProjects) ? organizationProjects.map((lists, index) => (
      <ProjectItem
        key={index}
        loginUser={this.props.loginUser}
        options={lists}
        toProject={this.props.toProject}
      />
    )) : ''
    const modalButtons = [(
      <Button
        key="back"
        size="large"
        onClick={this.hideTeamForm}
      >
        取 消
      </Button>
    ), (
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={modalLoading}
        disabled={modalLoading}
        onClick={this.onModalOk}
      >
        保 存
      </Button>
    )]
    return (
      <div className={styles.listWrapper}>
        <Row>
          <Col span={4}>
            <Select
              size="large"
              placeholder="placeholder"
              onChange={this.onSearchProjectType}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="rmb">我收藏的</Select.Option>
              <Select.Option value="dollar">Dollar</Select.Option>
            </Select>
          </Col>
          <Col span={16} offset={1}>
            <Input.Search
              size="large"
              placeholder="Dashboard 名称"
              onSearch={this.onSearchProject}
            />
          </Col>
          <Col span={1} offset={2}>
            {addButton}
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            {ProjectItems}
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
            ref={(f) => { this.ProjectForm = f }}
          />
        </Modal>
      </div>
    )
  }
}

export default ProjectList

