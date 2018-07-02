import * as React from 'react'
const Collapse = require('antd/lib/collapse')
const Tooltip = require('antd/lib/tooltip')
const Button = require('antd/lib/button')
const Select = require('antd/lib/select')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Modal = require('antd/lib/modal')
const Input = require('antd/lib/input')
const styles = require('../Team.less')
import PermissionLevel from './PermissionLevel'
import AddForm from './AddForm'
import {WrappedFormUtils} from 'antd/lib/form/Form'


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
interface IProjectListState {
  modalLoading: boolean,
  formType: string,
  formVisible: boolean
}
export class ProjectList extends React.Component<IProjectListProps, IProjectListState> {

  constructor (props) {
    super(props)
    this.state = {
      modalLoading: false,
      formType: '',
      formVisible: false
    }
  }
  private AddForm: WrappedFormUtils
  private showAddForm = (type: string) => (e) => {
    e.stopPropagation()
    this.setState({
      formType: type,
      formVisible: true
    })
  }
  private onSearchProject = () => {
    console.log(1)
  }
  private onSearchProjectType = () => {
    console.log(1)
  }

  private hideAddForm = () => {
    this.setState({
      formVisible: false
    })
  }

  private onModalOk = () => {

  }

  public render () {
    const { formVisible, formType, modalLoading} = this.state
    const addButton =  (
      <Tooltip placement="bottom" title="添加">
        <Button
          size="large"
          type="primary"
          icon="plus"
          onClick={this.showAddForm('project')}
        />
      </Tooltip>
    )
    const text = 'halo'
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
        <div style={{height: '24px'}}/>
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
        <Modal
          title={null}
          footer={null}
          visible={formVisible}
          onCancel={this.hideAddForm}
        >
          <AddForm
            type={formType}
            ref={(f) => { this.AddForm = f }}
          />
        </Modal>
      </div>
    )
  }
}

export default ProjectList

