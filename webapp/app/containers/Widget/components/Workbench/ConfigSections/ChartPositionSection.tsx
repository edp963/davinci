import * as React from 'react'
import { Row, Col, Select, Input } from 'antd'
const Option = Select.Option
import { CHART_POSITION_TYPE } from 'app/globalConstants';
const styles = require('../Workbench.less')

export interface IChartPositionConfig {
    type: string,
    top: string,
    bottom: string,
    left: string,
    right: string
}

interface IChartPositionSectionProps {
    title: string
    config: IChartPositionConfig
    onChange: (prop: string, value: any) => void
}

export class ChartPositionSection extends React.PureComponent<IChartPositionSectionProps, {}> {
    private selectChange = (prop) => (value) => {
        this.props.onChange(prop, value)
    }
    private inputChange = (prop) => (value) => {
        this.props.onChange(prop, value.target.value)
    }
    public render() {
        const { title, config } = this.props
        const { type, top, bottom, left, right } = config
        const posTypes = CHART_POSITION_TYPE.map((f) => (
            <Option key={f.value} value={`${f.value}`}>{f.name}</Option>
        ))
        return (
            <div className={styles.paneBlock}>
                <h4>{title}</h4>
                <div className={styles.blockBody}>
                    <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                        <Col span={12}>
                            <Select
                                placeholder="位置选项"
                                className={styles.blockElm}
                                value={type}
                                onChange={this.selectChange('type')}
                            >
                                {posTypes}
                            </Select>
                        </Col>
                        <Col span={10}>
                            <a href="https://www.echartsjs.com/option.html#grid" target="_blank">查看文档...</a>
                        </Col>
                    </Row>
                    {type == 'customize' && <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                        <Col span={12}>上侧</Col>
                        <Col span={10}>
                            <Input
                                className={styles.blockElm}
                                value={top}
                                onChange={this.inputChange('top')}
                            />
                        </Col>
                    </Row>
                    }
                    {type == 'customize' && <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                        <Col span={12}>下侧</Col>
                        <Col span={10}>
                            <Input
                                className={styles.blockElm}
                                value={bottom}
                                onChange={this.inputChange('bottom')}
                            />
                        </Col>
                    </Row>
                    }
                    {type == 'customize' && <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                        <Col span={12}>左侧</Col>
                        <Col span={10}>
                            <Input
                                className={styles.blockElm}
                                value={left}
                                onChange={this.inputChange('left')}
                            />
                        </Col>
                    </Row>
                    }
                    {type == 'customize' && <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                        <Col span={12}>右侧</Col>
                        <Col span={10}>
                            <Input
                                className={styles.blockElm}
                                value={right}
                                onChange={this.inputChange('right')}
                            />
                        </Col>
                    </Row>
                    }
                </div>
            </div>
        )
    }
}
