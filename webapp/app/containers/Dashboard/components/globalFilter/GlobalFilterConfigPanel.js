import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import BaseForm from './BaseForm'
import ItemSelectorForm from './ItemSelectorForm'
import OptionForm from './OptionForm'
import Table from 'antd/lib/table'
import Button from 'antd/lib/button'
import Modal from 'antd/lib/modal'
import Tooltip from 'antd/lib/tooltip'
import Tabs from 'antd/lib/tabs'
const TabPane = Tabs.TabPane

import {uuid} from '../../../../utils/util'

import styles from './GlobalFilter.less'
import utilStyles from '../../../../assets/less/util.less'

export class GlobalFilterPanel extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      formVisible: false,
      activeTabKey: 'widget',
      optionFormDisabled: true,
      optionTableSource: [],
      filterTypes: [
        { text: '文本输入框', value: 'input' },
        // { text: '数字输入框', value: 'inputNumber' },
        { text: '单选下拉菜单', value: 'select' },
        { text: '多选下拉菜单', value: 'multiSelect' },
        { text: '日期选择', value: 'date' },
        { text: '日期多选', value: 'multiDate' },
        { text: '日期范围选择', value: 'dateRange' },
        { text: '日期时间选择', value: 'datetime' },
        { text: '日期时间范围选择', value: 'datetimeRange' }
      ]
    }
  }

  typeSelect = (val) => {
    this.setState({
      optionFormDisabled: ['select', 'multiSelect'].indexOf(val) < 0
    })
  }

  tabChange = (key) => {
    this.setState({
      activeTabKey: key
    })
  }

  showForm = () =>
    new Promise((resolve) => {
      this.setState({
        formVisible: true
      }, () => {
        resolve()
      })
    })

  hideForm = () => {
    this.setState({
      formVisible: false
    })
  }

  resetForm = () => {
    this.baseForm.props.form.resetFields()
    this.itemSelectorForm.props.form.resetFields()
    this.state.activeTabKey = 'widget'
    this.state.optionFormDisabled = true
    this.state.optionTableSource = []
  }

  saveToTable = () => {
    this.baseForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.onSaveToTable({
          ...values,
          items: this.itemSelectorForm.props.form.getFieldsValue(),
          options: this.state.optionTableSource
        })
        this.hideForm()
      }
    })
  }

  editItem = (key) => () => {
    const item = this.props.tableSource.find(ts => ts.key === key)
    const { items, options, ...base } = item

    this.showForm().then(() => {
      this.baseForm.props.form.setFieldsValue(base)
      this.itemSelectorForm.props.form.setFieldsValue(items)
      this.setState({
        optionTableSource: options,
        optionFormDisabled: ['select', 'multiSelect'].indexOf(base.type) < 0
      })
    })
  }

  addOption = () => {
    const { optionTableSource } = this.state
    this.setState({
      optionTableSource: optionTableSource.concat({
        id: uuid(8, 16),
        text: '',
        value: '',
        status: 0
      })
    })
  }

  changeOptionStatus = (id) => () => {
    const { optionTableSource } = this.state
    optionTableSource.find(t => t.id === id).status = 0
    this.setState({
      optionTableSource: optionTableSource.slice()
    })
  }

  updateOption = (id) => () => {
    this.optionForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { optionTableSource } = this.state
        let config = optionTableSource.find(t => t.id === id)

        config.text = values[`${id}Text`]
        config.value = values[`${id}Value`]
        config.status = 1

        this.setState({
          optionTableSource: optionTableSource.slice()
        })
      }
    })
  }

  deleteOption = (id) => () => {
    const { optionTableSource } = this.state

    this.setState({
      optionTableSource: optionTableSource.filter(t => t.id !== id)
    })
  }

  render () {
    const {
      items,
      widgets,
      dataSources,
      tableSource,
      onDeleteFromTable
    } = this.props

    const {
      formVisible,
      activeTabKey,
      optionFormDisabled,
      optionTableSource,
      filterTypes
    } = this.state

    const itemSelectorSource = items.map(i => {
      const widget = widgets.find(w => w.id === i.widget_id)
      return {
        id: i.id,
        name: widget.name,
        keys: dataSources[i.id].keys,
        types: dataSources[i.id].types
      }
    })

    return (
      <div className={styles.table}>
        <div className={styles.tools}>
          <Button type="primary" onClick={this.showForm}>新增</Button>
        </div>
        <Table
          columns={[{
            key: 'name',
            title: '名称',
            dataIndex: 'name'
          }, {
            key: 'type',
            title: '类型',
            render: (val, record) => filterTypes.find(ft => ft.value === record.type).text
          }, {
            title: '操作',
            width: 100,
            className: `${utilStyles.textAlignCenter} ${styles.actions}`,
            render: (val, record) => (
              <span>
                <Tooltip title="修改">
                  <Button shape="circle" icon="edit" onClick={this.editItem(record.key)} />
                </Tooltip>
                <Tooltip title="删除">
                  <Button shape="circle" icon="delete" onClick={onDeleteFromTable(record.key)} />
                </Tooltip>
              </span>
            )
          }]}
          dataSource={tableSource}
          pagination={false}
        />
        <Modal
          title="新增筛选项"
          wrapClassName="ant-modal-large"
          visible={formVisible}
          onOk={this.saveToTable}
          onCancel={this.hideForm}
          afterClose={this.resetForm}
        >
          <div className={styles.form}>
            <BaseForm
              filterTypes={filterTypes}
              onTypeSelect={this.typeSelect}
              wrappedComponentRef={f => { this.baseForm = f }}
            />
            <Tabs
              activeKey={activeTabKey}
              onChange={this.tabChange}
              size="small"
            >
              <TabPane tab="关联widget" key="widget">
                <div className={styles.tabPane}>
                  <ItemSelectorForm
                    items={itemSelectorSource}
                    wrappedComponentRef={f => { this.itemSelectorForm = f }}
                  />
                </div>
              </TabPane>
              <TabPane tab="配置选项" key="select" disabled={optionFormDisabled}>
                <div className={styles.tabPane}>
                  <OptionForm
                    dataSource={optionTableSource}
                    onAddOpiton={this.addOption}
                    onChangeStatus={this.changeOptionStatus}
                    onUpdateOption={this.updateOption}
                    onDeleteOption={this.deleteOption}
                    wrappedComponentRef={f => { this.optionForm = f }}
                  />
                </div>
              </TabPane>
            </Tabs>
          </div>
        </Modal>
      </div>
    )
  }
}

GlobalFilterPanel.propTypes = {
  items: PropTypes.array,
  widgets: PropTypes.array,
  dataSources: PropTypes.object,
  tableSource: PropTypes.array,
  onSaveToTable: PropTypes.func,
  onDeleteFromTable: PropTypes.func
}

export default GlobalFilterPanel
