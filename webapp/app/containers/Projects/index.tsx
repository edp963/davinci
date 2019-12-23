import React, { useMemo, useEffect, useState, ReactElement, useCallback, useRef, useImperativeHandle, useReducer } from 'react'
import * as classnames from 'classnames'
import { connect } from 'react-redux'
import { Row, Col, Tooltip, Popconfirm, Icon, Modal, Button } from 'antd'
const styles = require('../Organizations/Project.less')


import saga from './sagas'
import reducer from './reducer'
import { compose } from 'redux'
import { makeSelectLoginUser } from '../App/selectors'
import { makeSelectProjects, makeSelectSearchProject, makeSelectStarUserList, makeSelectCollectProjects } from './selectors'
import { ProjectActions } from './actions'
import injectReducer from 'utils/injectReducer'
import { createStructuredSelector } from 'reselect'

import injectSaga from 'utils/injectSaga'
import ProjectsForm from './component/ProjectForm'

import reducerOrganization from '../Organizations/reducer'
import {IOrganization} from '../Organizations/types'
import sagaOrganization from '../Organizations/sagas'
import { OrganizationActions } from '../Organizations/actions'
import { makeSelectOrganizations } from '../Organizations/selectors'
import { checkNameUniqueAction } from '../App/actions'
import ComponentPermission from '../Account/components/checkMemberPermission'
import Star from 'components/StarPanel/Star'
import HistoryStack from '../Organizations/component/historyStack'
const historyStack = new HistoryStack()
import { RouteComponentWithParams } from 'utils/types'
import { 
  IProject, IProjectFormFieldProps, IProjectsFormProps ,
  IProjectsProps, projectType, IProjectType, IToolbarProps,
  ItemToolbarProps, ITagProps, eTag, ItemProps, IContentProps
} from './types'
import { FormComponentProps } from 'antd/lib/form/Form'
import { uuid } from 'app/utils/util'



function enhanceInput(props, ref) {
  const inputRef = useRef(null)
  useImperativeHandle(ref, () => ({}))

  return <input
          {...props}
          ref = {inputRef}
        />
}

const EnhanceInput = React.forwardRef(enhanceInput)

const Toolbar: React.FC<IToolbarProps>  = React.memo(({ 
  pType, setPType, setKeywords, searchKeywords, showProForm
}) => {

  const searchRef = useRef(null)

  const checkoutType = useCallback((type) => {
    return () => {
      setPType && setPType(type)
    }
  }, [pType])

  const menus = useMemo(() => {
    const types = ['all', 'join', 'create', 'favorite', 'history']
  
    return types.map((t: IProjectType) => {
      const classNames = classnames({
        [styles.selectMenu] : pType === t
      })
      return (
        <p key={t} className={classNames} onClick={checkoutType(t)}>
          {projectType[t]}
        </p>
      )
    })
  }, [pType])

  const getKeywords = useCallback((e) => {
    setKeywords(e.target.value)
  }, [setKeywords])
  
  const addPro = useCallback((e) => {
    showProForm && showProForm('add',{}, e)
  }, [showProForm])


  return (
    <div className={styles.toolbar}>
      <div className={styles.menu}>
        {menus}
      </div>
      <div className={styles.searchs}>
        <EnhanceInput 
          type="text"
          ref={searchRef} 
          val={searchKeywords}
          onChange={getKeywords}
          placeholder="查找您的项目"
        />
        <span className={styles.searchButton}>
          <i className="iconfont icon-search"/>
        </span>
      </div>
      <div className={styles.create}>
        <Button icon="plus" type="primary" onClick={addPro}>创建</Button>
      </div>
    </div>
  )
})




