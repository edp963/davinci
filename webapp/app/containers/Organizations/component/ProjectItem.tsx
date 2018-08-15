import * as React from 'react'
import {IOrganization} from '../Organization'
const Button = require('antd/lib/button')
const styles = require('../Organization.less')
const Tag = require('antd/lib/tag')
const Icon = require('antd/lib/icon')
const Popconfirm = require('antd/lib/popconfirm')
const Tooltip = require('antd/lib/tooltip')
import ComponentPermission from '../../Account/components/checkMemberPermission'

interface IProjectItemProps {
  key: number
  options: IProjectOptions
  toProject: (id: number) => any
  loginUser: any
  deleteProject: (id: number) => any
  currentOrganization: IOrganization
}
interface IProjectOptions {
  id: number
  name: string
  description: string
  createBy: number
  pic: string
}
export class ProjectItem extends React.PureComponent<IProjectItemProps> {
  public render () {
    const {options, loginUser, currentOrganization} = this.props
    const tags = (<div className={styles.tag}>{options.createBy === loginUser.id ? <Tag size="small" key="small">我创建的</Tag> : ''}</div>)
    let CreateButton = void 0
    if (currentOrganization) {
      CreateButton = ComponentPermission(currentOrganization, '')(Icon)
    }
   // const bg = require(`../../assets/images/bg${options.pic}.png`)
    return (
      <div className={styles.projectItemWrap}>
        <div
          className={styles.avatarWrapper}
          style={{backgroundImage: `url(${require(`../../../assets/images/bg8.png`)})`}}
        />
        <div className={styles.detailWrapper}>
          <div className={styles.titleWrapper}>
            <div className={styles.title} onClick={this.props.toProject(options.id)}>{options.name}</div>
          </div>
          <div className={styles.desc}>{options.description}</div>
          {tags}
          <div className={styles.others}>
            <span className={styles.updateTime}>
              <span className={styles.label}>最后更新时间 </span>
              2018-8-16
            </span>
            <span className={styles.stars}>
              <Icon type="star-o"/>  34
            </span>
            <div className={styles.delete}>
              <Popconfirm
                title="确定删除？"
                placement="bottom"
                onConfirm={this.props.deleteProject(options.id)}
              >
                <Tooltip title="删除">
                  <CreateButton
                    type="delete"
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



