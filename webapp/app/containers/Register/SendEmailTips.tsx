import React from 'react'
const styles = require('./register.less')
import { Icon } from 'antd'

interface ISendEmailTipsProps {
  email?: string
  goBack: () => any
  sendEmailOnceMore: () => any
}

export class SendEmailTips extends React.PureComponent<ISendEmailTipsProps, {}> {
  private goEmailNet = () => {
    const { email } = this.props
    let suffixNet = ''
    if (email) {
      suffixNet = email.split('@')[1]
      const net = email.indexOf('creditease') > 0 ? `https://email.${suffixNet}` : `https://mail.${suffixNet}`
      window.open(net)
    }
  }
  public render () {
      const { email } = this.props
      return (
          <div className={styles.content}>
              <h1>请查收电子邮件</h1>
              <p>我们向 <b>{email}</b> 发送了一封电子邮件，请<b><a onClick={this.goEmailNet}>前往</a></b>电子邮件中确认。</p>
              <p>没收到？ <a href="javascript:;" onClick={this.props.sendEmailOnceMore}>重新发送电子邮件</a></p>
              <div className={styles.back} onClick={this.props.goBack}>
                <Icon type="left-circle-o" /> 返回上一步
              </div>
          </div>
      )
  }
}

export default SendEmailTips

