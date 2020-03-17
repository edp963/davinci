import React, { createRef, PureComponent } from 'react'
import classnames from 'classnames'
import moment, { Moment } from 'moment'
import { IDataParamConfig, IDataParamSource } from './Dropbox'
import ConditionalFilterForm, { ConditionalFilterPanel } from './ConditionalFilterForm'
import { DEFAULT_DATETIME_FORMAT } from 'app/globalConstants'
import { decodeMetricName } from '../util'
import { uuid } from 'utils/util'
import { Transfer, Radio, Button, DatePicker } from 'antd'
import { IFilters } from 'app/components/Filters/types'
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const RangePicker = DatePicker.RangePicker
const styles = require('./Workbench.less')
const utilStyles = require('assets/less/util.less')

interface IFilterSettingFormProps {
  item: IDataParamSource
  list: string[]
  model: any
  config: IDataParamConfig
  onSave: (config: IDataParamConfig) => void
  onCancel: () => void
}

interface IFilterSettingFormStates {
  mode: 'value' | 'conditional' | 'date'
  name: string
  type: string
  list: Array<{key: string, title: string}>,
  target: string[]
  filterTree: object
  selectedDate: string
  datepickerValue: [Moment, Moment]
}

export class FilterSettingForm extends PureComponent<IFilterSettingFormProps, IFilterSettingFormStates> {
  constructor (props) {
    super(props)
    this.state = {
      mode: 'value',
      name: '',
      type: '',
      list: [],
      target: [],
      filterTree: {},
      selectedDate: 'today',
      datepickerValue: [moment(), moment()]
    }
  }

  private dateRadioSource = [
    [
      { name: '今天', value: 'today' },
      { name: '昨天', value: 'yesterday' },
      { name: '昨天以来', value: 'yesterdayFromNow' }
    ],
    [
      { name: '最近7天', value: '7' },
      { name: '最近30天', value: '30' },
      { name: '最近90天', value: '90' },
      { name: '最近一年', value: '365' }
    ],
    [
      { name: '本周起', value: 'week' },
      { name: '本月起', value: 'month' },
      { name: '本季度起', value: 'quarter' },
      { name: '今年起', value: 'year' }
    ],
    [
      { name: '自定义', value: 'other' }
    ]
  ]
  private conditionalFilterForm = createRef<ConditionalFilterPanel>()

  public componentWillMount () {
    const { item, config } = this.props
    this.initNameAndType(item)
    this.initFilterSource(item.visualType, config)
  }

  public componentWillReceiveProps (nextProps) {
    const { item, config, list } = nextProps
    if (item) {
      this.initNameAndType(item)
    }
    if (config) {
      this.initFilterSource(item.visualType, config)
    }
    if (list) {
      this.setState({
        list: list.map((l) => ({
          key: l === '' ? uuid(8, 16) : l,
          title: l
        }))
      })
    }
  }

  private initNameAndType = (item) => {
    this.setState({
      name: item.type === 'category' ? item.name : decodeMetricName(item.name),
      type: item.visualType,
      mode: item.visualType === 'date' ? 'date' : item.visualType === 'number' ? 'conditional' : 'value'
    })
  }

  private initFilterSource = (visualType, config) => {
    const { filterSource } = config
    if (filterSource) {
      if (visualType === 'date') {
        this.setState({
          selectedDate: filterSource.selectedDate,
          datepickerValue: filterSource.datepickerValue.map((v) => moment(v))
        })
      } else if (visualType === 'number') {
        this.setState({
          filterTree: filterSource
        })
      } else {
        if (Array.isArray(filterSource)) {
          this.setState({
            target: filterSource,
            mode: 'value'
          })
        } else {
          this.setState({
            filterTree: filterSource,
            mode: 'conditional'
          })
        }
      }
    }
  }

  private radioChange = (e) => {
    this.setState({
      mode: e.target.value
    })
  }

  private transferRender = (item) => item.title
  private transferChange = (target) => {
    this.setState({ target })
  }

  private initFilterTree = () => {
    this.setState({
      filterTree: {
        id: uuid(8, 16),
        root: true,
        type: 'node'
      }
    })
  }

  private addTreeNode = (tree) => {
    this.setState({
      filterTree: tree
    })
  }