const ItemToolbar: React.FC<ItemToolbarProps> = React.memo(({
  onStar, onTransfer, onEdit, onDelete, organization, isMimePro, 
  onFavorite, pType, isStar, isFavorite, StarCom
}) => {
  const CreateButton = useMemo(() => {
    return ComponentPermission(organization, '')(Icon)
  }, [organization])

  const isHistoryType = useMemo(() =>pType && pType === 'history', [pType])

  const { Favorite, Transfer, Edit, Delete} = useMemo(() => {

    const favoriteClassName = classnames({
      [styles.ft16]: true,
      [styles.mainColor]: isFavorite
    })
    
    const themeFavorite: string = isFavorite ? 'filled' : 'outlined'

    const Favorite = !isMimePro 
    ?   <Tooltip title="收藏">
          <Icon type="heart" theme={themeFavorite}  className={favoriteClassName} onClick={onFavorite} />
        </Tooltip>
    :   []

    const Transfer = ( 
      <Tooltip title="移交">
        <CreateButton type="swap"  className={styles.ft16} onClick={onTransfer} />
      </Tooltip>
    ) 
    
    const Edit = (
      <Tooltip title="编辑">
        <CreateButton type="form"  className={styles.ft16}  onClick={onEdit}/>
      </Tooltip>
    )

    const Delete = (
      <Popconfirm
        title="确定删除？"
        placement="bottom"
        onConfirm={onDelete}
      >
        <Tooltip title="删除">
          <CreateButton type="delete"  className={styles.ft16} onClick={stopPPG} />
        </Tooltip>
      </Popconfirm>
    )


    return {
      Edit,
      Favorite,
      Transfer,
      Delete
    }
  }, [onStar, onTransfer, onEdit, onDelete, isMimePro, onFavorite])

  return (
    <>
      <div className={styles.others}>
        {!isHistoryType ? Edit: ''}
        {Favorite}
        {!isHistoryType ? Transfer: ''}
        {!isHistoryType ? Delete: ''}
      </div>
      <div className={styles.stars}>
        {StarCom}
      </div>
    </>
  )
})

function stopPPG (e: React.MouseEvent<HTMLElement>)  {
  e && e.stopPropagation()
  return
}

const Tags: React.FC<ITagProps> = React.memo(({type}) => {
  const tags = useMemo(() => {
    return type.map((t) => {
      const tagClassName = classnames({
        [styles.tag]: true,
        [styles.create]: t === 'create',
        [styles.favorite]: t === 'favorite',
        [styles.join]: t === 'join'
      })
      return  <span key={eTag[t]} className={tagClassName}>{eTag[t]}</span>
    })
  }, [type])

  return (
    <>
      {tags}
    </>
  )
})




