import * as React from 'react'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Tooltip = require('antd/lib/tooltip')
const Button = require('antd/lib/button')
const Input = require('antd/lib/input')
const styles = require('../Organization.less')
const Select = require('antd/lib/select')
import ProjectItem from './ProjectItem'

export class ProjectList extends React.PureComponent {
  private showProjectForm = (type: string) => () => {
    console.log(type)
  }
  private onSearchProject = () => {
    console.log(1)
  }
  private onSearchProjectType = () => {
    console.log(1)
  }
  public render () {
    const addButton =  (
          <Tooltip placement="bottom" title="新增">
            <Button
              size="large"
              type="primary"
              icon="plus"
              onClick={this.showProjectForm('add')}
            />
          </Tooltip>
      )
    const projectLists = [
      {
        title: 'davinci',
        desc: 'Wormhole is a SPaaS (Stream Processing as a Service) Platform',
        tags: [{description: '我创建的'}, {description: '我收藏的'}],
        stars : 170,
        updateTime: '2018-06-13'
      }
    ]
    const ProjectItems = projectLists.map((lists, index) => (
      <ProjectItem
        key={index}
        options={lists}
      />
    ))
    return (
      <div className={styles.listWrapper}>
        <Row>
          <Col span={4}>
            <Select
              size="large"
              placeholder="placeholder"
              onChange={this.onSearchProjectType}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="rmb">我收藏的</Select.Option>
              <Select.Option value="dollar">Dollar</Select.Option>
            </Select>
          </Col>
          <Col span={16} offset={1}>
            <Input.Search
              size="large"
              placeholder="Dashboard 名称"
              onSearch={this.onSearchProject}
            />
          </Col>
          <Col span={1} offset={2}>
            {addButton}
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            {ProjectItems}
          </Col>
        </Row>
      </div>
    )
  }
}

export default ProjectList