  private deleteTreeNode = () => {
    this.setState({
      filterTree: {}
    })
  }

  private getSqlExpresstions = (tree) => {
    const { name, type } = this.state
    if (Object.keys(tree).length) {
      if (tree.type === 'link') {
        const partials = tree.children.map((c) => {
          if (c.type === 'link') {
            return this.getSqlExpresstions(c)
          } else {
            return `${name} ${c.filterOperator} ${this.getFilterValue(c.filterValue, type)}`
          }
        })
        const expressions = partials.join(` ${tree.rel} `)
        return `(${expressions})`
      } else {
        return `${name} ${tree.filterOperator} ${this.getFilterValue(tree.filterValue, type)}`
      }
    } else {
      return []
    }
  }

  private getSqlModel = (tree) => {
    const { name, type } = this.state
    const result = tree.map((t) => {
      let children
      if (t && t.children && t.children.length) {
          children = this.getSqlModel(t.children)
      }
      if (t.type === 'link') {
        const filterJson = {
            type: 'relation',
            value: t.rel,
            children
        }
        return filterJson
      } else {
          const filterJson = {
              name,
              type: 'filter',
              value: this.getFilterValue(t.filterValue, type),
              operator: t.filterOperator,
              sqlType: this.getSqlType(name)
          }
          return filterJson
      }
  })
    return result
}

  private getSqlType = (key) => {
    const {model} = this.props
    return model && model[key] ? model[key]['sqlType'] : 'VARCHAR'
  }
  private getFilterValue = (val, type) => type === 'number' ? val : `'${val}'`


  private selectDate = (e) => {
    this.setState({
      selectedDate: e.target.value
    })
  }

  private datepickerChange = (dates) => {
    this.setState({
      datepickerValue: dates.slice()
    })
  }
// widget 编辑器filter 位置
  private getDateSql = () => {
    const { name, selectedDate, datepickerValue } = this.state
    const today = moment().startOf('day').format(DEFAULT_DATETIME_FORMAT)
    const yesterday = moment().startOf('day').subtract(1, 'days').format(DEFAULT_DATETIME_FORMAT)
    const tml = {
      name,
      operator: '>=',
      type: 'filter',
      sqlType: this.getSqlType(name),
      value: ''
    }
    if (selectedDate === 'today') {
      tml.value = `'${today}'`
    } else if (selectedDate === 'yesterday') {
      const resultJson = [
        {
          ...tml,
          value: `'${yesterday}'`
        },
        {
          ...tml,
          operator: '<=',
          value: `'${today}'`
        }
      ]
      return resultJson
    } else if (selectedDate === 'yesterdayFromNow') {
      tml.value = `'${yesterday}'`
    } else if (selectedDate === '7') {
      tml.value = `'${moment().subtract(7, 'days').format(DEFAULT_DATETIME_FORMAT)}'`
    } else if (selectedDate === '30') {
      tml.value = `'${moment().subtract(30, 'days').format(DEFAULT_DATETIME_FORMAT)}'`
    } else if (selectedDate === '90') {
      tml.value = `'${moment().subtract(90, 'days').format(DEFAULT_DATETIME_FORMAT)}'`
    } else if (selectedDate === '365') {
      tml.value = `'${moment().subtract(365, 'days').format(DEFAULT_DATETIME_FORMAT)}'`
    } else if (selectedDate === 'week') {
      tml.value = `'${moment().startOf('week').format(DEFAULT_DATETIME_FORMAT)}'`
    } else if (selectedDate === 'month') {
      tml.value = `'${moment().startOf('month').format(DEFAULT_DATETIME_FORMAT)}'`
    } else if (selectedDate === 'quarter') {
      tml.value = `'${moment().startOf('quarter').format(DEFAULT_DATETIME_FORMAT)}'`
    } else if (selectedDate === 'year') {
      tml.value = `'${moment().startOf('year').format(DEFAULT_DATETIME_FORMAT)}'`
    } else {
      const resultJson = [
        {
          ...tml,
          value: `'${datepickerValue[0].format(DEFAULT_DATETIME_FORMAT)}'`
        },
        {
          ...tml,
          operator: '<=',
          value: `'${datepickerValue[1].format(DEFAULT_DATETIME_FORMAT)}'`
        }
      ]
      return resultJson
    }
    return [{...tml}]
  }