export const Items: React.FC<ItemProps & Partial<IProjectsProps>> = React.memo(({
  pro, userId, history, organizations, onLoadProjects, showProForm, pType, deletePro: deleteProject,
  favoritePro: favoriteProject, starUserList, onGetProjectStarUser, onStarProject,
}) => {

  const isMimePro = useMemo(() => {
    return !!(pro.createBy && pro.createBy.id === userId)
  }, [pro, userId])

  const isStar = useMemo(() => {
    return !!(pro && pro.isStar)
  }, [pro])

  const isFavorite = useMemo(() => {
    return !!(pro && pro.isFavorites)
  }, [pro])

  const getTagType = useMemo(() => {
    const tagType = []
    const isMime = isMimePro
    if (isMime) {
      tagType.push('create')
    } else {
      tagType.push('join')
    }

    if (pro.isFavorites) {
      tagType.push('favorite')
    }

    return tagType
    
  }, [pro])

  const starProject = useCallback((id) => () => {
    onStarProject(id, () => {
      onLoadProjects && onLoadProjects()
    })
  }, [pro, onLoadProjects])

  const getStarProjectUserList = useCallback((id) => () => {
    onGetProjectStarUser && onGetProjectStarUser(id)
  }, [pro, onGetProjectStarUser])

  const StarCom = useMemo(() => {
    const { id, starNum, isStar} = pro
      return <Star
                proId={id}
                starNum={starNum}
                isStar={isStar}
                starUser={starUserList} 
                unStar={starProject} 
                userList={getStarProjectUserList}
              />
  }, [pro, starProject, starUserList, getStarProjectUserList])
 

  const toProject = useCallback((e) => {
    history.push(`/project/${pro.id}`)
    saveHistory(pro)
  }, [pro])

  const saveHistory = useCallback((pro) => {
    historyStack.pushNode(pro)
  }, ['nf'])


  const editPro = useCallback((e: React.MouseEvent<HTMLElement>) => {
    stopPPG(e)
    showProForm && showProForm('edit', pro, e)
  }, [pro])

  const starPro = useCallback((e: React.MouseEvent<HTMLElement>) => {
    stopPPG(e)
  }, [pro])

  const deletePro = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const {id, isFavorites} = pro
    deleteProject && deleteProject(id, isFavorites)
    stopPPG(e)
  }, [pro])

  const transferPro = useCallback((e: React.MouseEvent<HTMLElement>) => {
    stopPPG(e)
    showProForm && showProForm('transfer', pro, e)
  }, [pro])

  const favoritePro = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const {id, isFavorites} = pro
    stopPPG(e)
    favoriteProject && favoriteProject(id, isFavorites)
  }, [pro])

  const currentOrganization: IOrganization = useMemo(() => {
    return organizations.find((org) => org.id === pro.orgId)
  }, [organizations, pro])

  return (
    <>
     <Col
        key={`pro${userId}orp`}
        xxl={4} xl={6} lg={6} md={8} sm={12} xs={24}
      >
        <div className={styles.unit}
          onClick={toProject}
        >
          <div 
            className={styles.thumbnail}
            style={{backgroundImage: `url(${require(`assets/images/bg${pro.pic}.png`)})`}}
          >
            <header>
              <div className={styles.tags}>
                <Tags type={getTagType}/>
              </div>
              <h3 className={styles.title}>
                {pro.name}
              </h3>
              <p className={styles.descs}>
                {pro.description}
              </p>
            </header>
          </div>
          <div className={styles.itemToolbar}>
            <ItemToolbar
              pType={pType}
              isStar={isStar}
              onEdit={editPro}
              onStar={starPro}
              StarCom={StarCom}
              onDelete={deletePro}
              isMimePro={isMimePro}
              isFavorite={isFavorite}
              onFavorite={favoritePro}
              onTransfer={transferPro}
              organization={currentOrganization}
            />
          </div>
        </div>
      </Col>
    </>
  )
})




const Content: React.FC<IContentProps & Partial<IProjectsProps>> = React.memo(({
  projects, organizations, userId, pType, searchKeywords, collectProjects, history, showProForm, deletePro,
  favoritePro, starUserList, onStarProject, onGetProjectStarUser, onLoadProjects
}) => {

  const NoProjects:ReactElement = useMemo(() => {
    return (
      <div className={styles.desc}>
        无项目
      </div>
    )
  }, [])

  const { proIdList } = historyStack.getAll()

  const favoriteProjectsId = useMemo(() => {
    return Array.isArray(collectProjects) && collectProjects.length > 0 && collectProjects.map((col) => col.id)
  }, [collectProjects])

  const getProjectsBySearch = useMemo(() => {

    function filterByKeyword(arr: IProject[]) {
      return Array.isArray(arr) && arr.filter((pro: IProject) => pro.name.toUpperCase().indexOf(searchKeywords.toUpperCase()) > -1 )
    }

    function filterByProjectType (arr: IProject[]) {
      if (Array.isArray(arr)) {
        switch (pType) {
          case 'create':
            return arr.filter((pro) => pro.createBy && pro.createBy.id === userId)
          case 'join':
            return arr.filter((pro) => pro.createBy && pro.createBy.id !== userId)
          case 'favorite':
            return arr.filter((pro) => pro.isFavorites) 
          case 'history':
            return arr.filter((pro) => proIdList.includes(pro.id))
          case 'all':
            return arr
          default:
            return []
        }
      }
    }

    function pushForkTagProjects (arr: IProject[]) {
      return Array.isArray(arr) ? arr.map((pro) => {
        return   favoriteProjectsId.includes && favoriteProjectsId.includes(pro.id) ? {...pro, isFavorites: true} : pro
      }) : []
    }

    return compose(filterByProjectType, filterByKeyword, pushForkTagProjects)(projects)
    
  }, [projects, pType, searchKeywords, userId])


  const ProjectItems:ReactElement[] = useMemo(() => {
    return Array.isArray(projects) ? getProjectsBySearch.map((pro: IProject, index) => {
      return  <Items
                key={`pro${index}orp`}
                pro={pro}
                userId={userId}
                pType={pType}
                deletePro={deletePro}
                favoritePro={favoritePro}
                history={history}
                showProForm={showProForm}
                organizations={organizations}
                starUserList={starUserList}
                onLoadProjects={onLoadProjects}
                onStarProject={onStarProject}
                onGetProjectStarUser={onGetProjectStarUser}
              />
      })
      : 
      []
    
  }, [ getProjectsBySearch, pType, projects, starUserList,
      onLoadProjects, onStarProject, onGetProjectStarUser,
      userId,organizations
    ])
  
  return (
    <div className={styles.content}>
      <div className={styles.flex}>
        {
          projects ? projects.length > 0 ? ProjectItems : NoProjects : ''
        }
      </div>
    </div>
  )
})




