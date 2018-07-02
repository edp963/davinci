import * as React from 'react'
import Avatar from '../Avatar'
const Button = require('antd/lib/button')
const styles = require('./UploadAvatar.less')

interface IUploadAvatar {
  path?: string
}
export class UploadAvatar extends React.PureComponent<{}, IUploadAvatar> {
  constructor (props) {
    super(props)
    this.state = {
      path: ''
    }
  }
  public render () {
    return (
      <div className={styles.avatar}>
        <Avatar path={this.state.path} size="large" enlarge={true}/>
        <div className={styles.uploadAvatar}>
          <div className={styles.uploadTitle}>上传新图像</div>
          <Button size="large">选择图片</Button>
          <p className={styles.uploadDesc}>图片大小不超过300kb</p>
        </div>
      </div>
    )
  }
}

export default UploadAvatar

