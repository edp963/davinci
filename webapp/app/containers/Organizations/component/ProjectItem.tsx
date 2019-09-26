import * as React from 'react'
import * as Organization from '../Organization'
const styles = require('../Organization.less')
import { Tag, Icon, Popconfirm, Tooltip } from 'antd'
import ComponentPermission from 'containers/Account/components/checkMemberPermission'
import Star from 'components/StarPanel/Star'
import { IProject, IStarUser } from 'containers/Projects'

interface IProjectItemProps {
  key: number
  options: Organization.IOrganizationProjects,
  toProject: (id: number) => any
  loginUser: any
  deleteProject: (id: number) => any
  starUser: IStarUser[]
  collectProjects: IProject[]
  currentOrganization: Organization.IOrganization
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
    onClickCollectProjects(formType, option, () => {
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
    const { options, loginUser, currentOrganization, starUser, collectProjects} = this.props
    const { currentCollectProjectIds } = this.state

    let currentCollectIds = []
    if (currentCollectProjectIds.length) {
      currentCollectIds = currentCollectProjectIds
    } else if (collectProjects) {
      currentCollectIds = collectProjects.map((cp) => cp.id)
    }

    const currentLoginUser = JSON.parse(localStorage.getItem('loginUser'))

    const tags = (<div className={styles.tag}>{options.createBy === loginUser.id ? <Tag size="small" key="small">我创建的</Tag> : ''}</div>)
    let CreateButton = void 0
    if (currentOrganization) {
      CreateButton = ComponentPermission(currentOrganization, '')(Icon)
    }

   // const bg = require(`assets/images/bg${options.pic}.png`)
    let StarPanel = void 0
    if (options) {
      StarPanel = <Star d={options} starUser={starUser} unStar={this.props.unStar} userList={this.props.userList}/>
    }

    return (
      <div className={styles.projectItemWrap} onClick={this.props.toProject(options.id)}>
        <div
          className={styles.avatarWrapper}
          style={{backgroundImage: `url(${require(`assets/images/bg${options.pic}.png`)})`}}
        />
        <div className={styles.detailWrapper}>
          <div className={styles.titleWrapper} style={{ flex: 1 }}>
            <div className={styles.title}>{options.name}</div>
            <div className={styles.desc}>{options.description}</div>
          </div>
          {tags}
          <div className={styles.others}>
            {StarPanel}
            {
              (loginUser.id === options.createBy.id)
                ? ''
                : (
                  <div className={styles.delete}>
                    {
                      currentCollectIds.indexOf(options.id) < 0
                        ? (
                          <Tooltip title="收藏">
                            <i
                              className="iconfont icon-heart1"
                              onClick={this.collectProjectItem('collect', options)}
                            />
                          </Tooltip>
                        )
                        : (
                          <Tooltip title="取消收藏">
                            <i
                              className="iconfont icon-heart"
                              onClick={this.collectProjectItem('unCollect', options)}
                            />
                          </Tooltip>
                        )
                    }
                  </div>
                )
            }
            <div className={styles.delete}>
              <Tooltip title="设置">
                <CreateButton type="setting" onClick={this.showProjectForm('edit', options)} />
              </Tooltip>
            </div>
            {/* <div className={styles.delete}>
              <Popconfirm
                title="确定删除？"
                placement="bottom"
                onConfirm={this.props.deleteProject(options.id)}
              >
                <Tooltip title="删除">
                  <CreateButton
                    type="delete"
                    onClick={this.stopPPG}
                  />
                </Tooltip>
              </Popconfirm>
            </div> */}
          </div>
        </div>
      </div>
    )
  }
}

export default ProjectItem



