import * as React from 'react'
const Button = require('antd/lib/button')
const styles = require('./UploadAvatar.less')

export class UploadAvatar extends React.PureComponent {
  public render () {
    return (
      <div className={styles.avatar}>
        <img src={`${require('../../assets/images/bg3.png')}`} alt=""/>
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

