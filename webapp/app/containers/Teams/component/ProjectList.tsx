import * as React from 'react'
import { Collapse, Popconfirm, Tooltip, Button, Row, Col, Modal, Input } from 'antd'
import { WrappedFormUtils } from 'antd/lib/form/Form'
const styles = require('../Team.less')
import PermissionLevel from './PermissionLevel'
import AddForm from './AddForm'
import { ITeamProjects } from '../Team'
import Avatar from '../../../components/Avatar'
import ComponentPermission from '../../Account/components/checkMemberPermission'

interface ITag {
  description: string
}

interface IprojectOptions {
  title: string
  desc: string
  tags: ITag[]
  stars: number
  updateTime: string
}

interface IProjectListProps {
  // projects: IprojectOptions
  currentTeam: any
  deleteProject: (event: any, id: number) => any
  currentTeamProjects: ITeamProjects[]
  currentOrganizationProjects: any
  pullProjectInTeam: (projectId: number) => any
  onUpdateTeamProjectPermission: (relationId: number, relTeamProjectDto: any, resolve?: () => any) => any
}
interface IProjectListState {
  modalLoading: boolean
  formKey?: number
  formType: string
  formVisible: boolean
  currentTeamProjects: any[]
}
export class ProjectList extends React.PureComponent<IProjectListProps, IProjectListState> {

  constructor (props) {
    super(props)
    this.state = {
      formKey: 0,
      modalLoading: false,
      formType: '',
      formVisible: false,
      currentTeamProjects: []
    }
  }
  private AddForm: WrappedFormUtils
  private showAddForm = (type: string) => (e) => {
    e.stopPropagation()
    this.setState({
      formType: type,
      formVisible: true
    })
  }

  private hideAddForm = () => {
    this.setState({
      formVisible: false,
      formKey: this.state.formKey + 30
    })
  }

  private add = () => {
    this.AddForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {projectId} = values
        this.props.pullProjectInTeam(projectId)
        this.hideAddForm()
      }
    })
  }

  private selectChanged = (targetStr: string) => (val) => {
    const { onUpdateTeamProjectPermission } = this.props
    this.forceUpdate(() => {
      const {
        id,
        downloadPermission,
        schedulePermission,
        sharePermission,
        sourcePermission,
        viewPermission,
        vizPermission,
        widgetPermission
      } = this[targetStr].getFieldsValue()
      onUpdateTeamProjectPermission(id, {
        downloadPermission,
        schedulePermission,
        sharePermission,
        sourcePermission,
        viewPermission,
        vizPermission,
        widgetPermission
      })
    })
  }
  private onSearchProject = (event) => {
    const value = event.target.value
    const {currentTeamProjects} = this.props
    const result = (currentTeamProjects as ITeamProjects[]).filter((project, index) => {
      return project && project.project && project.project.name.indexOf(value.trim()) > -1
    })
    this.setState({
      currentTeamProjects: value && value.length ? result : this.props.currentTeamProjects
    })
  }
  public componentWillReceiveProps (nextProps) {
    const {currentTeamProjects} = this.props
    const nextCurrentTeamProjects = nextProps.currentTeamProjects
    if (nextCurrentTeamProjects && nextCurrentTeamProjects !== currentTeamProjects) {
      this.setState({
        currentTeamProjects: nextCurrentTeamProjects
      })
    }
  }
  private stopPPG = (e) => {
    e.stopPropagation()
  }
  private headerPanel = (props) => {
    const {currentTeam} = this.props
    let CreateButton = void 0
    if (currentTeam) {
      CreateButton = ComponentPermission(currentTeam, '')(Button)
    }
    return (
      <div className={styles.headerPanel}>
        <div className={styles.titleWrapper}>
          <div className={styles.avatar}>
            <Avatar size="small" path={props.project.path}/>
          </div>
          <div className={styles.title}>{props.project.name}</div>
        </div>
        <div className={styles.delete}>
          <Popconfirm
            title="确定删除？"
            placement="bottom"
            onConfirm={this.props.deleteProject(event, props.id)}
          >
            <Tooltip title="删除">
              <CreateButton shape="circle" icon="close" onClick={this.stopPPG}/>
            </Tooltip>
          </Popconfirm>
        </div>
      </div>
    )
  }

  public render () {
    const { formVisible, formType, modalLoading, currentTeamProjects} = this.state
    const {currentTeam, currentOrganizationProjects} = this.props
    let CreateButton = void 0
    if (currentTeam) {
      CreateButton = ComponentPermission(currentTeam, '')(Button)
    }
    const projectList = (
      <Collapse  defaultActiveKey={['project0']}>
        {
          currentTeamProjects ? currentTeamProjects.map((project, index) =>
            (<Collapse.Panel header={this.headerPanel(project)} key={`project${index}`}>
              <PermissionLevel
                param={project}
                role={currentTeam.role}
                selectChanged={this.selectChanged(`${project.project.id}permissionForm`)}
                ref={(f) => { this[`${project.project.id}permissionForm`] = f }}
              />
            </Collapse.Panel>)) : ''
        }
      </Collapse>
    )
    const addButton =  (
      <Tooltip placement="bottom" title="添加">
        <CreateButton
          type="primary"
          icon="plus"
          onClick={this.showAddForm('project')}
        />
      </Tooltip>
    )
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
        <div style={{height: '24px'}}/>
        {projectList}
        <Modal
          key={this.state.formKey}
          title={null}
          footer={null}
          visible={formVisible}
          onCancel={this.hideAddForm}
        >
          <AddForm
            category={formType}
            organizationOrTeam={currentTeam}
            currentOrganizationProjects={currentOrganizationProjects}
            ref={(f) => { this.AddForm = f }}
            addHandler={this.add}
          />
        </Modal>
      </div>
    )
  }
}

export default ProjectList

