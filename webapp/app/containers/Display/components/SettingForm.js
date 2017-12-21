import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import Form from 'antd/lib/form'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import InputNumber from 'antd/lib/input-number'
import Radio from 'antd/lib/radio'
import Upload from 'antd/lib/upload'
import Icon from 'antd/lib/icon'
const FormItem = Form.Item
const RadioGroup = Radio.Group

import styles from '../Display.less'

export class SettingForm extends PureComponent {
  changeWidth = (val) => {
    this.props.onDisplaySizeChange(parseInt(val), this.props.screenHeight)
  }

  changeHeight = (val) => {
    this.props.onDisplaySizeChange(this.props.screenWidth, parseInt(val))
  }

  render () {
    const {
      form,
      screenWidth,
      screenHeight,
      scale,
      gridDistance,
      onDisplayScaleChange,
      onGridDistanceChange
    } = this.props
    const { getFieldDecorator } = form

    return (
      <Form>
        <h2 className={styles.formTitle}>背景设置</h2>
        <h3 className={styles.formBlockTitle}>屏幕尺寸</h3>
        <Row gutter={16} className={styles.formBlock}>
          <Col span={12}>
            <FormItem label="宽度(像素)" className={styles.formItem}>
              {getFieldDecorator('screenWidth', {
                initialValue: screenWidth
              })(
                <InputNumber
                  className={styles.inputNumber}
                  min={300}
                  onChange={this.changeWidth}
                />
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="高度(像素)" className={styles.formItem}>
              {getFieldDecorator('screenHeight', {
                initialValue: screenHeight
              })(
                <InputNumber
                  className={styles.inputNumber}
                  min={300}
                  onChange={this.changeHeight}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <h3 className={styles.formBlockTitle}>缩放方式</h3>
        <Row gutter={16} className={styles.formBlock}>
          <Col span={24}>
            <FormItem className={styles.formItem}>
              {getFieldDecorator('scale', {
                initialValue: scale
              })(
                <RadioGroup onChange={onDisplayScaleChange}>
                  <Radio value="auto">自动缩放</Radio>
                  <Radio value="actual">实际尺寸</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </Col>
        </Row>
        <h3 className={styles.formBlockTitle}>栅格间距</h3>
        <Row gutter={16} className={styles.formBlock}>
          <Col span={12}>
            <FormItem className={styles.formItem}>
              {getFieldDecorator('gridDistance', {
                initialValue: gridDistance
              })(
                <InputNumber min={1} onChange={onGridDistanceChange} />
              )}
            </FormItem>
          </Col>
        </Row>
        <h3 className={styles.formBlockTitle}>背景图片</h3>
        <Row gutter={16} className={styles.formBlock}>
          <Col span={24}>
            <Upload
              className={styles.upload}
              name="background"
            >
              <Icon type="plus" />
            </Upload>
          </Col>
        </Row>
        <h3 className={styles.formBlockTitle}>截取封面</h3>
        <Row gutter={16} className={styles.formBlock}>
          <Col span={24}>
            <Upload
              className={styles.upload}
              name="cover"
            >
              <Icon type="plus" />
            </Upload>
          </Col>
        </Row>
      </Form>
    )
  }
}

SettingForm.propTypes = {
  form: PropTypes.any,
  screenWidth: PropTypes.number,
  screenHeight: PropTypes.number,
  scale: PropTypes.string,
  gridDistance: PropTypes.number,
  onDisplaySizeChange: PropTypes.func,
  onDisplayScaleChange: PropTypes.func,
  onGridDistanceChange: PropTypes.func
}

export default Form.create()(SettingForm)