const Projects: React.FC<IProjectsProps & RouteComponentWithParams> = React.memo(({
  projects, onLoadProjects, onLoadOrganizations, organizations,
  loginUser, onLoadCollectProjects,collectProjects, history, onAddProject,
  onCheckUniqueName, onTransferProject, onDeleteProject, onClickCollectProjects,
  starUserList, onStarProject, onGetProjectStarUser, onEditProject
}) => {

  const [formKey, setFormKey] = useState(() => uuid(8, 16))
  const [projectType, setProjectType] = useState('all')

  const [formVisible, setFormVisible] = useState(false)

  const [formType, setFormType] = useState('add')

  const [currentPro, setCurrentPro] = useState({})

  const [modalLoading, setModalLoading] = useState(false)

  const [searchKeywords, setKeywords] = useState('')

  let proForm: FormComponentProps<IProjectFormFieldProps> = null

  useEffect(() => {
    onLoadProjects && onLoadProjects()
    onLoadOrganizations && onLoadOrganizations()
    onLoadCollectProjects && onLoadCollectProjects()
  }, ['nf'])

  useEffect(() => {
    if (projects) {
      historyStack.init(projects)
    }
  }, [projects])

  const loginUserId = useMemo(() => {
    return loginUser && loginUser.id
  }, [loginUser])

  const checkoutFormVisible = useCallback(() => {
    setFormVisible(true)
    
  }, [formVisible])

  const hideProForm = useCallback(() => {
    setFormVisible(false)
  }, [formVisible])

  const deletePro = useCallback((proId: number, isFavorite: boolean) => {
    onDeleteProject && onDeleteProject(proId, () => {
      if (isFavorite) {
        onLoadCollectProjects && onLoadCollectProjects()
      }
      onLoadProjects && onLoadProjects()
    })
  }, [formVisible])

  const favoritePro = useCallback((proId: number, isFavorite: boolean) => {
    onClickCollectProjects && onClickCollectProjects(isFavorite, proId, () => {
      onLoadCollectProjects && onLoadCollectProjects()
      onLoadProjects && onLoadProjects()
    })
  }, [formVisible])

  const showProForm = useCallback((formType, project: IProject, e: React.MouseEvent<HTMLElement>) => {
    stopPPG(e)
    setFormVisible(true)
    setCurrentPro(project)
    setFormType(formType)
  }, [formVisible, formType, currentPro])

  const onModalOk = useCallback(() => {
    proForm.form.validateFieldsAndScroll((err, values: IProjectFormFieldProps) => {
      if (!err) {
        setModalLoading(true)
        if (formType === 'add') {
          onAddProject({
            ...values,
            visibility: values.visibility === 'true' ? true : false,
            pic: `${Math.ceil(Math.random() * 19)}`
          }, () => {
            hideProForm()
            onLoadProjects()
            setModalLoading(false)
            const newFormKey = uuid(8, 16)
            setFormKey(newFormKey)
          })
        } else {
          onEditProject({...values, ...{orgId: Number(values.orgId)}}, () => {
            hideProForm()
            onLoadProjects()
            setModalLoading(false)
            const newFormKey = uuid(8, 16)
            setFormKey(newFormKey)
          })
        }
      }
    })
  }, [formVisible, formType, setFormKey])

  const onTransfer = useCallback(() => {
    proForm.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        setModalLoading(true)
        const {id, orgId} = values
        onTransferProject(id, Number(orgId))
        hideProForm()
        const newFormKey = uuid(8, 16)
        setFormKey(newFormKey)
      }
    })
  }, [formVisible, setFormKey])

  const checkNameUnique = useCallback((rule, value = '', callback) => {
    const fieldsValue = proForm.form.getFieldsValue()
    const {orgId, id} = fieldsValue
    onCheckUniqueName('project', {
      name: value,
      orgId,
      id
    },
      () => {
        callback()
      }, (err) => {
        callback(err)
      })
  }, [formVisible])
  
  return (
    <div className={styles.wrapper}>
      <Toolbar
        pType={projectType}
        showProForm={showProForm}
        setPType={setProjectType}
        setKeywords={setKeywords}
        searchKeywords={searchKeywords}
        setFormVisible={checkoutFormVisible}
      />
      <Content
        history={history}
        projects={projects}
        pType={projectType}
        userId={loginUserId}
        deletePro={deletePro}
        favoritePro={favoritePro}
        showProForm={showProForm}
        starUserList={starUserList}
        onStarProject={onStarProject}
        onLoadProjects={onLoadProjects}
        organizations={organizations}
        searchKeywords={searchKeywords}
        collectProjects={collectProjects}
        onGetProjectStarUser={onGetProjectStarUser}
      />
      <Modal
        title={null}
        footer={null}
        visible={formVisible}
        onCancel={hideProForm}
        key={`modal${formKey}key`}
      >
        <ProjectsForm
          key={`form${formKey}key`}
          type={formType}
          onModalOk={onModalOk}
          onTransfer={onTransfer}
          currentPro={currentPro}
          modalLoading={modalLoading}
          organizations={organizations}
          onCheckUniqueName={checkNameUnique}
          wrappedComponentRef = {(ref) => {proForm = ref}}
        />
      </Modal>
    </div>
  )
})

