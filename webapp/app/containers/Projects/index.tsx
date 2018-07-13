import * as React from 'react'
import {connect} from 'react-redux'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Tooltip = require('antd/lib/tooltip')
const Popconfirm = require('antd/lib/popconfirm')
const Icon = require('antd/lib/icon')
const Modal = require('antd/lib/modal')
const styles = require('./Project.less')
import * as classnames from 'classnames'
import {InjectedRouter} from 'react-router/lib/Router'
import {WrappedFormUtils} from 'antd/lib/form/Form'
import {addProject, deleteProject, editProject, loadProjects} from './actions'
import {compose} from 'redux'
import {makeSelectLoginUser} from '../App/selectors'
import {makeSelectProjects} from './selectors'
import injectReducer from '../../utils/injectReducer'
import {createStructuredSelector} from 'reselect'
import injectSaga from '../../utils/injectSaga'
import ProjectsForm from './ProjectForm'
import saga from './sagas'
import reducer from './reducer'
import reducerOrganization from '../Organizations/reducer'
import sagaOrganization from '../Organizations/sagas'
import reducerApp from '../App/reducer'
import sagaApp from '../App/sagas'
import {loadOrganizations} from '../Organizations/actions'
import {makeSelectOrganizations} from '../Organizations/selectors'
import {checkNameUniqueAction} from '../App/actions'

interface IProjectsProps {
  router: InjectedRouter
  organizations: any
  onEditProject: (project: any, resolve: () => any) => any
  onLoadProjects: () => any
  onAddProject: (project: any, resolve: () => any) => any
  onLoadOrganizations: () => any,
  onDeleteProject: (id: number) => any
  onCheckUniqueName: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
}

interface IProjectsState {
  formType?: string
  formVisible: boolean
  modalLoading: boolean
}
interface IProject {
  name?: string
  id?: number
  description?: string
  pic?: number
  orgId?: number
  visibility?: boolean
}

export class Projects extends React.PureComponent<IProjectsProps, IProjectsState> {
  constructor (props) {
    super(props)
    this.state = {
      formType: '',
      formVisible: false,
      modalLoading: false
    }
  }

  private ProjectForm: WrappedFormUtils
  private showProjectForm = (formType, project?: IProject) => (e) => {
    this.stopPPG(e)
    this.setState({
      formType,
      formVisible: true
    }, () => {
      if (project) {
        const {orgId, id, name, pic, description} = project
        this.widgetTypeChange(`${orgId}`).then(
          () => this.ProjectForm.setFieldsValue({orgId: `${orgId}`, id, name, pic, description})
        )
      }
    })
  }
  public componentWillMount () {
    this.props.onLoadProjects()
    this.props.onLoadOrganizations()
  }

