import * as React from 'react'
import api from 'utils/api'

const Form = require('antd/lib/form')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Upload = require('antd/lib/upload')
const Icon = require('antd/lib/icon')
const FormItem = Form.Item
const Button = require('antd/lib/button')

const styles = require('../Display.less')

interface IDisplaySettingProps {
  display: any
  onCoverCut: () => void
  onCoverUploaded: (path: string) => void
}

interface IDisplaySettingStates {
  loading: boolean
}

export class DisplaySetting extends React.PureComponent<IDisplaySettingProps, IDisplaySettingStates> {

  private static readonly uploadUrl = `${api.display}/upload/coverImage`

  constructor (props) {
    super(props)
    this.state = { loading: false }
  }

  private onChange = (info) => {
    const { status, response } = info.file
    if (status === 'uploading') {
      this.setState({ loading: true })
      return
    }
    if (status === 'done') {
      this.setState({ loading: false }, () => {
        const path = response.payload
        const { onCoverUploaded } = this.props
        onCoverUploaded(path)
      })
    }
  }

  public render () {
    const { display, onCoverCut } = this.props
    const { avatar, name } = display
    const tip = `${name} 封面`
    const headers = {
      authorization: `Bearer ${localStorage.getItem('TOKEN')}`
    }
    const formItemlayout =  {
      labelCol: {
        xs: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 }
      }
    }

    return (
      <Row gutter={16} className={styles.formBlock} key="coverImage">
        <Col span={24}>
          <h3 className={styles.formBlockTitle}>封面</h3>
        </Col>
        <Col span={24}>
          <Button onClick={onCoverCut}>截取封面</Button>
        </Col>
        <Col span={24}>
          <FormItem label="封面图片" {...formItemlayout}>
            <Upload
              className={styles.upload}
              name="coverImage"
              disabled={true}
              action={DisplaySetting.uploadUrl}
              headers={headers}
              onChange={this.onChange}
            >
              {avatar ? (
                <div className={styles.img}>
                  <img src={avatar} alt={tip}/>
                </div>
              ) : <Icon type="plus" />}
            </Upload>
          </FormItem>
        </Col>
      </Row>
    )
  }
}

export default DisplaySetting
