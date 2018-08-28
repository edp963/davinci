import * as React from 'react'
const Collapse = require('antd/lib/collapse')
const Popconfirm = require('antd/lib/popconfirm')
const Tooltip = require('antd/lib/tooltip')
const Button = require('antd/lib/button')
const Select = require('antd/lib/select')
const Table = require('antd/lib/table')
const Icon = require('antd/lib/icon')
const Form = require('antd/lib/form')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Modal = require('antd/lib/modal')
const Input = require('antd/lib/input')
const styles = require('../Team.less')
const Checkbox = require('antd/lib/checkbox')
const Radio = require('antd/lib/radio')
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
import PermissionLevel from './PermissionLevel'
import AddForm from './AddForm'
import {WrappedFormUtils} from 'antd/lib/form/Form'
import {ITeamProjects} from '../Team'
import Avatar from '../../../components/Avatar'
import ComponentPermission from '../../Account/components/checkMemberPermission'
import {CREATE_ORGANIZATION_PROJECT} from '../../App/constants'

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
  deleteProject: (event:any, id: number) => any
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
}
export class ProjectList extends React.PureComponent<IProjectListProps, IProjectListState> {

  constructor (props) {
    super(props)
    this.state = {
      formKey: 0,
      modalLoading: false,
      formType: '',
      formVisible: false
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
  private onSearchProject = () => {
    console.log(1)
  }
  private onSearchProjectType = () => {
    console.log(1)
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
    const { formVisible, formType, modalLoading} = this.state
    const {currentTeam, currentOrganizationProjects, currentTeamProjects} = this.props
    let CreateButton = void 0
    if (currentTeam) {
      CreateButton = ComponentPermission(currentTeam, '')(Button)
    }
    const projectList = <Collapse  defaultActiveKey={['project0']}>
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
    const addButton =  (
      <Tooltip placement="bottom" title="添加">
        <CreateButton
          size="large"
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
              size="large"
              placeholder="Dashboard 名称"
              onSearch={this.onSearchProject}
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