  private stopPPG = (e) => {
    e.stopPropagation()
  }
  private hideProjectForm = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    }, () => {
      this.ProjectForm.resetFields()
    })
  }

  private onModalOk = () => {
    this.ProjectForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ modalLoading: true })
        if (this.state.formType === 'add') {
          this.props.onAddProject({
            ...values,
            pic: `${Math.ceil(Math.random() * 19)}`,
            config: '{}'
          }, () => {
            this.hideProjectForm() })
        } else {
          this.props.onEditProject({...values, ...{orgId: Number(values.orgId)}}, () => { this.hideProjectForm() })
        }
      }
    })
  }

  private widgetTypeChange = (val) =>
    new Promise((resolve) => {
      this.forceUpdate(() => resolve())
    })

  private checkNameUnique = (rule, value = '', callback) => {
    const { onCheckUniqueName } = this.props
    const { getFieldsValue } = this.ProjectForm
    const { orgId, id } = getFieldsValue()
    const data = {
      name: value,
      orgId,
      id
    }
    onCheckUniqueName('project', data,
      () => {
        callback()
      }, (err) => {
        callback(err)
      })
  }
  private toProject = (d: any) => () => {
    const pid = d.id
    this.props.router.push(`/project/${pid}`)
  }
  public render () {
    const { formType, formVisible, modalLoading } = this.state
    const { onDeleteProject, organizations, projects } = this.props
    const projectArr = Array.isArray(projects) ? [...projects, ...[{
      id: 'add',
      type: 'add'
    }]] : []
    const projectItems = projectArr
      ? projectArr.map((d) => {
        if (d.type && d.type === 'add') {
          return (
            <Col
              key={d.id}
              xl={6}
              lg={6}
              md={8}
              sm={12}
              xs={24}
            >
              <div
                className={styles.unit}
                onClick={this.showProjectForm('add')}
              >
                <div className={styles.createNewWrapper}>
                  <div className={styles.createIcon}>
                    <Icon type="plus-circle-o" />
                  </div>
                  <div className={styles.createText}>
                    创建新项目
                  </div>
                </div>
              </div>
            </Col>
          )
        }
        let editButton = void 0
        let deleteButton = void 0
        editButton =  (
          <Tooltip title="编辑">
            <Icon className={styles.edit} type="setting" onClick={this.showProjectForm('edit', d)} />
          </Tooltip>
        )
        deleteButton = (
          <Popconfirm
            title="确定删除？"
            placement="bottom"
            onConfirm={onDeleteProject(d.id)}
          >
            <Tooltip title="删除">
              <Icon className={styles.delete} type="delete" onClick={this.stopPPG}/>
            </Tooltip>
          </Popconfirm>
        )

        const itemClass = classnames({
          [styles.unit]: true,
      //    [styles.editing]: !d.publish
        })

      //  const editHint = !d.publish && '(编辑中…)'
        const colItems = (
            <Col
              key={d.id}
              xl={6}
              lg={6}
              md={8}
              sm={12}
              xs={24}
            >
              <div
                className={itemClass}
                style={{backgroundImage: `url(${require(`../../assets/images/bg${d.pic}.png`)})`}}
                onClick={this.toProject(d)}
              >
                <header>
                  <h3 className={styles.title}>
                    {d.name}
                    {/*{editHint}*/}
                  </h3>
                  <p className={styles.content}>
                    {d.desc}
                  </p>
                </header>
                {editButton}
                {deleteButton}
              </div>
            </Col>
          )
        return colItems
      }) : ''
    return (
      <div className={styles.wrap}>
        <div className={styles.container}>
          <Row>
            <Col xl={18} lg={18} md={16} sm={12} xs={24}>
              <div className={styles.header}>我的项目</div>
            </Col>
          </Row>
          <Row gutter={20}>
            {projectItems}
          </Row>
          <Modal
            title={null}
            footer={null}
            visible={formVisible}
            onCancel={this.hideProjectForm}
          >
            <ProjectsForm
              type={formType}
              ref={(f) => { this.ProjectForm = f }}
              modalLoading={modalLoading}
              organizations={organizations}
              onModalOk={this.onModalOk}
              onCheckUniqueName={this.checkNameUnique}
              onWidgetTypeChange={this.widgetTypeChange}
            />
          </Modal>
        </div>
      </div>
    )
  }
}


const mapStateToProps = createStructuredSelector({
  organizations: makeSelectOrganizations(),
  projects: makeSelectProjects(),
  loginUser: makeSelectLoginUser()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadProjects: () => dispatch(loadProjects()),
    onLoadOrganizations: () => dispatch(loadOrganizations()),
    onAddProject: (project, resolve) => dispatch(addProject(project, resolve)),
    onEditProject: (project, resolve) => dispatch(editProject(project, resolve)),
    onDeleteProject: (id) => () => dispatch(deleteProject(id)),
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withReducer = injectReducer({ key: 'project', reducer })
const withSaga = injectSaga({ key: 'project', saga })

const withOrganizationReducer = injectReducer({ key: 'organization', reducer: reducerOrganization })
const withOrganizationSaga = injectSaga({ key: 'organization', saga: sagaOrganization })

const withAppReducer = injectReducer({key: 'app', reducer: reducerApp})
const withAppSaga = injectSaga({key: 'app', saga: sagaApp})

export default compose(
  withReducer,
  withOrganizationReducer,
  withAppReducer,
  withAppSaga,
  withSaga,
  withOrganizationSaga,
  withConnect
)(Projects)


