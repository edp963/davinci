import React from 'react'
import { IDataParamSource, IDataParamConfig } from './Dropbox'
import { decodeMetricName } from '../util'
import { Radio, Button } from 'antd'
const RadioGroup = Radio.Group
const styles = require('./Workbench.less')

interface IActOnSettingFormProps {
  list: IDataParamSource[]
  config: IDataParamConfig
  onSave: (config: IDataParamConfig) => void
  onCancel: () => void
}

interface IActOnSettingFormStates {
  actOn: string
  list: IDataParamSource[]
}

export class ActOnSettingForm extends React.PureComponent<IActOnSettingFormProps, IActOnSettingFormStates> {
  constructor (props) {
    super(props)
    this.state = {
      actOn: 'all',
      list: []
    }
  }

  public componentWillMount () {
    const { config } = this.props
    if (config.actOn) {
      this.setState({
        actOn: config.actOn
      })
    }
  }

  public componentWillReceiveProps (nextProps) {
    const { list, config } = nextProps
    if (list && config) {
      this.setState({
        list: list.slice(),
        actOn: config.actOn || this.state.actOn
      })
    }
  }

  private radioChange = (e) => {
    this.setState({
      actOn: e.target.value
    })
  }

  private save = () => {
    this.props.onSave({
      actOn: this.state.actOn
    })
  }

  public reset = () => {
    this.setState({
      actOn: 'all'
    })
  }

  public render () {
    const { onCancel } = this.props
    const { list, actOn } = this.state
    const radioList = [{ name: 'all' }].concat(list).map((l) => (
      <Radio key={l.name} value={l.name}>
        {l.name === 'all' ? l.name : decodeMetricName(l.name)}
      </Radio>
    ))
    return (
      <div className={styles.actOnSettingForm}>
        <RadioGroup onChange={this.radioChange} value={actOn}>
          {radioList}
        </RadioGroup>
        <div className={styles.footer}>
          <Button type="primary" onClick={this.save}>保存</Button>
          <Button onClick={onCancel}>取消</Button>
        </div>
      </div>
    )
  }
}

export default ActOnSettingForm
