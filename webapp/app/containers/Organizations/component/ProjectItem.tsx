import * as React from 'react'
const styles = require('../Organization.less')
const Tag = require('antd/lib/tag')
const Icon = require('antd/lib/icon')
interface ITag {
  description: string
}
interface IprojectOptions {
  title: string
  desc: string
  tags: ITag[]
  stars: number
  updateTime: string
}
interface IProjectItemProps {
  options: IprojectOptions
}
export class ProjectItem extends React.PureComponent<IProjectItemProps> {
  public render () {
    const options = this.props.options
    const tags = options.tags.map((tg, index) => <Tag size="small" key={index}>{tg.description}</Tag>)
    return (
      <div className={styles.projectItemWrap}>
        <div className={styles.title}>{options.title}</div>
        <div className={styles.desc}>{options.desc}</div>
        <div className={styles.tag}>{tags}</div>
        <div className={styles.others}>
          <span className={styles.updateTime}>
            <span className={styles.label}>最后更新时间 </span>
            {options.updateTime}
          </span>
          <span className={styles.stars}>
            <Icon type="star-o"/>  {options.stars}
          </span>
        </div>
      </div>
    )
  }
}

export default ProjectItem