const mapStateToProps = createStructuredSelector({
  projects: makeSelectProjects(),
  loginUser: makeSelectLoginUser(),
  starUserList: makeSelectStarUserList(),
  organizations: makeSelectOrganizations(),
  searchProject: makeSelectSearchProject(),
  collectProjects: makeSelectCollectProjects()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadProjects: () => dispatch(ProjectActions.loadProjects()),
    onSearchProject: (param) => dispatch(ProjectActions.searchProject(param)),
    onLoadProjectDetail: (id) => dispatch(ProjectActions.loadProjectDetail(id)),
    onLoadCollectProjects: () => dispatch(ProjectActions.loadCollectProjects()),
    onLoadOrganizations: () => dispatch(OrganizationActions.loadOrganizations()),
    onGetProjectStarUser: (id) => dispatch(ProjectActions.getProjectStarUser(id)),
    onStarProject: (id, resolve) => dispatch(ProjectActions.unStarProject(id, resolve)),
    onTransferProject: (id, orgId) => dispatch(ProjectActions.transferProject(id, orgId)),
    onDeleteProject: (id, resolve) => dispatch(ProjectActions.deleteProject(id, resolve)),
    onAddProject: (project, resolve) => dispatch(ProjectActions.addProject(project, resolve)),
    onEditProject: (project, resolve) => dispatch(ProjectActions.editProject(project, resolve)),
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject)),
    onClickCollectProjects: (isFavorite, proId, result) => dispatch(ProjectActions.clickCollectProjects(isFavorite, proId, result))
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



