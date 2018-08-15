import * as React from 'react'
import {connect} from 'react-redux'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Tooltip = require('antd/lib/tooltip')
const Popconfirm = require('antd/lib/popconfirm')
const Tag = require('antd/lib/tag')
const Icon = require('antd/lib/icon')
const Modal = require('antd/lib/modal')
const styles = require('./Project.less')
import * as classnames from 'classnames'
import {InjectedRouter} from 'react-router/lib/Router'
import {WrappedFormUtils} from 'antd/lib/form/Form'
import {addProject, deleteProject, editProject, loadProjects, loadProjectDetail, transferProject, searchProject} from './actions'
import {compose} from 'redux'
import {makeSelectLoginUser} from '../App/selectors'
import {makeSelectProjects, makeSelectSearchProject} from './selectors'
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
import ComponentPermission from '../Account/components/checkMemberPermission'
import Avatar from '../../components/Avatar'
import Box from '../../components/Box'
const utilStyles = require('../../assets/less/util.less')

interface IProjectsProps {
  router: InjectedRouter
  projects: IProject[]
  searchProject: any[]
  organizations: any
  onTransferProject: (id: number, orgId: number) => any
  onEditProject: (project: any, resolve: () => any) => any
  onLoadProjects: () => any
  onAddProject: (project: any, resolve: () => any) => any
  onLoadOrganizations: () => any
  onDeleteProject: (id: number) => any
  onLoadProjectDetail: (id: number) => any
  onSearchProject: (param: {keywords: string, pageNum: number, pageSize: number }) => any
  onCheckUniqueName: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
}

