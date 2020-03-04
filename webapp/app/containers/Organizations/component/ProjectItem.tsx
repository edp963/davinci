import React from 'react'
import { IOrganization } from '../types'
const styles = require('../Organization.less')
import { Tag, Icon, Popconfirm, Tooltip } from 'antd'
import ComponentPermission from 'containers/Account/components/checkMemberPermission'
import Star from 'components/StarPanel/Star'
import { IProject, IStarUser } from 'containers/Projects/types'


interface IProjectItemProps {
  key: number
  pro: IProject,
  toProject: (id: number) => any
  loginUser: any
  deleteProject: (id: number) => any
  starUser: IStarUser[]
  collectProjects: IProject[]
  currentOrganization: IOrganization
  unStar?: (id: number) => any
  userList?: (id: number) => any
  showEditProjectForm: (type: string, option: any) => any
  onClickCollectProjects: (formType: string, project: object, resolve: (id: number) => any) => any
  onLoadCollectProjects: () => any
}

interface IPropsState {
  currentCollectProjectIds: any[],
  isDisableCollect: boolean
}

interface IProjectOptions {
  id: number
  name: string
  description: string
  createBy: number
  pic: string
  isLike: boolean
}

export class ProjectItem extends React.PureComponent<IProjectItemProps, IPropsState> {
  constructor (props) {
    super(props)
    this.state = {
      currentCollectProjectIds: [],
      isDisableCollect: false
    }
  }

  public componentWillReceiveProps (nextProps) {
    const { collectProjects } = nextProps
    this.setState({
      currentCollectProjectIds: collectProjects
      ? collectProjects.map((cp) => cp.id)
      : []
    })
  }

  private stopPPG = (e) => {
    e.stopPropagation()
  }

  private showProjectForm = (formType, option) => (e) => {
    this.stopPPG(e)
    this.props.showEditProjectForm(formType, option)
  }

  private collectProjectItem = (formType, option) => (e) => {
    const { onClickCollectProjects, collectProjects } = this.props
    this.stopPPG(e)
    const { currentCollectProjectIds } = this.state
    onClickCollectProjects(formType, option.id, () => {
      if (formType === 'collect') {
        currentCollectProjectIds.push(option.id)
        this.setState({
          currentCollectProjectIds,
          isDisableCollect: true
        })
      } else {
        this.setState({
          currentCollectProjectIds: currentCollectProjectIds.length !== 0
            ? currentCollectProjectIds.filter((item) => item !== option.id)
            : collectProjects.filter((cp) => cp.id !== option.id),
          isDisableCollect: false
        })
      }
    })
  }

  public render () {
    const { pro, loginUser, currentOrganization, starUser, collectProjects} = this.props
    const { currentCollectProjectIds } = this.state

    let currentCollectIds = []
    if (currentCollectProjectIds.length) {
      currentCollectIds = currentCollectProjectIds
    } else if (collectProjects) {
      currentCollectIds = collectProjects.map((cp) => cp.id)
    }

    const currentLoginUser = JSON.parse(localStorage.getItem('loginUser'))

    const tags = (<div className={styles.tag}>{pro.createBy.id === loginUser.id ? <Tag size="small" key="small">我创建的</Tag> : ''}</div>)
    let CreateButton = void 0
    if (currentOrganization) {
      CreateButton = ComponentPermission(currentOrganization, '')(Icon)
    }

   // const bg = require(`assets/images/bg${pro.pic}.png`)
    let StarPanel = void 0
    if (pro) {
      const { isStar, starNum, id} = pro
      StarPanel = <Star isStar={isStar} starNum={starNum} proId={id} starUser={starUser} unStar={this.props.unStar} userList={this.props.userList}/>
    }

    return (
      <div className={styles.projectItemWrap} onClick={this.props.toProject(pro.id)}>
        <div
          className={styles.avatarWrapper}
          style={{backgroundImage: `url(${require(`assets/images/bg${pro.pic}.png`)})`}}
        />
        <div className={styles.detailWrapper}>
          <div className={styles.titleWrapper} style={{ flex: 1 }}>
            <div className={styles.title}>{pro.name}</div>
            <div className={styles.desc}>{pro.description}</div>
          </div>
          {tags}
          <div className={styles.others}>
            {StarPanel}
            {
              (loginUser.id === pro.createBy.id)
                ? ''
                : (
                  <div className={styles.delete}>
                    {
                      currentCollectIds.indexOf(pro.id) < 0
                        ? (
                          <Tooltip title="收藏">
                            <i
                              className="iconfont icon-heart1"
                              onClick={this.collectProjectItem('collect', pro)}
                            />
                          </Tooltip>
                        )
                        : (
                          <Tooltip title="取消收藏">
                            <i
                              className="iconfont icon-heart"
                              onClick={this.collectProjectItem('unCollect', pro)}
                            />
                          </Tooltip>
                        )
                    }
                  </div>
                )
            }
            <div className={styles.delete}>
              <Tooltip title="设置">
                <CreateButton type="setting" onClick={this.showProjectForm('edit', pro)} />
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ProjectItem



