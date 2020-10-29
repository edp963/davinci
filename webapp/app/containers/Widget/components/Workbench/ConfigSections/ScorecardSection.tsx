
import React from 'react'
import { Row, Col, Input, Checkbox, Select } from 'antd'
const Option = Select.Option
import ColorPicker from 'components/ColorPicker'
import {
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_CHART_LINE_STYLES,
  PIVOT_CHART_FONT_SIZES,
  CHART_LABEL_POSITIONS,
  CHART_PIE_LABEL_POSITIONS,
  CHART_FUNNEL_LABEL_POSITIONS
} from 'app/globalConstants'
const styles = require('../Workbench.less')

export interface IScorecardConfig {
  headerVisible: boolean
  headerColor: string
  headerFontFamily: string
  prefixHeader?: string
  suffixHeader?: string
  prefixHeaderColor: string
  prefixHeaderFontFamily: string
  suffixHeaderColor: string
  suffixHeaderFontFamily: string

  contentVisible: boolean
  contentColor: string
  contentFontFamily: string
  prefixContent?: string
  suffixContent?: string
  prefixContentColor?: string
  prefixContentFontFamily: string
  suffixContentColor?: string
  suffixContentFontFamily: string

  footerVisible: boolean
  footerColor: string
  footerFontFamily: string
  prefixFooter?: string
  suffixFooter?: string
  prefixFooterColor?: string
  prefixFooterFontFamily: string
  suffixFooterColor?: string
  suffixFooterFontFamily: string

  fontSizeFixed: boolean
  fontSizeMain: string
  fontSizeSub: string
}

interface IScorecardSectionProps {
  title: string
  config: IScorecardConfig
  onChange: (prop: string, value: any) => void
}

export class ScorecardSection extends React.PureComponent<IScorecardSectionProps, {}> {

  private inputChange = (prop) => (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onChange(prop, e.target.value)
  }

  private checkboxChange = (prop) => (e) => {
    this.props.onChange(prop, e.target.checked)
  }

  private selectChange = (prop) => (value) => {
    this.props.onChange(prop, value)
  }

  private colorChange = (prop) => (color) => {
    this.props.onChange(prop, color)
  }

  private static FontFamilies = PIVOT_CHART_FONT_FAMILIES.map((f) => (
    <Option key={f.value} value={f.value}>{f.name}</Option>
  ))

  private static FontSizes = PIVOT_CHART_FONT_SIZES.map((f) => (
    <Option key={f} value={`${f}`}>{f}</Option>
  ))