  private save = () => {
    const { onSave, onCancel } = this.props
    const { name, mode, target, filterTree, selectedDate, datepickerValue } = this.state
    if (mode === 'value') {
      const sql = target.map((key) => `'${key}'`).join(',')
      const sqlModel = []
      const filterItem: IFilters = {
        name,
        type: 'filter',
        value: target.map((key) => `'${key}'`),
        operator: 'in',
        sqlType: this.getSqlType(name)
      }
      sqlModel.push(filterItem)
      if (sql) {
        onSave({
          sqlModel,
          filterSource: target.slice()
        })
      } else {
        onCancel()
      }
    } else if (mode === 'conditional') {
      if (Object.keys(filterTree).length > 0) {
        this.conditionalFilterForm.current.props.form.validateFieldsAndScroll((err) => {
          if (!err) {
            onSave({
              filterSource: {...filterTree},
              sqlModel: this.getSqlModel([{...filterTree}])
            })
            this.conditionalFilterForm.current.resetTree()
          }
        })
      } else {
        onCancel()
      }
    } else {
      onSave({
        sqlModel: this.getDateSql(),
        filterSource: {
          selectedDate,
          datepickerValue: datepickerValue.map((m) => m.format(DEFAULT_DATETIME_FORMAT))
        }
      })
    }
  }

  public reset = () => {
    this.setState({
      mode: 'value',
      name: '',
      type: '',
      list: [],
      target: [],
      filterTree: {},
      selectedDate: 'today',
      datepickerValue: [moment(), moment()]
    })
  }

  public render () {
    const { onCancel } = this.props
    const { mode, name, type, list, target, filterTree, selectedDate, datepickerValue } = this.state
    const headerRadios = []

    if (type === 'number') {
      headerRadios.push(
        <RadioButton key="conditional" value="conditional">条件筛选</RadioButton>
      )
    } else if (type === 'date') {
      headerRadios.push(
        <RadioButton key="date" value="date">日期筛选</RadioButton>
      )
    } else {
      headerRadios.push(
        <RadioButton key="value" value="value">值筛选</RadioButton>
      )
      headerRadios.push(
        <RadioButton key="conditional" value="conditional">条件筛选</RadioButton>
      )
    }

    const dateRadios = this.dateRadioSource.map((arr, index) => {
      return arr.map((s) => (
        <Radio key={s.value} value={s.value} className={styles.radio}>{s.name}</Radio>
      )).concat(<br key={index} />)
    })

    let shownBlock
    if (mode === 'value') {
      shownBlock = (
        <div className={styles.valueBlock}>
          <Transfer
            dataSource={list}
            titles={['值列表', '所选值']}
            render={this.transferRender}
            targetKeys={target}
            onChange={this.transferChange}
          />
        </div>
      )
    } else if (mode === 'conditional') {
      shownBlock = (
        <div className={styles.conditionalBlock}>
          <ConditionalFilterForm
            name={name}
            type={type}
            filterTree={filterTree}
            onAddRoot={this.initFilterTree}
            onAddTreeNode={this.addTreeNode}
            onDeleteTreeNode={this.deleteTreeNode}
            wrappedComponentRef={this.conditionalFilterForm}
          />
        </div>
      )
    } else {
      shownBlock = (
        <div className={styles.dateBlock}>
          <RadioGroup
            value={selectedDate}
            onChange={this.selectDate}
            className={styles.dateFilterRadios}
          >
            {dateRadios}
          </RadioGroup>
          {selectedDate === 'other' && (
            <RangePicker
              value={datepickerValue}
              format={DEFAULT_DATETIME_FORMAT}
              onChange={this.datepickerChange}
              showTime
            />
          )}
        </div>
      )
    }

    return (
      <div className={styles.filterSettingForm}>
        <div className={styles.header}>
          <RadioGroup onChange={this.radioChange} value={mode}>
            {headerRadios}
          </RadioGroup>
        </div>
        {shownBlock}
        <div className={styles.footer}>
          <Button type="primary" onClick={this.save}>保存</Button>
          <Button onClick={onCancel}>取消</Button>
        </div>
      </div>
    )
  }
}

export default FilterSettingForm
