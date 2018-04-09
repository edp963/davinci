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
      isCascadeSelect: false,
      optionFormDisabled: true,
      optionTableSource: [],
      flatTableColumns: [],
      filterTypes: [
        { text: '文本输入框', value: 'input' },
        // { text: '数字输入框', value: 'inputNumber' },
        { text: '数字范围输入框', value: 'numberRange' },
        { text: '单选下拉菜单', value: 'select' },
        { text: '多选下拉菜单', value: 'multiSelect' },
        { text: '级联下拉菜单', value: 'cascadeSelect' },
        { text: '日期选择', value: 'date' },
        { text: '日期多选', value: 'multiDate' },
        { text: '日期范围选择', value: 'dateRange' },
        { text: '日期时间选择', value: 'datetime' },
        { text: '日期时间范围选择', value: 'datetimeRange' }
      ]
    }
  }

  typeSelectChange = (val) => {
    this.setState({
      optionFormDisabled: !['select', 'multiSelect'].includes(val),
      isCascadeSelect: ['cascadeSelect'].includes(val)
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
    this.state.isCascadeSelect = false
    this.state.optionTableSource = []
  }

  saveToTable = () => {
    this.baseForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.onSaveToTable({
          ...values,
          relatedItems: this.itemSelectorForm.props.form.getFieldsValue(),
          options: this.state.optionTableSource
        })
        this.hideForm()
      }
    })
  }

  editItem = (key) => () => {
    const item = this.props.tableSource.find(ts => ts.key === key)
    const { relatedItems, options, ...base } = item

    this.showForm().then(() => {
      this.setState({
        optionTableSource: options,
        optionFormDisabled: !['select', 'multiSelect'].includes(base.type),
        isCascadeSelect: ['cascadeSelect'].includes(base.type)
      }, () => {
        this.baseForm.props.form.setFieldsValue(base)
        this.itemSelectorForm.props.form.setFieldsValue(relatedItems)
        if (this.state.isCascadeSelect) {
          this.flatTableSelectChange(base.flatTableId, true)
        }
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

  flatTableSelectChange = (val, stayColumnValue) => {
    if (val) {
      this.props.onLoadBizdataSchema(Number(val), (schema) => {
        this.setState({
          flatTableColumns: schema
        })
        if (!stayColumnValue) {
          this.baseForm.props.form.resetFields(['cascadeColumn', 'parentColumn'])
        }
      })
    } else {
      this.setState({
        flatTableColumns: []
      })
    }
  }

  render () {
    const {
      items,
      widgets,
      bizlogics,
      dataSources,
      tableSource,
      onDeleteFromTable,
      onLoadBizdataSchema
    } = this.props

    const {
      formVisible,
      activeTabKey,
      isCascadeSelect,
      flatTableColumns,
      optionFormDisabled,
      optionTableSource,
      filterTypes
    } = this.state

    const itemSelectorSource = items.map(i => {
      const widget = widgets.find(w => w.id === i.widget_id)
      const flattable = bizlogics.find(bl => bl.id === widget.flatTable_id)

      return {
        id: i.id,
        name: widget.name,
        keys: dataSources[i.id].keys,
        types: dataSources[i.id].types,
        params: (flattable.sql_tmpl.match(/query@var\s\$\w+\$/g) || [])
          .map(qv => qv.substring(qv.indexOf('$') + 1, qv.lastIndexOf('$')))
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
              bizlogics={bizlogics}
              isCascadeSelect={isCascadeSelect}
              flatTableColumns={flatTableColumns}
              onTypeSelectChange={this.typeSelectChange}
              onFlatTableSelectChange={this.flatTableSelectChange}
              onLoadBizdataSchema={onLoadBizdataSchema}
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
  bizlogics: PropTypes.array,
  dataSources: PropTypes.object,
  tableSource: PropTypes.array,
  onSaveToTable: PropTypes.func,
  onDeleteFromTable: PropTypes.func,
  onLoadBizdataSchema: PropTypes.func
}

export default GlobalFilterPanel
