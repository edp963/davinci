import * as React from 'react'
import * as classnames from 'classnames'
import * as echarts from 'echarts/lib/echarts'

import LinkageForm, { ILinkageForm } from './LinkageForm'
import { WrappedFormUtils } from 'antd/lib/form/Form'
const Table = require('antd/lib/table')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Button = require('antd/lib/button')
const Modal = require('antd/lib/modal')

import { DEFAULT_SPLITER, TABLE_HEADER_HEIGHT } from '../../globalConstants'
import { uuid } from 'utils/util'
const utilStyles = require('assets/less/util.less')
const styles = require('./Linkage.less')

interface ILinkageConfigProps {
  cascaderSource: any[]
  tableSource: any[]
  onGetWidgetInfo: (itemId: number) => void
  saving: boolean
  onSave: (tableSource: any[]) => void
}

interface ILinkageConfigStates {
  formVisible: boolean
  localTableSource: any[]
}

export class LinkageConfig extends React.PureComponent<ILinkageConfigProps, ILinkageConfigStates> {
  constructor (props) {
    super(props)
    this.state = {
      formVisible: false,
      localTableSource: []
    }
  }

  private chart: echarts.ECharts = null
  private linkageForm: WrappedFormUtils = null

  public componentDidMount () {
    const { tableSource, onGetWidgetInfo } = this.props
    this.initState(tableSource, onGetWidgetInfo)
  }

  public componentWillReceiveProps (nextProps: ILinkageConfigProps) {
    const { tableSource, onGetWidgetInfo, saving, onSave } = nextProps
    if (tableSource !== this.props.tableSource) {
      this.initState(tableSource, onGetWidgetInfo)
    }
    if (saving !== this.props.saving) {
      const { localTableSource } = this.state
      onSave([...localTableSource])
    }
  }

  private initState = (tableSource, onGetWidgetInfo) => {
    this.setState({
      localTableSource: tableSource
    }, () => {
      const { localTableSource } = this.state
      if (localTableSource.length) {
        this.renderChart(localTableSource, onGetWidgetInfo)
      }
    })
  }

  private renderChart = (tableSource, onGetWidgetInfo) => {
    const nodes = {}
    const links = []

    tableSource.forEach((ts) => {
      const triggerId = ts.trigger[0]
      const linkagerId = ts.linkager[0]

      if (!nodes[triggerId]) {
        nodes[triggerId] = onGetWidgetInfo(+triggerId)
      }

      if (!nodes[linkagerId]) {
        nodes[linkagerId] = onGetWidgetInfo(+linkagerId)
      }

      links.push({
        source: nodes[triggerId].name,
        target: nodes[linkagerId].name
      })
    })

    if (!this.chart) {
      this.chart = echarts.init(document.getElementById('linkageChart') as HTMLDivElement, 'default')
    }

    const chartOptions = {
      animationDurationUpdate: 1000,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'circular',
          symbolSize: 30,
          roam: true,
          focusNodeAdjacency: true,
          label: {
            normal: {
              show: true,
              position: 'right'
            }
          },
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10],
          edgeLabel: {
            normal: {

            }
          },
          data: Object.values(nodes).map((info: any) => ({
            name: info.name,
            category: info.type
          })),
          links,
          categories: Object.values(Object.values(nodes).reduce((categories, info: any) => {
            if (!categories[info.type]) {
              categories[info.type] = {
                name: info.type
              }
            }
            return categories
          }, {})),
          lineStyle: {
            normal: {
              opacity: 0.9,
              curveness: 0
            }
          }
        }
      ]
    }

    this.chart.setOption(chartOptions)
  }

  private showForm = () => {
    this.setState({
      formVisible: true
    })
  }

  private hideForm = () => {
    this.setState({
      formVisible: false
    })
  }

  private resetForm = () => {
    this.linkageForm.resetFields()
  }

  private addToTable = () => {
    this.linkageForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { localTableSource } = this.state
        this.setState({
          localTableSource: [ ...localTableSource, { ...values, key: uuid(8, 16) } ]
        }, () => {
          const { onGetWidgetInfo } = this.props
          this.renderChart(this.state.localTableSource, onGetWidgetInfo)
        })
      }
    })
  }

  private deleteFromTable = (key) => () => {
    this.setState({
      localTableSource: this.state.localTableSource.filter((lt) => lt.key !== key)
    }, () => {
      const { onGetWidgetInfo } = this.props
      this.renderChart(this.state.localTableSource, onGetWidgetInfo)
    })
  }

  public render () {
    const {
      cascaderSource
    } = this.props

    const { localTableSource } = this.state

    const { formVisible } = this.state

    const PANEL_BODY_HEIGHT = 401
    const TOOLS_HEIGHT = 28

    const chartContainerClass = classnames({
      [utilStyles.hide]: !localTableSource.length
    })
    const emptyChartClass = classnames({
      [utilStyles.hide]: localTableSource.length
    })

    return (
      <Row gutter={16}>
        <Col span={12}>
          <div className={styles.tools}>
            <Button
              type="primary"
              onClick={this.showForm}
            >
              新增
            </Button>
          </div>
          <Table
            columns={[
              {
                key: 'trigger',
                title: '触发器',
                width: 155,
                dataIndex: 'trigger',
                render: (val) => {
                  const { cascaderSource } = this.props
                  const triggerData = cascaderSource.find((ts) => ts.value === val[0])
                  const triggerColumnData = triggerData.children.params.find((c) => c.value === val[1])
                  return `${triggerData.label} - ${triggerColumnData.label}`
                }
              }, {
                key: 'linkager',
                title: '联动图表',
                width: 155,
                dataIndex: 'linkager',
                render: (val) => {
                  const { cascaderSource } = this.props
                  const linkagerData = cascaderSource.find((fs) => fs.value === val[0])
                  const linkagerColumnData = val[1].split(DEFAULT_SPLITER)
                  const linkagerColumnText = `${linkagerColumnData[0]}[${linkagerColumnData[2] === 'parameter' ? '参数' : '变量'}]`
                  return `${linkagerData.label} - ${linkagerColumnText}`
                }
              }, {
                key: 'relation',
                title: '关系',
                width: 50,
                className: `${utilStyles.textAlignCenter}`,
                dataIndex: 'relation'
              }, {
                title: '操作',
                width: 50,
                className: `${utilStyles.textAlignCenter}`,
                render: (val, record) => (
                  <span>
                    <a onClick={this.deleteFromTable(record.key)}>删除</a>
                  </span>
                )
              }
            ]}
            dataSource={localTableSource}
            pagination={false}
            scroll={{ y: PANEL_BODY_HEIGHT - TOOLS_HEIGHT - TABLE_HEADER_HEIGHT }}
          />
        </Col>
        <Col span={12}>
          <div id="linkageChart" className={`${styles.chartContainer} ${chartContainerClass}`} />
          <div className={`${styles.chartEmpty} ${emptyChartClass}`}>
            <i className="iconfont icon-jiedian" />
            <p>暂无联动数据</p>
          </div>
        </Col>
        <Modal
          title="新增联动项"
          wrapClassName="ant-modal-small"
          visible={formVisible}
          onOk={this.addToTable}
          onCancel={this.hideForm}
          afterClose={this.resetForm}
        >
          <LinkageForm
            cascaderSource={cascaderSource}
            ref={(f) => { this.linkageForm = f }}
          />
        </Modal>
      </Row>
    )
  }
}

export default LinkageConfig
