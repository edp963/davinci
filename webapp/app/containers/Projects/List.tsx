/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import React, {
  useMemo,
  useEffect,
  useState,
  ReactElement,
  useCallback,
  useRef,
  useImperativeHandle
} from 'react'
import classnames from 'classnames'
import { connect } from 'react-redux'
import { Row, Col, Tooltip, Popconfirm, Icon, Modal, Button } from 'antd'
const styles = require('../Organizations/Project.less')

import saga from './sagas'
import reducer from './reducer'
import { compose } from 'redux'
import { makeSelectLoginUser } from '../App/selectors'
import {
  makeSelectProjects,
  makeSelectSearchProject,
  makeSelectStarUserList,
  makeSelectCollectProjects
} from './selectors'
import { ProjectActions } from './actions'
import injectReducer from 'utils/injectReducer'
import { createStructuredSelector } from 'reselect'

import injectSaga from 'utils/injectSaga'
import ProjectsForm from './component/ProjectForm'
import reducerOrganization from '../Organizations/reducer'
import { IOrganization } from '../Organizations/types'
import sagaOrganization from '../Organizations/sagas'
import { OrganizationActions } from '../Organizations/actions'
import { makeSelectOrganizations } from '../Organizations/selectors'
import { checkNameUniqueAction } from '../App/actions'
import ComponentPermission from '../Account/components/checkMemberPermission'
import Star from 'components/StarPanel/Star'
const StarUserModal = Star.StarUser
import HistoryStack from '../Organizations/component/historyStack'
const historyStack = new HistoryStack()
import { RouteComponentWithParams } from 'utils/types'
import {
  IProject,
  IProjectFormFieldProps,
  IProjectsProps,
  projectType,
  IProjectType,
  IToolbarProps,
  projectTypeSmall
} from './types'
import { FormComponentProps } from 'antd/lib/form/Form'
import { uuid } from 'app/utils/util'
import { useResize } from './hooks/useResize'
import ProjectItem from './component/ProjectItem'

function enhanceInput(props, ref) {
  const inputRef = useRef(null)
  useImperativeHandle(ref, () => ({}))

  return <input {...props} ref={inputRef} />
}

const EnhanceInput = React.forwardRef(enhanceInput)

const Toolbar: React.FC<IToolbarProps> = React.memo(
  ({ pType, setPType, setKeywords, searchKeywords, showProForm }) => {
    const searchRef = useRef(null)
    const documentWidth = useResize()

    const checkoutType = useCallback(
      (type) => {
        return () => {
          if (setPType) {
            setPType(type)
          }
        }
      },
      [pType]
    )

    const menus = useMemo(() => {
      const types = ['all', 'join', 'create', 'favorite', 'history']
      return types.map((t: IProjectType) => {
        const classNames = classnames({
          [styles.selectMenu]: pType === t,
          [styles.menuitem]: true
        })
        return (
          <p key={t} className={classNames} onClick={checkoutType(t)}>
            {documentWidth <= 1200 ? projectTypeSmall[t] : projectType[t]}
          </p>
        )
      })
    }, [pType, documentWidth])

    const getKeywords = useCallback(
      (e) => {
        setKeywords(e.target.value)
      },
      [setKeywords]
    )

    const addPro = useCallback(
      (e) => {
        if (showProForm) {
          showProForm('add', {}, e)
        }
      },
      [showProForm]
    )

    return (
      <div className={styles.toolbar}>
        <div className={styles.menu}>{menus}</div>
        <div className={styles.searchs}>
          <EnhanceInput
            type="text"
            ref={searchRef}
            val={searchKeywords}
            onChange={getKeywords}
            placeholder="查找您的项目"
          />
          <span className={styles.searchButton}>
            <i className="iconfont icon-search" />
          </span>
        </div>
        <div className={styles.create}>
          <Button icon="plus" type="primary" shape="round" onClick={addPro}>
            {documentWidth < 860 ? '' : '创建'}
          </Button>
        </div>
      </div>
    )
  }
)

function stopPPG(e: React.MouseEvent<HTMLElement>) {
  if (e) {
    e.stopPropagation()
  }
  return
}

const Projects: React.FC<
  IProjectsProps & RouteComponentWithParams