interface IProjectsState {
  formType?: string
  formVisible: boolean
  modalLoading: boolean
  mimePanel: boolean
  joinPanel: boolean
  searchMaskVisible: boolean
  searchKeywordsVisible: boolean
  keywords: string
}
interface IProject {
  type?: string
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
      modalLoading: false,
      mimePanel: true,
      joinPanel: true,
      searchMaskVisible: true,
      searchKeywordsVisible: false,
      keywords: ''
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
        const {orgId, id, name, pic, description, visibility} = project
        this.widgetTypeChange(`${orgId}`).then(
          () => {
            this.ProjectForm.setFieldsValue({orgId: `${orgId}`, id, name, pic, description, visibility: `${visibility ? '1' : '0'}`})
          }
        )
      }
    })
  }
  public componentWillMount () {
    this.props.onLoadProjects()
    this.props.onLoadOrganizations()
  }

  private enterSearch: (e: KeyboardEvent) => any = null

  public componentWillUnmount () {
    this.unbindDocumentKeypress()
  }

  private bindDocumentKeypress = () => {
    this.enterSearch = (e) => {
      if (e.keyCode === 13) {
        this.searchProject()
      }
    }

    document.addEventListener('keypress', this.enterSearch, false)
    this.setState({
      searchMaskVisible: false,
      searchKeywordsVisible: false
    })
  }

  private unbindDocumentKeypress = () => {
    document.removeEventListener('keypress', this.enterSearch, false)
    this.enterSearch = null
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
          this.props.onEditProject({...values, ...{visibility: !!Number(values.visibility)}, ...{orgId: Number(values.orgId)}}, () => { this.hideProjectForm() })
        }
      }
    })
  }

  private foldPanel = (flag) => () => {
    this.setState({
      [flag]: !this.state[flag]
    })
  }

  private onTransfer = () => {
    this.ProjectForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ modalLoading: true })
        const {id, orgId} = values
        this.props.onTransferProject(id, Number(orgId))
        this.hideProjectForm()
      }
    })
  }

  private searchProject = () => {
    const { onSearchProject } = this.props
    const { keywords } = this.state
    const param = {
      keywords,
      pageNum: 1,
      pageSize: 10
    }
    this.setState({
      searchMaskVisible: false
    },() => onSearchProject(param))
  }
  private widgetTypeChange = (val) =>
    new Promise((resolve) => {
      this.forceUpdate(() => resolve())
    })

  private checkNameUnique = (rule, value = '', callback) => {
    const { onCheckUniqueName } = this.props
    const { getFieldsValue } = this.ProjectForm
    const fieldsValue = getFieldsValue()
    const orgId = fieldsValue['orgId']
    const id = fieldsValue['id']
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
    this.props.onLoadProjectDetail(pid)
  }
  private hideSearchMask = () => {
    this.setState({
      searchMaskVisible: true,
      searchKeywordsVisible: true
    })
  }
  private onChangeKeywords = (e) => {
      const param = {
        keywords: e.target.value.trim(),
        pageNum: 1,
        pageSize: 10
      }
      this.setState({
        keywords: e.target.value.trim()
      }, () => this.props.onSearchProject(param))
  }
  private selectKeywords = (keyword) => () => {
    const param = {
      keywords: keyword,
      pageNum: 1,
      pageSize: 10
    }
    this.setState({
      keywords: keyword,
      searchKeywordsVisible: true
    }, () => this.props.onSearchProject(param))
  }
  private computSearchListWrapperStyle = () => {
    const {searchProject} = this.props
    if (this.state.searchMaskVisible) {
      return this.state.searchMaskVisible
    } else {
      if (searchProject && searchProject.list && searchProject.list.length !== 0) {
        return this.state.searchMaskVisible
      }
      return true
    }
  }
  public render () {
    const { formType, formVisible, modalLoading } = this.state
    const { onDeleteProject, organizations, projects, searchProject } = this.props
    const projectArr = Array.isArray(projects) ? [...projects, ...[{
      id: 'add',
      type: 'add'
    }]] : [...[{
      id: 'add',
      type: 'add'
    }]]
    const projectItems = projectArr
      ? projectArr.map((d: IProject) => {
        let CreateButton = void 0
        let belongWhichOrganization = void 0
        if (d.type && d.type === 'add') {
          return (
            <Col
              key={d.id}
              xl={6}
              lg={8}
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
        if (organizations) {
          belongWhichOrganization = organizations.find((org) => org.id === d.orgId)
          CreateButton = ComponentPermission(belongWhichOrganization, '')(Icon)
        }
        let editButton = void 0
        let deleteButton = void 0
        let transfer = void 0
        transfer = (
          <Tooltip title="移交项目">
            <CreateButton className={styles.transfer} type="double-right" onClick={this.showProjectForm('transfer', d)} />
          </Tooltip>
        )
        editButton =  (
          <Tooltip title="编辑">
            <CreateButton className={styles.edit} type="setting" onClick={this.showProjectForm('edit', d)} />
          </Tooltip>
        )
        deleteButton = (
          <Popconfirm
            title="确定删除？"
            placement="bottom"
            onConfirm={onDeleteProject(d.id)}
          >
            <Tooltip title="删除">
              <CreateButton className={styles.delete} type="delete" onClick={this.stopPPG}/>
            </Tooltip>
          </Popconfirm>
        )

        const itemClass = classnames({
          [styles.unit]: true
        })
        const colItems = (
            <Col
              key={d.id}
              xl={6}
              lg={8}
              md={8}
              sm={12}
              xs={24}
            >
              <div
                className={itemClass}
                style={{backgroundImage: `url(${require(`../../assets/images/bg${d.pic || 9}.png`)})`}}
                onClick={this.toProject(d)}
              >
                <header>
                  <h3 className={styles.title}>
                    {d.name}
                    {/*{editHint}*/}
                  </h3>
                  <p className={styles.content}>
                    {d.description}
                  </p>
                </header>
                {transfer}
                {editButton}
                {deleteButton}
              </div>
            </Col>
          )
        return colItems
      }) : ''
    const history =  projects
      ? projects.map((d: IProject) => {
        const path = require(`../../assets/images/bg${d.pic || 9}.png`)
        const colItems = (
          <div className={styles.groupList} key={d.id} onClick={this.toProject(d)}>
            <div className={styles.orgHeader}>
              <div className={styles.avatar}>
                <Avatar path={path} enlarge={false} size="small"/>
              </div>
              <div className={styles.name}>
                <div className={styles.title}>{d.name}</div>
                <div className={styles.desc}>{d.description}</div>
              </div>
            </div>
          </div>
        )
        return colItems
      }) : ''
    const projectSearchItems = searchProject && searchProject.list ? searchProject.list.map((d: IProject) => {
      const path = require(`../../assets/images/bg${d.pic || 9}.png`)
      const colItems = (
          <Col
            xl={6}
            lg={8}
            md={8}
            sm={12}
            xs={24}
            key={d.id}
          >
            <div className={styles.searchList} key={d.id} onClick={this.toProject(d)}>
              <div className={styles.orgHeader}>
                <div className={styles.avatar}>
                  <Avatar path={path} enlarge={false} size="small"/>
                </div>
                <div className={styles.name}>
                  <div className={styles.title}>{d.name}</div>
                  <div className={styles.desc}>{d.description}</div>
                </div>
              </div>
              <div className={styles.others}>
                <div className={styles.star}>
                  <Icon type="star"/>
                  <span>1000</span>
                </div>
                <div className={styles.star}>
                  <Icon type="save"/>
                  <span>fork</span>
                </div>
              </div>
            </div>
          </Col>
      )
      return colItems
    }) : ''
    const maskStyle = classnames({
      [utilStyles.hide]: this.state.searchMaskVisible,
      [styles.mask]: true
    })

    const searchKeywords = (
      <ul>
        {searchProject && searchProject.list.map((list, index) => <li key={`${list.name}of${index}`} onClick={this.selectKeywords(list.name)}><p>{list.name}</p></li>)}
      </ul>
    )

    const searchKeywordsStyle = classnames({
      [utilStyles.hide]: this.state.searchKeywordsVisible,
      [styles.searchKeywords]: searchProject && searchProject.list.length !== 0
    })

    const isHoldMimeStyle = classnames({
      [styles.listPadding]: true,
      [utilStyles.hide]: !this.state.mimePanel
    })

    const isHoldJoinStyle = classnames({
      [styles.listPadding]: true,
      [utilStyles.hide]: !this.state.joinPanel
    })

    const searchListWrapperStyle = classnames({
      [utilStyles.hide]: this.computSearchListWrapperStyle(),
      [styles.searchListWrapper]: true
    })

    return (
      <div className={styles.wrapper}>
        <div className={styles.search}>
          <div  className={styles.searchWrapper}>
            <label htmlFor="newtab-search-text" className={styles.searchLabel}></label>
            <input
              id="newtab-search-text"
              placeholder="Search the Davinci"
              title="Search the Web"
              autoComplete="off"
              onFocus={this.bindDocumentKeypress}
              onBlur={this.unbindDocumentKeypress}
              onChange={this.onChangeKeywords}
              value={this.state.keywords}
              type="search"
            />
            <span className={styles.searchButton} onClick={this.searchProject}>
              <i className="iconfont icon-forward"/>
            </span>
          </div>
          {/*<div className={searchKeywordsStyle}>*/}
            {/*{searchKeywords}*/}
          {/*</div>*/}
        </div>
        <div className={searchListWrapperStyle}>
          <Box>
            <Box.Header>
              <Box.Title>
                <Row>
                  <Col span={20}>
                    <Icon type="bars" />搜索到的项目
                  </Col>
                </Row>
              </Box.Title>
            </Box.Header>
            <div className={styles.listPadding}>
              <Row gutter={16}>
                {projectSearchItems}
              </Row>
            </div>
          </Box>
        </div>
        <div className={styles.wrap}>
          <Row style={{width: '100%'}}>
            <Col
              xl={18}
              lg={18}
              md={24}
              sm={24}
              xs={24}
              key="projects"
            >
              <div className={styles.container}>
                <div className={styles.projects}>
                  <div className={styles.mime} id="mime">
                    <Box>
                      <Box.Header>
                        <Box.Title>
                          <Row>
                            <Col span={20}>
                              <Icon type={`${this.state.mimePanel ? 'down' : 'right'}`} onClick={this.foldPanel('mimePanel')} />我创建的项目
                            </Col>
                          </Row>
                        </Box.Title>
                      </Box.Header>
                      <div className={isHoldMimeStyle}>
                        <Row gutter={16}>
                          {projectItems}
                        </Row>
                      </div>
                    </Box>
                  </div>
                  <div className={styles.join} id="join">
                    <Box>
                      <Box.Header>
                        <Box.Title>
                          <Row>
                            <Col span={20}>
                              <Icon type={`${this.state.joinPanel ? 'down' : 'right'}`} onClick={this.foldPanel('joinPanel')}/>我参与的项目
                            </Col>
                          </Row>
                        </Box.Title>
                      </Box.Header>
                      <div className={isHoldJoinStyle}>
                        <Row gutter={16}>
                          {projectItems}
                        </Row>
                      </div>
                    </Box>
                  </div>
                </div>
              </div>
            </Col>
            <Col
              xl={6}
              lg={6}
              md={24}
              sm={24}
              xs={24}
              key="history"
            >
              <div className={styles.sideBox}>
                <Box>
                  <Box.Header>
                    <Box.Title>
                      <Row>
                        <Col span={20}>
                          <Icon type="bars" />浏览历史
                        </Col>
                      </Row>
                    </Box.Title>
                  </Box.Header>
                  {history}
                </Box>
              </div>
            </Col>
          </Row>
        </div>
        <div className={maskStyle} onClick={this.hideSearchMask}/>
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
            onTransfer={this.onTransfer}
            onCheckUniqueName={this.checkNameUnique}
            onWidgetTypeChange={this.widgetTypeChange}
          />
        </Modal>
      </div>
    )
  }
}


const mapStateToProps = createStructuredSelector({
  organizations: makeSelectOrganizations(),
  projects: makeSelectProjects(),
  loginUser: makeSelectLoginUser(),
  searchProject: makeSelectSearchProject()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadProjects: () => dispatch(loadProjects()),
    onLoadProjectDetail: (id) => dispatch(loadProjectDetail(id)),
    onLoadOrganizations: () => dispatch(loadOrganizations()),
    onAddProject: (project, resolve) => dispatch(addProject(project, resolve)),
    onEditProject: (project, resolve) => dispatch(editProject(project, resolve)),
    onTransferProject: (id, orgId) => dispatch(transferProject(id, orgId)),
    onDeleteProject: (id) => () => dispatch(deleteProject(id)),
    onSearchProject: (param) => dispatch(searchProject(param)),
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



