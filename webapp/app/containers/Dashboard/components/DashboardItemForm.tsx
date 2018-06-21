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

const Form = require('antd/lib/form')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Input = require('antd/lib/input')
const InputNumber = require('antd/lib/input-number')
const Select = require('antd/lib/select')
const Icon = require('antd/lib/icon')
const Steps = require('antd/lib/steps')
const Pagination = require('antd/lib/pagination')
const FormItem = Form.Item
const Option = Select.Option
const Step = Steps.Step
const Search = Input.Search
import { WrappedFormUtils } from 'antd/lib/form/Form'

import { iconMapping } from '../../Widget/components/chartUtil'

const utilStyles = require('../../../assets/less/util.less')
const widgetStyles = require('../../Widget/Widget.less')
const styles = require('../Dashboard.less')

interface IDashboardItemFormProps {
  form: WrappedFormUtils
  type: string
  widgets: any[]
  selectedWidget: number
  loginUser: { id: number, admin: boolean }
  triggerType: string,
  step: number
  onWidgetSelect: (id: number) => void
  onTriggerTypeSelect: () => any
}

interface IDashboardItemFormStates {
  triggerType: string
  authorizedWidgets: any[]
  filteredWidgets: any[]
  pageSize: number
  currentPage: number
  screenWidth: number
}

export class DashboardItemForm extends React.PureComponent<IDashboardItemFormProps, IDashboardItemFormStates> {

  constructor (props) {
    super(props)
    this.state = {
      triggerType: 'manual',
      authorizedWidgets: [],
      filteredWidgets: [],
      pageSize: 24,
      currentPage: 1,
      screenWidth: 0
    }
  }

  public componentDidMount () {
    const {
      widgets
    } = this.props
    if (widgets.length > 0) {
      this.setAuthorizedWidgets(this.props.widgets)
    }
  }

  public componentWillReceiveProps (nextProps) {
    const { widgets, loginUser } = this.props
    if (nextProps.widgets !== widgets) {
      this.setAuthorizedWidgets(nextProps.widgets)
    }
    window.addEventListener('resize', this.getScreenWidth, false)
  }

  public componentWillUnmount () {
    window.removeEventListener('resize', this.getScreenWidth, false)
  }

  private setAuthorizedWidgets = (widgets) => {
    const { loginUser } = this.props
    if (loginUser.admin) {
      this.setState({
        authorizedWidgets: widgets.filter((widget) => widget['create_by'] === loginUser.id)
      })
    }
  }

  private getScreenWidth = () => {
    this.setState({ screenWidth: document.documentElement.clientWidth })
  }

  private onSearchWidgetItem = (value) => {
    const valReg = new RegExp(value, 'i')
    this.setState({
      filteredWidgets: this.state.authorizedWidgets.filter((i) => valReg.test(i.name)),
      currentPage: 1
    })
  }

  private onChange = (page) => {
    this.setState({
      currentPage: page
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

  public render () {
    const {
      type,
      form,
      widgets,
      selectedWidget,
      triggerType,
      step,
      loginUser,
      onWidgetSelect,
      onTriggerTypeSelect
    } = this.props

    const {
      authorizedWidgets,
      filteredWidgets,
      pageSize,
      currentPage,
      screenWidth
    } = this.state

    const widgetsArr = filteredWidgets.length ? filteredWidgets : authorizedWidgets

    const { getFieldDecorator } = form

    const widgetSelector = widgetsArr.map((w, index) => {
      const widgetType = JSON.parse(w.chart_params).widgetType

      const widgetClassName = classnames({
        [widgetStyles.widget]: true,
        [widgetStyles.selector]: true,
        [widgetStyles.selected]: w.id === selectedWidget
      })

      const checkmark = w.id === selectedWidget
        ? (
          <div className={widgetStyles.checkmark}>
            <Icon type="check" />
          </div>
        )
        : ''

      const startCol = (currentPage - 1) * pageSize + 1
      const endCol = Math.min(currentPage * pageSize, widgetsArr.length)

      let colItems = void 0
      if ((index + 1 >= startCol && index + 1 <= endCol) ||
        (startCol > widgetsArr.length)) {
        colItems = (
          <Col
            md={8}
            sm={12}
            xs={24}
            key={w.id}
            onClick={onWidgetSelect(w.id)}
          >
            <div className={widgetClassName}>
              <h3 className={widgetStyles.title}>{w.name}</h3>
              <p className={widgetStyles.content}>{w.desc}</p>
              <i className={`${widgetStyles.pic} iconfont ${iconMapping[widgetType]}`} />
              {checkmark}
            </div>
          </Col>
        )
      }

      return colItems
    })

    const selectWidgetStep = classnames({
      [utilStyles.hide]: !!step
    })

    const inputFormStep = classnames({
      [utilStyles.hide]: !step
    })

    const triggerParamsClass = classnames({
      [utilStyles.hide]: triggerType === 'manual'
    })

    return (
      <Form>
        <Row className={utilStyles.formStepArea}>
          <Col span={24}>
            <Steps current={step}>
              <Step title="Widget" />
              <Step title="Frequent" />
              <Step title="完成" />
            </Steps>
          </Col>
        </Row>
        <Row className={`${selectWidgetStep} ${styles.searchRow}`}>
          <Col span={17} />
          <Col>
            <FormItem wrapperCol={{span: 7}}>
              {getFieldDecorator('searchItem', {})(
                <Search
                  placeholder="Widget 名称"
                  onSearch={this.onSearchWidgetItem}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={20} className={selectWidgetStep}>
          {widgetSelector}
        </Row>
        <Row className={selectWidgetStep}>
          <Pagination
            simple={screenWidth < 768 || screenWidth === 768}
            className={widgetStyles.paginationPosition}
            showSizeChanger
            onShowSizeChange={this.onShowSizeChange}
            onChange={this.onChange}
            total={widgetsArr.length}
            defaultPageSize={24}
            pageSizeOptions={['24', '48', '72', '96']}
            current={currentPage}
          />
        </Row>
        <div className={inputFormStep}>
          <Row gutter={8}>
            <Col sm={8}>
              {
                type === 'add'
                  ? <FormItem className={utilStyles.hide}>
                    {getFieldDecorator('id', {})(
                      <Input />
                    )}
                  </FormItem>
                  : void 0
              }
              <FormItem
                label="数据刷新模式"
                labelCol={{span: 10}}
                wrapperCol={{span: 14}}
              >
                {getFieldDecorator('trigger_type', {
                  initialValue: triggerType
                })(
                  <Select onSelect={onTriggerTypeSelect}>
                    <Option value="manual">手动刷新</Option>
                    <Option value="frequent">定时刷新</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col sm={4} className={triggerParamsClass}>
              <FormItem
                label="时长"
                labelCol={{span: 12}}
                wrapperCol={{span: 12}}
              >
                {getFieldDecorator('trigger_params', {
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

export default Form.create()(DashboardItemForm)
