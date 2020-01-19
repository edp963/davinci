/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import * as React from 'react'
import * as classnames from 'classnames'

import { Form, Row, Col, Table, Input, InputNumber, Select, Steps } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import { SortOrder } from 'antd/lib/table'
const FormItem = Form.Item
const Option = Select.Option
const Step = Steps.Step

import SearchFilterDropdown from 'components/SearchFilterDropdown'

const utilStyles = require('assets/less/util.less')
import { ICurrentDashboard } from '../'

interface IDashboardItemFormProps {
  type: string
  widgets: any[]
  selectedWidgets: number[]
  currentDashboard?: ICurrentDashboard
  polling: boolean,
  step: number
  onWidgetSelect: (selectedRowKeys: any[]) => void
  onPollingSelect: (val: string) => any
}

interface IDashboardItemFormStates {
  tableWidget: any[]
  filteredWidgets: any[]
  pageSize: number
  currentPage: number
  screenWidth: number
  nameFilterValue: string
  nameFilterDropdownVisible: boolean
  tableSortedInfo: {
    columnKey?: string,
    order?: SortOrder
  }
  selectedRowKeys: any[]
}

export class DashboardItemForm extends React.PureComponent<IDashboardItemFormProps & FormComponentProps, IDashboardItemFormStates> {

  constructor (props) {
    super(props)
    this.state = {
      filteredWidgets: [],
      pageSize: 24,
      currentPage: 1,
      screenWidth: 0,
      tableWidget: [],
      nameFilterValue: '',
      nameFilterDropdownVisible: false,
      tableSortedInfo: {},
      selectedRowKeys: []
    }
  }

  public componentWillMount () {
    const { widgets, currentDashboard } = this.props
    const dashboardType = currentDashboard.type
    let tableWidget
    if (dashboardType === 2) {  //
      tableWidget = widgets.filter((widget) => {
        console.log(widget.name)
        const widgetConfig = JSON.parse(widget.config)
        console.log(widgetConfig)
        return widgetConfig['selectedChart'] === 1 && widgetConfig['mode'] === 'chart'
      })
    } else {
      tableWidget = widgets
    }

    if (widgets) {
      this.setState({
        tableWidget: tableWidget.map((g) => {
          g.key = g.id
          return g
        })
      })
    }
  }

  public componentWillReceiveProps (nextProps) {
    window.addEventListener('resize', this.getScreenWidth, false)
  }

  public componentWillUnmount () {
    window.removeEventListener('resize', this.getScreenWidth, false)
  }

  private getScreenWidth = () => {
    this.setState({ screenWidth: document.documentElement.clientWidth })
  }

  private onSearchWidgetItem = (value) => {
    const valReg = new RegExp(value, 'i')
    this.setState({
      filteredWidgets: this.props.widgets.filter((i) => valReg.test(i.name)),
      currentPage: 1
    })
  }

  private onShowSizeChange = (currentPage, pageSize) => {
    this.setState({
      currentPage,
      pageSize
    })
  }

  private onReset = () => {
    this.setState({
      filteredWidgets: [],
      currentPage: 1
    })
  }

  private onSearchInputChange = (e) => {
    this.setState({
      nameFilterValue: e.target.value
    })
  }

  private onSearch = () => {
    const val = this.state.nameFilterValue
    const reg = new RegExp(val, 'gi')

    this.setState({
      nameFilterDropdownVisible: false,
      tableWidget: (this.props.widgets as any[]).map((record) => {
        const match = record.name.match(reg)
        if (!match) {
          return null
        }
        return {
          ...record,
          name: (
            <span>
              {record.name.split(reg).map((text, i) => (
                i > 0 ? [<span key={i} className={utilStyles.highlight}>{match[0]}</span>, text] : text
              ))}
            </span>
          )
        }
      }).filter((record) => !!record)
    })
  }

  private handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      tableSortedInfo: sorter
    })
  }

  private onSelectChange = (selectedRowKeys) => {
    this.setState({
      selectedRowKeys
    }, () => {
      this.props.onWidgetSelect(this.state.selectedRowKeys)
    })
  }

  public render () {
    const {
      widgets,
      type,
      form,
      selectedWidgets,
      polling,
      step,
      onWidgetSelect,
      onPollingSelect,
      currentDashboard
    } = this.props
    const {
      filteredWidgets,
      pageSize,
      currentPage,
      screenWidth,
      tableWidget,
      nameFilterValue,
      nameFilterDropdownVisible,
      tableSortedInfo,
      selectedRowKeys
    } = this.state
    const dashboardType = currentDashboard.type
    const columns = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      filterDropdown: (
        <SearchFilterDropdown
          placeholder="name"
          value={nameFilterValue}
          onChange={this.onSearchInputChange}
          onSearch={this.onSearch}
        />
      ),
      filterDropdownVisible: nameFilterDropdownVisible,
      onFilterDropdownVisibleChange: (visible) => this.setState({
        nameFilterDropdownVisible: visible
      }),
      sorter: (a, b) => a.name > b.name ? -1 : 1,
      sortOrder: tableSortedInfo.columnKey === 'name' ? tableSortedInfo.order : void 0
    }, {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    }]

    const pagination = {
      simple: screenWidth < 768 || screenWidth === 768,
      defaultPageSize: 20,
      showSizeChanger: true
    }

    const rowSelection = {
      selectedRowKeys: selectedWidgets,
      onChange: this.onSelectChange,
      onShowSizeChange: this.onShowSizeChange,
      type: dashboardType === 2 ? 'radio' : 'checkbox'
    }

    const stepIndicator = type === 'add'
      ? (
        <Steps current={step}>
          <Step title="Widget" />
          <Step title="数据更新" />
          <Step title="完成" />
        </Steps>
      )
      : ''

    const widgetsArr = filteredWidgets.length ? filteredWidgets : widgets

    const { getFieldDecorator } = form

    const selectWidgetStep = classnames({
      [utilStyles.hide]: !!step
    })

    const inputFormStep = classnames({
      [utilStyles.hide]: !step
    })

    const frequencyClass = classnames({
      [utilStyles.hide]: !polling
    })

    return (
      <Form>
        <Row className={utilStyles.formStepArea}>
          <Col span={24}>
            {stepIndicator}
          </Col>
        </Row>
        <Row gutter={20} className={selectWidgetStep}>
          <Table
            dataSource={tableWidget}
            columns={columns}
            pagination={pagination}
            onChange={this.handleTableChange}
            rowSelection={rowSelection}
          />
        </Row>
        <div className={inputFormStep}>
          <Row gutter={8}>
            <Col sm={8}>
              <FormItem className={utilStyles.hide}>
                {getFieldDecorator('id')(
                  <Input />
                )}
              </FormItem>
              <FormItem
                label="数据刷新模式"
                labelCol={{span: 10}}
                wrapperCol={{span: 14}}
              >
                {getFieldDecorator('polling', {
                  initialValue: polling ? 'true' : 'false'
                })(
                  <Select onSelect={onPollingSelect}>
                    <Option value="false">手动刷新</Option>
                    <Option value="true">定时刷新</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col sm={4} className={frequencyClass}>
              <FormItem
                label="时长"
                labelCol={{span: 12}}
                wrapperCol={{span: 12}}
              >
                {getFieldDecorator('frequency', {
                  rules: [{
                    required: true,
                    message: '不能为空'
                  }],
                  initialValue: 60
                })(
                  <InputNumber min={1} placeholder="秒" />
                )}
              </FormItem>
            </Col>
          </Row>
        </div>
      </Form>
    )
  }
}

export default Form.create<IDashboardItemFormProps & FormComponentProps>()(DashboardItemForm)