> = React.memo(
  ({
    projects,
    onLoadProjects,
    onLoadOrganizations,
    organizations,
    loginUser,
    onLoadCollectProjects,
    collectProjects,
    history,
    onAddProject,
    onCheckUniqueName,
    onTransferProject,
    onDeleteProject,
    onClickCollectProjects,
    starUserList,
    onStarProject,
    onGetProjectStarUser,
    onEditProject
  }) => {
    const [formKey, setFormKey] = useState(() => uuid(8, 16))
    const [projectType, setProjectType] = useState('all')

    const [formVisible, setFormVisible] = useState(false)

    const [formType, setFormType] = useState('add')

    const [currentPro, setCurrentPro] = useState({})

    const [modalLoading, setModalLoading] = useState(false)

    const [searchKeywords, setKeywords] = useState('')

    const [starModalVisble, setStarModalVisble] = useState(false)

    const onCloseStarModal = useCallback(() => {
      setStarModalVisble(false)
    }, [starModalVisble])

    const getStarProjectUserList = useCallback(
      (id) => () => {
        if (onGetProjectStarUser) {
          onGetProjectStarUser(id)
        }
        setStarModalVisble(true)
      },
      [setStarModalVisble, onGetProjectStarUser]
    )

    let proForm: FormComponentProps<IProjectFormFieldProps> = null

    useEffect(() => {
      if (onLoadProjects) {
        onLoadProjects()
      }
      if (onLoadOrganizations) {
        onLoadOrganizations()
      }
      if (onLoadCollectProjects) {
        onLoadCollectProjects()
      }
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

    const deletePro = useCallback(
      (proId: number, isFavorite: boolean) => {
        if (onDeleteProject) {
          onDeleteProject(proId, () => {
            if (isFavorite) {
              if (onLoadCollectProjects) {
                onLoadCollectProjects()
              }
            }
            if (onLoadProjects) {
              onLoadProjects()
            }
          })
        }
      },
      [formVisible]
    )

    const favoritePro = useCallback(
      (proId: number, isFavorite: boolean) => {
        if (onClickCollectProjects) {
          onClickCollectProjects(isFavorite, proId, () => {
            if (onLoadCollectProjects) {
              onLoadCollectProjects()
            }
            if (onLoadProjects) {
              onLoadProjects()
            }
          })
        }
      },
      [formVisible]
    )

    const showProForm = useCallback(
      (formType, project: IProject, e: React.MouseEvent<HTMLElement>) => {
        stopPPG(e)
        setFormVisible(true)
        setCurrentPro(project)
        setFormType(formType)
      },
      [formVisible, formType, currentPro]
    )

    const onModalOk = useCallback(() => {
      proForm.form.validateFieldsAndScroll(
        (err, values: IProjectFormFieldProps) => {
          if (!err) {
            setModalLoading(true)
            if (formType === 'add') {
              onAddProject(
                {
                  ...values,
                  visibility: values.visibility === 'true' ? true : false,
                  pic: `${Math.ceil(Math.random() * 19)}`
                },
                () => {
                  hideProForm()
                  onLoadProjects()
                  setModalLoading(false)
                  const newFormKey = uuid(8, 16)
                  setFormKey(newFormKey)
                }
              )
            } else {
              onEditProject(
                { ...values, ...{ orgId: Number(values.orgId) } },
                () => {
                  hideProForm()
                  onLoadProjects()
                  setModalLoading(false)
                  const newFormKey = uuid(8, 16)
                  setFormKey(newFormKey)
                }
              )
            }
          }
        }
      )
    }, [formVisible, formType, setFormKey])

    const onTransfer = useCallback(() => {
      proForm.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          setModalLoading(true)
          const { id, orgId } = values
          onTransferProject(id, Number(orgId))
          hideProForm()
          const newFormKey = uuid(8, 16)
          setFormKey(newFormKey)
        }
      })
    }, [formVisible, setFormKey])

    const checkNameUnique = useCallback(
      (rule, value = '', callback) => {
        const fieldsValue = proForm.form.getFieldsValue()
        const { orgId, id } = fieldsValue
        onCheckUniqueName(
          'project',
          {
            name: value,
            orgId,
            id
          },
          () => {
            callback()
          },
          (err) => {
            callback(err)
          }
        )
      },
      [formVisible]
    )

    const getProjectsBySearch = useMemo(() => {
      const { proIdList } = historyStack.getAll()
      function filterByKeyword(arr: IProject[]) {
        return (
          Array.isArray(arr) &&
          arr.filter(
            (pro: IProject) =>
              pro.name.toUpperCase().indexOf(searchKeywords.toUpperCase()) > -1
          )
        )
      }

      function filterByProjectType (arr: IProject[]) {
        if (Array.isArray(arr)) {
          switch (projectType) {
            case 'create':
              return arr.filter(
                (pro) => pro.createBy && pro.createBy.id === loginUserId
              )
            case 'join':
              return arr.filter(
                (pro) => pro.createBy && pro.createBy.id !== loginUserId
              )
            case 'favorite':
              return arr.filter((pro) => pro.isFavorites)
            case 'history':
              return proIdList.reduce((iteratee, pid) => {
                const pl = arr.find((pro) => pro.id === pid)
                if (pl) {iteratee.push(pl) }
                return iteratee
              }, [])
            case 'all':
              return arr
            default:
              return []
          }
        }
      }

      function pushForkTagProjects(arr: IProject[]) {
        const favoriteProjectsId =
          Array.isArray(collectProjects) &&
          collectProjects.length > 0 &&
          collectProjects.map((col) => col.id)
        return Array.isArray(arr)
          ? arr.map((pro) => {
              return favoriteProjectsId.includes &&
                favoriteProjectsId.includes(pro.id)
                ? { ...pro, isFavorites: true }
                : pro
            })
          : []
      }

      return compose(
        filterByProjectType,
        filterByKeyword,
        pushForkTagProjects
      )(projects)

    }, [projects, projectType, searchKeywords, loginUserId, collectProjects])

    const ProjectItems: ReactElement[] = useMemo(() => {
      const items = Array.isArray(projects)
        ? getProjectsBySearch.map((pro: IProject, index) => {
            const {
              pic,
              name,
              description,
              createBy,
              isStar,
              isFavorites,
              id,
              starNum,
              orgId
            } = pro

            const isMimePro = !!(createBy && createBy.id === loginUserId)

            const getTagType = (function (mime, favorite) {
              const tagType = []

              if (mime) {
                tagType.push({
                  text: '创建',
                  color: '#108EE9'
                })
              } else {
                tagType.push({
                  text: '参与',
                  color: '#FA8C15'
                })
              }
              return tagType
            })(isMimePro, isFavorites)

            const starProject = (id) => () => {
              onStarProject(id, () => {
                if (onLoadProjects) {
                  onLoadProjects()
                }
              })
            }

            const toProject = () => {
              history.push(`/project/${id}`)
              saveHistory(pro)
            }

            const saveHistory = (pro) => historyStack.pushNode(pro)

            const currentOrganization: IOrganization = organizations.find(
              (org) => org.id === orgId
            )

            const CreateButton = ComponentPermission(
              currentOrganization,
              ''
            )(Icon)

            const isHistoryType = !!(projectType && projectType === 'history')

            const favoriteProject = (e: React.MouseEvent<HTMLElement>) => {
              const { id, isFavorites } = pro
              stopPPG(e)
              if (favoritePro) {
                favoritePro(id, isFavorites)
              }
            }

            const transferPro = (e: React.MouseEvent<HTMLElement>) => {
              stopPPG(e)
              if (showProForm) {
                showProForm('transfer', pro, e)
              }
            }

            const editPro = (e: React.MouseEvent<HTMLElement>) => {
              stopPPG(e)
              if (showProForm) {
                showProForm('edit', pro, e)
              }
            }

            const deleteProject = (e: React.MouseEvent<HTMLElement>) => {
              const { id, isFavorites } = pro
              if (deletePro) {
                deletePro(id, isFavorites)
              }
              stopPPG(e)
            }

            const { Favorite, Transfer, Edit, Delete } = (function () {
              const favoriteClassName = classnames({
                [styles.ft16]: true,
                [styles.mainColor]: isFavorites
              })

              const themeFavorite = isFavorites ? 'filled' : 'outlined'

              const Favorite = !isMimePro ? (
                <Tooltip title="收藏">
                  <Icon
                    type="heart"
                    theme={themeFavorite}
                    className={favoriteClassName}
                    onClick={favoriteProject}
                  />
                </Tooltip>
              ) : (
                []
              )

              const Transfer = (
                <Tooltip title="移交">
                  <CreateButton
                    type="swap"
                    className={styles.ft16}
                    onClick={transferPro}
                  />
                </Tooltip>
              )

              const Edit = (
                <Tooltip title="编辑">
                  <CreateButton
                    type="form"
                    className={styles.ft16}
                    onClick={editPro}
                  />
                </Tooltip>
              )

              const Delete = (
                <Popconfirm
                  title="确定删除？"
                  placement="bottom"
                  onCancel={stopPPG}
                  onConfirm={deleteProject}
                >
                  <Tooltip title="删除">
                    <CreateButton
                      type="delete"
                      className={styles.ft16}
                      onClick={stopPPG}
                    />
                  </Tooltip>
                </Popconfirm>
              )

              return {
                Edit,
                Favorite,
                Transfer,
                Delete
              }
            })()

            return (
              <Col
                key={`pro${name}${uuid(8, 16)}orp${description}`}
                xxl={4}
                xl={6}
                lg={6}
                md={8}
                sm={12}
                xs={24}
              >
                <ProjectItem
                  title={name}
                  tags={getTagType}
                  onClick={toProject}
                  description={description}
                  key={`projectItem${uuid}`}
                  backgroundImg={`url(${require(`assets/images/bg${pic}.png`)})`}
                >
                  <div className={styles.others}>
                    {!isHistoryType ? Edit : ''}
                    {Favorite}
                    {!isHistoryType ? Transfer : ''}
                    {!isHistoryType ? Delete : ''}
                  </div>
                  <div className={styles.stars}>
                    <Star
                      proId={id}
                      starNum={starNum}
                      isStar={isStar}
                      unStar={starProject}
                      userList={getStarProjectUserList}
                    />
                  </div>
                </ProjectItem>
              </Col>
            )
          })
        : []

      return items
    }, [
      getProjectsBySearch,
      projectType,
      projects,
      onLoadProjects,
      onStarProject,
      onGetProjectStarUser,
      loginUserId,
      organizations
    ])

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
        <div className={styles.content}>
          {projects ? (
            projects.length > 0 ? (
              <div className={styles.flex}>{ProjectItems}</div>
            ) : (
              <div className={styles.noprojects}>
                <p className={styles.desc}>无项目</p>
              </div>
            )
          ) : (
            ''
          )}
        </div>
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
            wrappedComponentRef={(ref) => {
              proForm = ref
            }}
          />
        </Modal>
        <StarUserModal
          visible={starModalVisble}
          starUser={starUserList}
          closeUserListModal={onCloseStarModal}
        />
      </div>
    )
  }
)

