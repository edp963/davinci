import * as React from 'react'
const Button = require('antd/lib/button')
const styles = require('../Organization.less')
const Tag = require('antd/lib/tag')
const Icon = require('antd/lib/icon')
const Popconfirm = require('antd/lib/popconfirm')
const Tooltip = require('antd/lib/tooltip')


interface IprojectOptions {
  id: number
  name: string
  description: string
  createBy: number
 // stars: number
 // updateTime: string
}
interface IProjectItemProps {
  key: number
  options: IprojectOptions
  toProject: (id: number) => any
  loginUser: any
  deleteProject: (id: number) => any
}
export class ProjectItem extends React.PureComponent<IProjectItemProps> {
  public render () {
    const {options, loginUser} = this.props
    const tags = (<div className={styles.tag}><Tag size="small" key="small">{options.createBy === loginUser.id ? '我' : options.createBy}创建的</Tag></div>)
    return (
      <div className={styles.projectItemWrap}>
        <div className={styles.titleWrapper}>
          <div className={styles.title} onClick={this.props.toProject(options.id)}>{options.name}</div>
          <div className={styles.delete}>
            <Popconfirm
              title="确定删除？"
              placement="bottom"
              onConfirm={this.props.deleteProject(options.id)}
            >
              <Tooltip title="删除">
                <Button shape="circle"><Icon type="close"/></Button>
              </Tooltip>
            </Popconfirm>
          </div>
        </div>
        <div className={styles.desc}>{options.description}</div>
        {tags}
        {/*<div className={styles.others}>*/}
          {/*<span className={styles.updateTime}>*/}
            {/*<span className={styles.label}>最后更新时间 </span>*/}
            {/*{options.updateTime}*/}
          {/*</span>*/}
          {/*<span className={styles.stars}>*/}
            {/*<Icon type="star-o"/>  {options.stars}*/}
          {/*</span>*/}
        {/*</div>*/}
      </div>
    )
  }
}

export default ProjectItem



