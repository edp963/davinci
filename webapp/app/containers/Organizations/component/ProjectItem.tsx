import * as React from 'react'
import * as Organization from '../Organization'
const Modal = require('antd/lib/modal')
const Button = require('antd/lib/button')
const styles = require('../Organization.less')
const Tag = require('antd/lib/tag')
const Icon = require('antd/lib/icon')
const Popconfirm = require('antd/lib/popconfirm')
const Tooltip = require('antd/lib/tooltip')
import ComponentPermission from '../../Account/components/checkMemberPermission'
import Star from '../../../components/StarPanel/Star'
import {IProject, IStarUser} from '../../Projects'

interface IProjectItemProps {
  key: number
  options: Organization.IOrganizationProjects,
  toProject: (id: number) => any
  loginUser: any
  deleteProject: (id: number) => any
  starUser: IStarUser[]
  currentOrganization: Organization.IOrganization
  unStar?: (id: number) => any
  userList?: (id: number) => any
  showEditProjectForm: (type: string, option: any) => any
}

interface IProjectOptions {
  id: number
  name: string
  description: string
  createBy: number
  pic: string
  isLike: boolean
}

export class ProjectItem extends React.PureComponent<IProjectItemProps, {}> {
  private stopPPG = (e) => {
    e.stopPropagation()
  }

  private showProjectForm = (formType, option) => (e) => {
    this.stopPPG(e)
    this.props.showEditProjectForm(formType, option)
  }

  public render () {
    const {options, loginUser, currentOrganization, starUser} = this.props

    const tags = (<div className={styles.tag}>{options.createBy === loginUser.id ? <Tag size="small" key="small">我创建的</Tag> : ''}</div>)
    let CreateButton = void 0
    if (currentOrganization) {
      CreateButton = ComponentPermission(currentOrganization, '')(Icon)
    }
   // const bg = require(`../../assets/images/bg${options.pic}.png`)
    let StarPanel = void 0
    if (options) {
      StarPanel = <Star d={options} starUser={starUser} unStar={this.props.unStar} userList={this.props.userList}/>
    }
    return (
      <div className={styles.projectItemWrap} onClick={this.props.toProject(options.id)}>
        <div
          className={styles.avatarWrapper}
          style={{backgroundImage: `url(${require(`../../../assets/images/bg${options.pic || 9}.png`)})`}}
        />
        <div className={styles.detailWrapper}>
          <div className={styles.titleWrapper} style={{ flex: 1 }}>
            <div className={styles.title}>{options.name}</div>
            <div className={styles.desc}>{options.description}</div>
          </div>
          {tags}
          <div className={styles.others}>
            {StarPanel}
            <div className={styles.delete}>
            <Tooltip title="修改">
              <CreateButton type="setting" onClick={this.showProjectForm('edit', options)} />
            </Tooltip>
            </div>
            <div className={styles.delete}>
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
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ProjectItem