  public render () {
    const { title, config } = this.props

    const {
      headerVisible,
      headerColor,
      headerFontFamily,
      prefixHeader,
      suffixHeader,
      prefixHeaderColor,
      prefixHeaderFontFamily,
      suffixHeaderColor,
      suffixHeaderFontFamily,

      contentVisible,
      contentColor,
      contentFontFamily,
      prefixContent,
      suffixContent,
      prefixContentColor,
      prefixContentFontFamily,
      suffixContentColor,
      suffixContentFontFamily,

      footerVisible,
      footerColor,
      footerFontFamily,
      prefixFooter,
      suffixFooter,
      prefixFooterColor,
      prefixFooterFontFamily,
      suffixFooterColor,
      suffixFooterFontFamily,

      fontSizeFixed,
      fontSizeMain,
      fontSizeSub
    } = config

    return (
      <div className={styles.paneBlock}>
        <h4>{title}</h4>
        <div className={styles.blockBody}>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={24}>头部配置</Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={10}>
              <Checkbox
                checked={headerVisible}
                onChange={this.checkboxChange('headerVisible')}
              >
                指标可见
              </Checkbox>
            </Col>
            <Col span={10}>
              <Select
                placeholder="字体"
                className={styles.blockElm}
                value={headerFontFamily}
                onChange={this.selectChange('headerFontFamily')}
              >
                {ScorecardSection.FontFamilies}
              </Select>
            </Col>
            <Col span={4}>
              <ColorPicker
                value={headerColor}
                onChange={this.colorChange('headerColor')}
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={10}><Input onChange={this.inputChange('prefixHeader')} placeholder="前缀" value={prefixHeader}/></Col>
            <Col span={10}>
              <Select
                placeholder="字体"
                className={styles.blockElm}
                value={prefixHeaderFontFamily}
                onChange={this.selectChange('prefixHeaderFontFamily')}
              >
                {ScorecardSection.FontFamilies}
              </Select>
            </Col>
            <Col span={4}>
              <ColorPicker
                value={prefixHeaderColor}
                onChange={this.colorChange('prefixHeaderColor')}
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={10}><Input onChange={this.inputChange('suffixHeader')} placeholder="后缀" value={suffixHeader}/></Col>
            <Col span={10}>
              <Select
                placeholder="字体"
                className={styles.blockElm}
                value={suffixHeaderFontFamily}
                onChange={this.selectChange('suffixHeaderFontFamily')}
              >
                {ScorecardSection.FontFamilies}
              </Select>
            </Col>
            <Col span={4}>
              <ColorPicker
                value={suffixHeaderColor}
                onChange={this.colorChange('suffixHeaderColor')}
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={24}>主体配置</Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={10}>
              <Checkbox
                checked={contentVisible}
                onChange={this.checkboxChange('contentVisible')}
              >
                指标可见
              </Checkbox>
            </Col>
            <Col span={10}>
              <Select
                placeholder="字体"
                className={styles.blockElm}
                value={contentFontFamily}
                onChange={this.selectChange('contentFontFamily')}
              >
                {ScorecardSection.FontFamilies}
              </Select>
            </Col>
            <Col span={4}>
              <ColorPicker
                value={contentColor}
                onChange={this.colorChange('contentColor')}
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={10}><Input onChange={this.inputChange('prefixContent')} placeholder="前缀" value={prefixContent}/></Col>
            <Col span={10}>
              <Select
                placeholder="字体"
                className={styles.blockElm}
                value={prefixContentFontFamily}
                onChange={this.selectChange('prefixContentFontFamily')}
              >
                {ScorecardSection.FontFamilies}
              </Select>
            </Col>
            <Col span={4}>
              <ColorPicker
                value={prefixContentColor}
                onChange={this.colorChange('prefixContentColor')}
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={10}><Input onChange={this.inputChange('suffixContent')} placeholder="后缀" value={suffixContent}/></Col>
            <Col span={10}>
              <Select
                placeholder="字体"
                className={styles.blockElm}
                value={suffixContentFontFamily}
                onChange={this.selectChange('suffixContentFontFamily')}
              >
                {ScorecardSection.FontFamilies}
              </Select>
            </Col>
            <Col span={4}>
              <ColorPicker
                value={suffixContentColor}
                onChange={this.colorChange('suffixContentColor')}
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={24}>尾部配置</Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={10}>
              <Checkbox
                checked={footerVisible}
                onChange={this.checkboxChange('footerVisible')}
              >
                指标可见
              </Checkbox>
            </Col>
            <Col span={10}>
              <Select
                placeholder="字体"
                className={styles.blockElm}
                value={footerFontFamily}
                onChange={this.selectChange('footerFontFamily')}
              >
                {ScorecardSection.FontFamilies}
              </Select>
            </Col>
            <Col span={4}>
              <ColorPicker
                value={footerColor}
                onChange={this.colorChange('footerColor')}
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={10}><Input onChange={this.inputChange('prefixFooter')} placeholder="前缀" value={prefixFooter}/></Col>
            <Col span={10}>
              <Select
                placeholder="字体"
                className={styles.blockElm}
                value={prefixFooterFontFamily}
                onChange={this.selectChange('prefixFooterFontFamily')}
              >
                {ScorecardSection.FontFamilies}
              </Select>
            </Col>
            <Col span={4}>
              <ColorPicker
                value={prefixFooterColor}
                onChange={this.colorChange('prefixFooterColor')}
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={10}><Input onChange={this.inputChange('suffixFooter')} placeholder="后缀" value={suffixFooter}/></Col>
            <Col span={10}>
              <Select
                placeholder="字体"
                className={styles.blockElm}
                value={suffixFooterFontFamily}
                onChange={this.selectChange('suffixFooterFontFamily')}
              >
                {ScorecardSection.FontFamilies}
              </Select>
            </Col>
            <Col span={4}>
              <ColorPicker
                value={suffixFooterColor}
                onChange={this.colorChange('suffixFooterColor')}
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={24}>字体大小配置</Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={12}>
              <Checkbox
                checked={fontSizeFixed}
                onChange={this.checkboxChange('fontSizeFixed')}
              >
                固定字体大小
              </Checkbox>
            </Col>
          </Row>
          {
            !fontSizeFixed ? null : (
              <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                <Col span={12}>主体字体大小</Col>
                <Col span={10}>
                  <Select
                    placeholder="文字大小"
                    className={styles.blockElm}
                    value={fontSizeMain}
                    onChange={this.selectChange('fontSizeMain')}
                  >
                    {ScorecardSection.FontSizes}
                  </Select>
                </Col>
              </Row>
            )
          }
          {
            !fontSizeFixed ? null : (
              <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                <Col span={12}>辅助字体大小</Col>
                <Col span={10}>
                  <Select
                    placeholder="文字大小"
                    className={styles.blockElm}
                    value={fontSizeSub}
                    onChange={this.selectChange('fontSizeSub')}
                  >
                    {ScorecardSection.FontSizes}
                  </Select>
                </Col>
              </Row>
            )
          }
        </div>
      </div>
    )
  }
}

export default ScorecardSection
