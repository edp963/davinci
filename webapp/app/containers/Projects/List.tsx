import * as React from 'react'
import * as classnames from 'classnames'
import { connect } from 'react-redux'
import { Row, Col, Tooltip, Popconfirm, Icon, Modal, Button, Pagination } from 'antd'
import { WrappedFormUtils } from 'antd/lib/form/Form'
const styles = require('../Organizations/Project.less')

import { ProjectActions } from './actions'
import { compose } from 'redux'
import { makeSelectLoginUser } from '../App/selectors'
import { makeSelectProjects, makeSelectSearchProject, makeSelectStarUserList, makeSelectCollectProjects } from './selectors'
import injectReducer from 'utils/injectReducer'
import { createStructuredSelector } from 'reselect'
import injectSaga from 'utils/injectSaga'
import ProjectsForm from '../Organizations/component/ProjectForm'
import saga from './sagas'
import reducer from './reducer'
import reducerOrganization from '../Organizations/reducer'
import sagaOrganization from '../Organizations/sagas'
import { OrganizationActions } from '../Organizations/actions'
const { loadOrganizations } = OrganizationActions
import { makeSelectOrganizations } from '../Organizations/selectors'
import { checkNameUniqueAction } from '../App/actions'
import ComponentPermission from '../Account/components/checkMemberPermission'
import Avatar from 'components/Avatar'
import Box from 'components/Box'
import Star from 'components/StarPanel/Star'
const utilStyles = require('assets/less/util.less')
import HistoryStack from '../Organizations/component/historyStack'
import { DEFAULT_ECHARTS_THEME } from 'app/globalConstants'
const historyStack = new HistoryStack()

import { RouteComponentWithParams } from 'utils/types'
import { IProject, IStarUser } from './types'

interface IProjectsProps {
  projects: IProject[]
  collectProjects: IProject[]
  loginUser: any
  searchProject?: {list: any[], total: number, pageNum: number, pageSize: number}
  organizations: any
  starUserList: IStarUser[]
  onTransferProject: (id: number, orgId: number) => any
  onEditProject: (project: any, resolve: () => any) => any
  onLoadProjects: () => any
  onAddProject: (project: any, resolve: () => any) => any
  onLoadOrganizations: () => any
  onLoadCollectProjects: () => any
  onClickCollectProjects: (formType: string, project: object, resolve: (id: number) => any) => any
  onDeleteProject: (id: number, resolve?: any) => any
  onLoadProjectDetail: (id: number) => any
  onStarProject: (id: number, resolve: () => any) => any,
  onGetProjectStarUser: (id: number) => any,
  onSearchProject: (param: {keywords: string, pageNum: number, pageSize: number }) => any
  onCheckUniqueName: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
}

interface IProjectsState {
  formType?: string
  formVisible: boolean
  modalLoading: boolean
  mimePanel: boolean
  joinPanel: boolean
  collectPanel: boolean
  searchMaskVisible: boolean
  searchKeywordsVisible: boolean
  keywords: string
  currentPage: number
  pageSize: number
  isDisableCollect: boolean
}

export class Projects extends React.PureComponent<IProjectsProps & RouteComponentWithParams, IProjectsState> {
  constructor (props) {
    super(props)
    this.state = {
      formType: '',
      formVisible: false,
      modalLoading: false,
      mimePanel: true,
      joinPanel: true,
      collectPanel: true,
      searchMaskVisible: true,
      searchKeywordsVisible: false,
      keywords: '',
      currentPage: 1,
      pageSize: 10,
      isDisableCollect: false
    }
  }
  private ProjectForm: WrappedFormUtils
  private showProjectForm = (formType, project?: IProject) => (e) => {
    this.stopPPG(e)
    this.setState({
      formType,
      formVisible: true
    }, () => {
      setTimeout(() => {
        if (project) {
          const {orgId, id, name, pic, description, visibility} = project
          this.widgetTypeChange(`${orgId}`).then(
            () => {
              if (this.state.formType === 'transfer') {
                this.ProjectForm.setFieldsValue({id, name, orgId_hc: `${orgId}`, pic, description, visibility: `${visibility}`})
                return
              }
              this.ProjectForm.setFieldsValue({orgId: `${orgId}`, id, name, pic, description, visibility: `${visibility}`})
            }
          )
        }
      }, 0)
    })
  }

  private collectProject = (formType, project?: IProject) => (e) => {
    const { projects, collectProjects, onClickCollectProjects } = this.props
    this.stopPPG(e)
    this.setState({
      formType
    }, () => {
      onClickCollectProjects(formType, project, () => {
        this.setState({
          isDisableCollect: this.state.formType === 'collect' ? true : false
        })
      })
    })
  }

