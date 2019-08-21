import * as React from 'react'
import * as classnames from 'classnames'
const styles = require('./Avatar.less')
const logo = require('assets/images/profile.png')
import { Modal } from 'antd'

interface IAvatarProps {
  path: string
  size?: string
  enlarge?: boolean
}
interface IAvatarState {
  formVisible: boolean
}
export class Avatar extends React.PureComponent<IAvatarProps, IAvatarState> {
  constructor (props) {
   super(props)
   this.state = {
     formVisible: false
   }
  }
  private showEnlarge = () => {
    this.setState({
      formVisible: true
    })
  }
  private hideEnlarge = () => {
    this.setState({
      formVisible: false
    })
  }
  public render () {
    const {path, size, enlarge} = this.props
    const {formVisible} = this.state
    const src = path ? path : logo

    const itemClass = classnames({
      [styles.img]: true,
      [styles.profile]: size === 'profile',
      [styles.large]: size === 'large',
      [styles.default]: size === 'default',
      [styles.small]: size === 'small',
      [styles.isEnlarge]: enlarge
    })

    const isEnlarge = enlarge
      ? <img className={itemClass} src={src} alt="" onClick={this.showEnlarge}/>
      : <img className={itemClass} src={src} alt=""/>

    const wrapper = classnames({
      [styles.enlargeAvatarWrapper]: size === 'large',
      [styles.avatarWrapper]: size === 'profile'
    })

    return (
      <div className={wrapper}>
        <div className={`${size === 'small' ? styles.imgWrapper : ''}`}>
          {isEnlarge}
        </div>
        <Modal
          title={null}
          footer={null}
          visible={formVisible}
          onCancel={this.hideEnlarge}
        >
          <img src={src} alt="" className={styles.sourceSrc}/>
        </Modal>
      </div>
    )
  }
}

export default Avatar

