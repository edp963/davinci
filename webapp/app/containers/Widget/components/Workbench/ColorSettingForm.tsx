import * as React from 'react'
import * as classnames from 'classnames'
import { SketchPicker } from 'react-color'
import { decodeMetricName } from '../util'
import { IDataParamSource, IDataParamConfig } from './Dropbox'
const radios = require('antd/lib/radio')
const Radio = radios.default
const RadioGroup = radios.Group
const Button = require('antd/lib/button')
const defaultTheme = require('../../../../assets/json/echartsThemes/default.project.json')
const defaultThemeColors = defaultTheme.theme.color
const styles = require('./Workbench.less')

interface IColorProp {
  key: string
  color: string
}

interface IColorSettingFormProps {
  list: string[]
  loading: boolean
  metrics: IDataParamSource[]
  config: IDataParamConfig
  onSave: (config) => void
  onCancel: () => void
}

interface IColorSettingFormStates {
  actOn: string
  list: IColorProp[]
  selected: IColorProp
}

export class ColorSettingForm extends React.PureComponent<IColorSettingFormProps, IColorSettingFormStates> {
  constructor (props) {
    super(props)
    this.state = {
      actOn: 'all',
      list: [],
      selected: {
        key: '',
        color: defaultThemeColors[0]
      }
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
    const { config, list } = nextProps
    if (list && config) {
      const themeColorLength = defaultThemeColors.length
      const configValues = config.values || {}
      const stateList = list.map((l, index) => ({
        key: l,
        color: configValues[l] || defaultThemeColors[index % themeColorLength]
      }))
      this.setState({
        list: stateList,
        actOn: config.actOn || this.state.actOn,
        ...list.length && {selected: stateList[0]}
      })
    }
  }

  private metricChange = (e) => {
    this.setState({
      actOn: e.target.value
    })
  }

  private colorChange = ({hex}) => {
    const { selected, list } = this.state
    const selectedItem = list.find((l) => l.key === selected.key)
    selectedItem.color = hex
    this.setState({
      list: [...list]
    })
  }

  private listSelect = (item) => () => {
    this.setState({
      selected: item
    })
  }

  private saveConfig = () => {
    const { onSave } = this.props
    const { actOn, list } = this.state
    onSave({
      actOn,
      values: list.reduce((config, l) => {
        config[l.key] = l.color
        return config
      }, {})
    })
  }

  public reset = () => {
    this.setState({
      actOn: 'all',
      list: [],
      selected: {
        key: '',
        color: defaultThemeColors[0]
      }
    })
  }

  public render () {
    const { loading, metrics, onCancel } = this.props
    const { actOn, list, selected } = this.state

    const metricRadioButtons = [{ name: 'all' }].concat(metrics).map((m) => (
      <Radio key={m.name} value={m.name}>
        {m.name === 'all' ? m.name : decodeMetricName(m.name)}
      </Radio>
    ))
    let columnValueList

    if (list.length) {
      columnValueList = list.map((l) => (
        <li
          key={l.key}
          className={classnames({[styles.selected]: selected.key === l.key})}
          onClick={this.listSelect(l)}
        >
          <span className={styles.icon} style={{background: l.color}} />
          {l.key}
        </li>
      ))
    }

    return (
      <div className={styles.colorSettingForm}>
        <div className={styles.header}>
          <h4>应用于：</h4>
          <RadioGroup onChange={this.metricChange} value={actOn}>
            {metricRadioButtons}
          </RadioGroup>
        </div>
        <div className={styles.body}>
          <div className={styles.list}>
            <ul>{columnValueList}</ul>
          </div>
          <div className={styles.picker}>
            <SketchPicker
              className="sketchpickerinpanel"
              color={selected.color}
              presetColors={defaultThemeColors}
              onChangeComplete={this.colorChange}
              disableAlpha
            />
          </div>
        </div>
        <div className={styles.footer}>
          <Button type="primary" onClick={this.saveConfig}>保存</Button>
          <Button onClick={onCancel}>取消</Button>
        </div>
      </div>
    )
  }
}

export default ColorSettingForm
