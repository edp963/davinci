import * as React from 'react'
const styles = require('./register.less')

interface ISendEmailTipsProps {
    username?: string
}

export class SendEmailTips extends React.PureComponent<{}, ISendEmailTipsProps> {
    public render () {
        const { username } = this.props
        return (
            <div className={styles.content}>
                <h1>请查收电子邮件</h1>
                <p>我们向 <b>{ username }</b> 发送了一封电子邮件，请<b><a>前往</a></b>电子邮件中确认。</p>
                <p>没收到？ <a href="javascript:;">重新发送电子邮件</a></p>
            </div>
        )
    }
}

export default SendEmailTips