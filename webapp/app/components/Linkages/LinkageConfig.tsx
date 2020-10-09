import React from 'react'
import classnames from 'classnames'
import * as echarts from 'echarts/lib/echarts'

import LinkageForm, { ILinkageForm } from './LinkageForm'
import AntdFormType from 'antd/lib/form/Form'
import { Table, Row, Col, Button, Modal } from 'antd'

import { DEFAULT_SPLITER, TABLE_HEADER_HEIGHT } from 'app/globalConstants'
import { uuid } from 'utils/util'
const utilStyles = require('assets/less/util.less')
const styles = require('./Linkage.less')

interface ILinkageConfigProps {
  cascaderSource: any[]
  linkages: any[]
  onGetWidgetInfo: (itemId: number) => void
  saving: boolean
  onSave: (linkages: any[]) => void
}

interface ILinkageConfigStates {
  formVisible: boolean
  localLinkages: any[]
}

export class LinkageConfig extends React.PureComponent<ILinkageConfigProps, ILinkageConfigStates> {
  constructor (props) {
    super(props)
    this.state = {
      formVisible: false,
      localLinkages: []
    }
    this.refHandlers = {
      linkageForm: (ref) => this.linkageForm = ref
    }
  }

  private chart: echarts.ECharts = null
  private refHandlers: { linkageForm: (ref: AntdFormType) => void }
  private linkageForm: AntdFormType = null

  public componentDidMount () {
    const { linkages, onGetWidgetInfo } = this.props
    this.initState(linkages, onGetWidgetInfo)
  }

  public componentWillReceiveProps (nextProps: ILinkageConfigProps) {
    const { linkages, onGetWidgetInfo, saving, onSave } = nextProps
    if (linkages !== this.props.linkages) {
      this.initState(linkages, onGetWidgetInfo)
    }
    if (saving !== this.props.saving) {
      const { localLinkages } = this.state
      onSave([...localLinkages])
    }
  }

  private initState = (linkages, onGetWidgetInfo) => {
    this.setState({
      localLinkages: linkages
    }, () => {
      const { localLinkages } = this.state
      if (localLinkages.length) {
        this.renderChart(localLinkages, onGetWidgetInfo)
      }
    })
  }

  private renderChart = (linkages, onGetWidgetInfo) => {
    const nodes = {}
    const links = []

    linkages.forEach((ts) => {
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
    this.linkageForm.props.form.resetFields()
  }

  private addToTable = () => {
    this.linkageForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { localLinkages } = this.state
        this.setState({
          localLinkages: [ ...localLinkages, { ...values, key: uuid(8, 16) } ],
          formVisible: false
        }, () => {
          const { onGetWidgetInfo } = this.props
          this.renderChart(this.state.localLinkages, onGetWidgetInfo)
        })
      }
    })
  }

  private deleteFromTable = (key) => () => {
    this.setState({
      localLinkages: this.state.localLinkages.filter((lt) => lt.key !== key)
    }, () => {
      const { onGetWidgetInfo } = this.props
      this.renderChart(this.state.localLinkages, onGetWidgetInfo)
    })
  }

  public render () {
    const {
      cascaderSource
    } = this.props

    const { localLinkages } = this.state

    const { formVisible } = this.state

    const PANEL_BODY_HEIGHT = 401
    const TOOLS_HEIGHT = 28

    const chartContainerClass = classnames({
      [utilStyles.hide]: !localLinkages.length
    })
    const emptyChartClass = classnames({
      [utilStyles.hide]: localLinkages.length
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
                  const triggerColumnData = triggerData.children.triggerColumns.find((c) => c.value === val[1])
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
                  const linkagerColumnText = `${linkagerColumnData[0]}[${linkagerColumnData[2] === 'column' ? '字段' : '变量'}]`
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
            dataSource={localLinkages}
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
            wrappedComponentRef={this.refHandlers.linkageForm}
          />
        </Modal>
      </Row>
    )
  }
}

export default LinkageConfig