const mapStateToProps = createStructuredSelector({
  projects: makeSelectProjects(),
  loginUser: makeSelectLoginUser(),
  starUserList: makeSelectStarUserList(),
  organizations: makeSelectOrganizations(),
  searchProject: makeSelectSearchProject(),
  collectProjects: makeSelectCollectProjects()
})

export function mapDispatchToProps(dispatch) {
  return {
    onLoadProjects: () => dispatch(ProjectActions.loadProjects()),
    onSearchProject: (param) => dispatch(ProjectActions.searchProject(param)),
    onLoadProjectDetail: (id) => dispatch(ProjectActions.loadProjectDetail(id)),
    onLoadCollectProjects: () => dispatch(ProjectActions.loadCollectProjects()),
    onLoadOrganizations: () =>
      dispatch(OrganizationActions.loadOrganizations()),
    onGetProjectStarUser: (id) =>
      dispatch(ProjectActions.getProjectStarUser(id)),
    onStarProject: (id, resolve) =>
      dispatch(ProjectActions.unStarProject(id, resolve)),
    onTransferProject: (id, orgId) =>
      dispatch(ProjectActions.transferProject(id, orgId)),
    onDeleteProject: (id, resolve) =>
      dispatch(ProjectActions.deleteProject(id, resolve)),
    onAddProject: (project, resolve) =>
      dispatch(ProjectActions.addProject(project, resolve)),
    onEditProject: (project, resolve) =>
      dispatch(ProjectActions.editProject(project, resolve)),
    onCheckUniqueName: (pathname, data, resolve, reject) =>
      dispatch(checkNameUniqueAction(pathname, data, resolve, reject)),
    onClickCollectProjects: (isFavorite, proId, result) =>
      dispatch(ProjectActions.clickCollectProjects(isFavorite, proId, result))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'project', reducer })
const withSaga = injectSaga({ key: 'project', saga })
const withOrganizationReducer = injectReducer({
  key: 'organization',
  reducer: reducerOrganization
})
const withOrganizationSaga = injectSaga({
  key: 'organization',
  saga: sagaOrganization
})

export default compose(
  withReducer,
  withOrganizationReducer,
  withSaga,
  withOrganizationSaga,
  withConnect
)(Projects)
