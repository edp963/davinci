import * as React from 'react'
const Collapse = require('antd/lib/collapse')
const styles = require('../Team.less')
import PermissionLevel from './PermissionLevel'

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

interface IProjectListProps {
  projects: IprojectOptions
}

export class ProjectList extends React.Component<IProjectListProps, {}> {

  constructor (props) {
    super(props)
    this.state = {

    }
  }
  public render () {
    const text = 'halo'
    return (
      <div className={styles.listWrapper}>
        <Collapse defaultActiveKey={['1']}>
          <Collapse.Panel header="This is panel header 1" key="1">
            <PermissionLevel/>
          </Collapse.Panel>
          <Collapse.Panel header="This is panel header 2" key="2">
            <p>{text}</p>
          </Collapse.Panel>
          <Collapse.Panel header="This is panel header 3" key="3">
            <p>{text}</p>
          </Collapse.Panel>
        </Collapse>
      </div>
    )
  }
}

export default ProjectList