  public componentWillMount () {
    this.props.onLoadProjects()
    this.props.onLoadOrganizations()
    this.props.onLoadCollectProjects()
    // historyStack.init()
  }

  public componentWillReceiveProps (nextProps) {
    // if (nextProps.loginUser !== this.props.loginUser) {
    //   historyBrowser.init()
    // }
    const { projects, collectProjects } = nextProps
    if (projects) {
      historyStack.init(projects)
    }
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
    return
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
        values.visibility = values.visibility === 'true' ? true : false
        if (this.state.formType === 'add') {
          this.props.onAddProject({
            ...values,
            pic: `${Math.ceil(Math.random() * 19)}`
            // config: '{}'
          }, () => {
            this.props.onLoadProjects()
            this.hideProjectForm()
          })
        } else {
          this.props.onEditProject({...values, ...{orgId: Number(values.orgId)}}, () => {
            this.props.onLoadProjects()
            this.hideProjectForm()
          })
        }
      }
    })
  }

  private foldPanel = (flag) => () => {
    // this.setState({
    //   [flag]: !this.state[flag]
    // })
    if (flag === 'mimePanel') {
      this.setState({
        mimePanel: !this.state.mimePanel
      })
    } else if (flag === 'joinPanel') {
      this.setState({
        joinPanel: !this.state.joinPanel
      })
    } else if (flag === 'collectPanel') {
      this.setState({
        collectPanel: !this.state.collectPanel
      })
    }
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
      pageNum: this.state.currentPage,
      pageSize: this.state.pageSize
    }
    this.setState({
      searchMaskVisible: false
    }, () => onSearchProject(param))
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
    const projectId = d.id
    this.props.history.push(`/project/${projectId}`)
   // this.props.onLoadProjectDetail(projectId)
    this.saveHistory(d)
  }

  private saveHistory = (d: any) => {
    historyStack.pushNode(d)
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
        pageNum: this.state.currentPage,
        pageSize: this.state.pageSize
      }
      this.setState({
        keywords: e.target.value.trim()
      }, () => this.props.onSearchProject(param))
  }
  private selectKeywords = (keyword) => () => {
    const param = {
      keywords: keyword,
      pageNum: this.state.currentPage,
      pageSize: this.state.pageSize
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
  private onShowSizeChange = (current, pageSize) => {
    this.setState({
      currentPage: current,
      pageSize
    }, () => {
      const param = {
        keywords: this.state.keywords,
        pageNum: this.state.currentPage,
        pageSize: this.state.pageSize
      }
      this.props.onSearchProject(param)
    })
  }
  private onPaginationChange = (page) => {
    this.setState({
      currentPage: page
    }, () => {
      const param = {
        keywords: this.state.keywords,
        pageNum: this.state.currentPage,
        pageSize: this.state.pageSize
      }
      this.props.onSearchProject(param)
    })
  }
  private starProject = (id)  => () => {
    const { onStarProject } = this.props
    onStarProject(id, () => {
      this.props.onLoadProjects()
    })
  }
  private getStarProjectUserList = (id) => () => {
    const { onGetProjectStarUser } = this.props
    onGetProjectStarUser(id)
  }

  private confirmDeleteProject = (type, id) => (e) => {
    this.stopPPG(e)
    if (type === 'collect') {
      this.props.onDeleteProject(id)
    } else {
      this.props.onDeleteProject(id, () => {
        this.setState({
        })
      })
    }
  }

  public render () {
    const { formType, formVisible, modalLoading } = this.state
    const {onDeleteProject, organizations, projects, searchProject, loginUser, starUserList, collectProjects } = this.props
    const projectArr = Array.isArray(projects) ? [...projects, ...[{
      id: 'add',
      type: 'add'
    }]] : [...[{
      id: 'add',
      type: 'add'
    }]]

    const starWrapperStyle = classnames({
      [styles.starWrapperPosition]: true,
      [styles.starWrapper]: true
    })
    const mimeProjects = projectArr
      ? projectArr.map((d: IProject) => {
        let CreateButton = void 0
        let belongWhichOrganization = void 0
        if (d.type && d.type === 'add') {
          return (
            <Col
              key={d.id}
              xxl={6}
              xl={8}
              lg={8}
              md={12}
              sm={24}
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
        if (loginUser && d.createBy && loginUser.id !== d.createBy.id) {
          return []
        }
        if (organizations) {
          belongWhichOrganization = organizations.find((org) => org.id === d.orgId)
          CreateButton = ComponentPermission(belongWhichOrganization, '')(Icon)
        }
        let editButton = void 0
        let deleteButton = void 0
        let transfer = void 0
        let star = void 0
        let StarPanel = void 0
        if (d && d.id) {
          StarPanel = <Star d={d} starUser={starUserList} unStar={this.starProject} userList={this.getStarProjectUserList}/>
        }
        star = (
          <Tooltip title="点赞项目">
            <div className={styles.starWrapperPosition}>
              {StarPanel}
            </div>
          </Tooltip>
        )

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
            onConfirm={this.confirmDeleteProject('collect', d.id)}
          >
            <Tooltip title="删除">
              <CreateButton className={styles.delete} type="delete" onClick={this.stopPPG}/>
            </Tooltip>
          </Popconfirm>
        )
        let ProjectName
        const org = organizations.find((org, index) => d.orgId === org.id)
        if (d && organizations) {
          ProjectName = `${d.name} (${org && org.name ? org.name : ''})`
        }
        const itemClass = classnames({
          [styles.unit]: true
        })
        const colItems = (
            <Col
              key={d.id}
              xxl={6}
              xl={8}
              lg={8}
              md={12}
              sm={24}
            >
              <div
                className={itemClass}
                style={{backgroundImage: `url(${require(`assets/images/bg${d.pic}.png`)})`}}
                onClick={this.toProject(d)}
              >
                <header>
                  <h3 className={styles.title}>
                    {ProjectName}
                    {/*{editHint}*/}
                  </h3>
                  <p className={styles.content}>
                    {d.description}
                  </p>
                </header>
                {star}
                <div className={styles.mimeActions}>
                  {transfer}
                  {editButton}
                  {deleteButton}
                </div>
              </div>
            </Col>
          )
        return colItems
      }) : ''
    const joinProjects = projectArr
      ? projectArr.map((d: IProject) => {
        let CreateButton = void 0
        let belongWhichOrganization = void 0
        if (d.type && d.type === 'add') {
          return []
        }
        if (loginUser && d.createBy && loginUser.id === d.createBy.id) {
          return []
        }

        if (organizations) {
          belongWhichOrganization = organizations.find((org) => org.id === d.orgId)
          CreateButton = ComponentPermission(belongWhichOrganization, '')(Icon)
        }
        let StarPanel = void 0
        if (d && d.id) {
          StarPanel = <Star d={d} starUser={starUserList} unStar={this.starProject} userList={this.getStarProjectUserList}/>
        }
        let editButton = void 0
        let deleteButton = void 0
        let collectButton = void 0
        let unCollectButton = void 0
        let transfer = void 0
        let star = void 0
        let ProjectName
        const org = organizations.find((org, index) => d.orgId === org.id)
        if (d && organizations) {
          ProjectName = `${d.name} (${org && org.name ? org.name : ''})`
        }
        star = (
          <Tooltip title="点赞项目">
            <div className={styles.starWrapperPosition}>
              {StarPanel}
            </div>
          </Tooltip>
        )

        let currentCollectIds = []
        if (collectProjects) {
          currentCollectIds = collectProjects.map((cp) => cp.id)
        }

        collectButton = (
          <Tooltip title="收藏">
            <i
              className={`iconfont icon-heart1 ${styles.collect}`}
              onClick={this.collectProject('collect', d)}
            />
          </Tooltip>
        )

        unCollectButton = (
          <Tooltip title="取消收藏">
            <i
              className={`iconfont icon-heart ${styles.unCollect}`}
              onClick={this.collectProject('unCollect', d)}
            />
          </Tooltip>
        )

        transfer = (
          <Tooltip title="移交项目">
            <CreateButton
              className={styles.transfer}
              type="double-right"
              onClick={this.showProjectForm('transfer', d)}
            />
          </Tooltip>
        )
        editButton =  (
          <Tooltip title="编辑">
            <CreateButton
              className={styles.edit}
              type="setting"
              onClick={this.showProjectForm('edit', d)}
            />
          </Tooltip>
        )
        deleteButton = (
          <Popconfirm
            title="确定删除？"
            placement="bottom"
            onConfirm={this.confirmDeleteProject('onCollect', d.id)}
          >
            <Tooltip title="删除">
              <CreateButton
                className={styles.delete}
                type="delete"
                onClick={this.stopPPG}
              />
            </Tooltip>
          </Popconfirm>
        )

        const itemClass = classnames({
          [styles.unit]: true
        })
        const colItems = (
          <Col
            key={d.id}
            xxl={6}
            xl={8}
            lg={8}
            md={12}
            sm={24}
          >
            <div
              className={itemClass}
              style={{backgroundImage: `url(${require(`assets/images/bg${d.pic}.png`)})`}}
              onClick={this.toProject(d)}
            >
              <header>
                <h3 className={styles.title}>
                  {ProjectName}
                  {/*{editHint}*/}
                </h3>
                <p className={styles.content}>
                  {d.description}
                </p>
              </header>
              {star}
              <div className={styles.joinActions}>
                {currentCollectIds.indexOf(d.id) < 0 ? collectButton : unCollectButton}
                {transfer}
                {editButton}
                {deleteButton}
              </div>
            </div>
          </Col>
        )
        return colItems
      }) : ''

    const collectProjectsArr = collectProjects
    ? collectProjects.map((d: IProject) => {
      let CreateButton = void 0
      let belongWhichOrganization = void 0
      if (d.type && d.type === 'add') {
        return []
      }
      if (loginUser && d.createBy && loginUser.id === d.createBy.id) {
        return []
      }
      if (organizations) {
        belongWhichOrganization = organizations.find((org) => org.id === d.orgId)
        CreateButton = ComponentPermission(belongWhichOrganization, '')(Icon)
      }
      let StarPanel = void 0
      if (d && d.id) {
        StarPanel = <Star d={d} starUser={starUserList} unStar={this.starProject} userList={this.getStarProjectUserList}/>
      }
      let collectButton = void 0
      let star = void 0
      let ProjectName
      const org = organizations.find((org, index) => d.orgId === org.id)
      if (d && organizations) {
        ProjectName = `${d.name} (${org && org.name ? org.name : ''})`
      }
      star = (
        <Tooltip title="点赞项目">
          <div className={styles.starWrapperPosition}>
            {StarPanel}
          </div>
        </Tooltip>
      )

      collectButton = (
        <Tooltip title="取消收藏">
          <i
            className={`iconfont icon-heart ${styles.unCollect}`}
            onClick={this.collectProject('unCollect', d)}
          />
        </Tooltip>
      )

      const itemClass = classnames({
        [styles.unit]: true
      })
      const colItems = (
        <Col
          key={d.id}
          xxl={6}
          xl={8}
          lg={8}
          md={12}
          sm={24}
        >
          <div
            className={itemClass}
            style={{backgroundImage: `url(${require(`assets/images/bg${d.pic}.png`)})`}}
            onClick={this.toProject(d)}
          >
            <header>
              <h3 className={styles.title}>
                {ProjectName}
                {/*{editHint}*/}
              </h3>
              <p className={styles.content}>
                {d.description}
              </p>
            </header>
            {star}
            <div className={styles.collectActions}>
              {collectButton}
            </div>
          </div>
        </Col>
      )
      return colItems
    }) : ''

    const historyBrowserAll = historyStack.getAll()
    const history = historyBrowserAll
      ? historyBrowserAll.map((d: IProject) => {
        const path = require(`assets/images/bg${d.pic}.png`)
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

    const projectSearchItems = searchProject && searchProject.list && searchProject.list.length ? searchProject.list.map((d: IProject) => {
      const path = require(`assets/images/bg${d.pic}.png`)
      let StarPanel = void 0
      if (d && d.id) {
        StarPanel = <Star d={d} starUser={starUserList} unStar={this.starProject} userList={this.getStarProjectUserList}/>
      }
      const colItems = (
          <Col
            xxl={6}
            xl={8}
            lg={8}
            md={12}
            sm={24}
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
              {/*<div className={styles.others}>*/}
                {/*<div className={styles.star}>*/}
                  {/*{StarPanel}*/}
                {/*</div>*/}
              {/*</div>*/}
            </div>
          </Col>
      )
      return colItems
    }) : ''
    let projectSearchPagination = void 0
    if (searchProject) {
      projectSearchPagination = (
        <Pagination
          // simple={screenWidth < 768 || screenWidth === 768}
          showSizeChanger
          defaultCurrent={2}
          total={searchProject.total}
          onShowSizeChange={this.onShowSizeChange}
          onChange={this.onPaginationChange}
          defaultPageSize={10}
          pageSizeOptions={['10', '15', '18']}
          current={this.state.currentPage}
        />
      )
    }
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

    const isHoldCollectStyle = classnames({
      [styles.listPadding]: true,
      [utilStyles.hide]: !this.state.collectPanel
    })

    const searchListWrapperStyle = classnames({
      [utilStyles.hide]: this.computSearchListWrapperStyle(),
      [styles.searchListWrapper]: true
    })
    const wrapper = classnames({
      [styles.wrapper]: true,
      [styles.overflowY]: this.state.searchMaskVisible
    })
    const joinStyle = classnames({
      [styles.join]: true,
      [utilStyles.hide]: !(joinProjects && joinProjects.length > 0)
    })
    const collectStyle = classnames({
      [styles.mime]: true,
      [utilStyles.hide]: !(collectProjectsArr && collectProjectsArr.length > 0)
    })
    return (
      <div className={wrapper}>
        <div className={styles.search}>
          <div  className={styles.searchWrapper}>
            <label htmlFor="newtab-search-text" className={styles.searchLabel}/>
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
            <div className={styles.listPadding} style={{overflow: 'auto'}}>
              <Row gutter={16}>
                {projectSearchItems}
              </Row>
              <Row type="flex" justify="end">
                <Col>
                  {projectSearchPagination}
                </Col>
              </Row>
            </div>
          </Box>
        </div>
        <div className={styles.wrap}>
          <Row style={{width: '100%'}}>
            <Col
              xxl={18}
              xl={18}
              lg={24}
              md={24}
              sm={24}
              key="projects"
            >
              <div className={styles.container}>
                <div className={styles.projects}>
                  <div className={styles.mime} id="mime">
                    <Box>
                      <Box.Header>
                        <Box.Title>
                          <Row onClick={this.foldPanel('mimePanel')}>
                            <Col span={20}>
                              <Icon type={`${this.state.mimePanel ? 'down' : 'right'}`} />我创建的项目
                            </Col>
                          </Row>
                        </Box.Title>
                      </Box.Header>
                      <div className={isHoldMimeStyle}>
                        <Row gutter={16}>
                          {mimeProjects}
                        </Row>
                      </div>
                    </Box>
                  </div>
                  <div className={joinStyle} id="join">
                    <Box>
                      <Box.Header>
                        <Box.Title>
                          <Row onClick={this.foldPanel('joinPanel')}>
                            <Col span={20}>
                              <Icon type={`${this.state.joinPanel ? 'down' : 'right'}`} />我参与的项目
                            </Col>
                          </Row>
                        </Box.Title>
                      </Box.Header>
                      <div className={isHoldJoinStyle}>
                        <Row gutter={16}>
                          {joinProjects}
                        </Row>
                      </div>
                    </Box>
                  </div>
                  <div className={collectStyle} id="collect">
                    <Box>
                      <Box.Header>
                        <Box.Title>
                          <Row onClick={this.foldPanel('collectPanel')}>
                            <Col span={20}>
                              <Icon type={`${this.state.collectPanel ? 'down' : 'right'}`} />我收藏的项目
                            </Col>
                          </Row>
                        </Box.Title>
                      </Box.Header>
                      <div className={isHoldCollectStyle}>
                        <Row gutter={16}>
                          {collectProjectsArr}
                        </Row>
                      </div>
                    </Box>
                  </div>
                </div>
              </div>
            </Col>
            <Col
              xxl={6}
              xl={6}
              lg={24}
              md={24}
              sm={24}
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
  searchProject: makeSelectSearchProject(),
  starUserList: makeSelectStarUserList(),
  collectProjects: makeSelectCollectProjects()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadProjects: () => dispatch(ProjectActions.loadProjects()),
    onStarProject: (id, resolve) => dispatch(ProjectActions.unStarProject(id, resolve)),
    onGetProjectStarUser: (id) => dispatch(ProjectActions.getProjectStarUser(id)),
    onLoadProjectDetail: (id) => dispatch(ProjectActions.loadProjectDetail(id)),
    onLoadOrganizations: () => dispatch(OrganizationActions.loadOrganizations()),
    onLoadCollectProjects: () => dispatch(ProjectActions.loadCollectProjects()),
    onClickCollectProjects: (formType, project, result) => dispatch(ProjectActions.clickCollectProjects(formType, project, result)),
    onAddProject: (project, resolve) => dispatch(ProjectActions.addProject(project, resolve)),
    onEditProject: (project, resolve) => dispatch(ProjectActions.editProject(project, resolve)),
    onTransferProject: (id, orgId) => dispatch(ProjectActions.transferProject(id, orgId)),
    onDeleteProject: (id, resolve) => dispatch(ProjectActions.deleteProject(id, resolve)),
    onSearchProject: (param) => dispatch(ProjectActions.searchProject(param)),
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withReducer = injectReducer({ key: 'project', reducer })
const withSaga = injectSaga({ key: 'project', saga })

const withOrganizationReducer = injectReducer({ key: 'organization', reducer: reducerOrganization })
const withOrganizationSaga = injectSaga({ key: 'organization', saga: sagaOrganization })

export default compose(
  withReducer,
  withOrganizationReducer,
  withSaga,
  withOrganizationSaga,
  withConnect
)(Projects)



