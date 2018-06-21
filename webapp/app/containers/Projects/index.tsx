import * as React from 'react'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Tooltip = require('antd/lib/tooltip')
const Popconfirm = require('antd/lib/popconfirm')
const Icon = require('antd/lib/icon')
const styles = require('./Project.less')
import * as classnames from 'classnames'
const projectArr = [{
  id : 1,
  publish: true,
  pic: 7,
  name: '演示文档',
  desc: 'ssssss'
}, {
  id : 2,
  publish: true,
  pic: 6,
  name: '演示文档',
  desc: 'ssssss'
}, {
  id : 3,
  publish: true,
  pic: 2,
  name: '演示文档',
  desc: 'ssssss'
}, {
  id : 4,
  publish: true,
  pic: 1,
  name: '演示文档',
  desc: 'ssssss'
}, {
  id : 5,
  publish: true,
  pic: 3,
  name: '演示文档',
  desc: 'ssssss'
}, {
  id: 'add',
  type: 'add'
}]
interface IProjectsProps {
  router: any
}
export class Projects extends React.PureComponent<IProjectsProps, {}> {
  constructor (props) {
    super(props)
  }
  private showProjectForm = (type: string, d: any) => () => {
    console.log('show')
    console.log(type, d)
  }
  private onDeleteProject = (id: number) => () => {
    console.log(id)
  }
  private toProject = (d: any) => () => {
    const pid = d.id
    this.props.router.push(`/project/${pid}`)
  }
  // private toGrid = (dashboard) => () => {
  //   this.props.router.push(`/report/dashboard/${dashboard.id}`)
  // }
  public render () {
    const projectItems = projectArr
      ? projectArr.map((d) => {
        if (d.type && d.type === 'add') {
          return (
            <Col
              key={d.id}
              xl={6}
              lg={6}
              md={8}
              sm={12}
              xs={24}
            >
              <div
                className={styles.unit}
                onClick={this.toProject(d)}
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
        let editButton = void 0
        let deleteButton = void 0
        editButton =  (
          <Tooltip title="编辑">
            <Icon className={styles.edit} type="setting" onClick={this.showProjectForm('edit', d)} />
          </Tooltip>
        )
        deleteButton = (
          <Popconfirm
            title="确定删除？"
            placement="bottom"
            onConfirm={this.onDeleteProject(d.id)}
          >
            <Tooltip title="删除">
              <Icon className={styles.delete} type="delete" />
            </Tooltip>
          </Popconfirm>
        )

        const itemClass = classnames({
          [styles.unit]: true,
          [styles.editing]: !d.publish
        })

        const editHint = !d.publish && '(编辑中…)'
        const colItems = (
            <Col
              key={d.id}
              xl={6}
              lg={6}
              md={8}
              sm={12}
              xs={24}
            >
              <div
                className={itemClass}
                style={{backgroundImage: `url(${require(`../../assets/images/bg${d.pic}.png`)})`}}
                onClick={this.toProject(d)}
              >
                <header>
                  <h3 className={styles.title}>
                    {d.name} {editHint}
                  </h3>
                  <p className={styles.content}>
                    {d.desc}
                  </p>
                </header>
                {editButton}
                {deleteButton}
              </div>
            </Col>
          )
        return colItems
      }) : ''

    return (
      <div className={styles.wrap}>
        <div className={styles.container}>
          <Row>
            <Col xl={18} lg={18} md={16} sm={12} xs={24}>
              <div className={styles.header}>我的项目</div>
            </Col>
          </Row>
          <Row gutter={20}>
            {projectItems}
          </Row>
        </div>
      </div>
    )
  }
}

export default Projects


