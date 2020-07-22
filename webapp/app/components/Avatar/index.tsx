import  React, {useState, useCallback, useMemo} from 'react'
import * as classnames from 'classnames'
const styles = require('./Avatar.less')
const logo = require('assets/images/profile.png')
import { Modal } from 'antd'
import {IAvatarProps} from './type'

export const Avatar: React.FC<IAvatarProps> = ({
  path, size, enlarge
}) => {

  const [formVisible, setFormVisible] = useState(false)

  const showEnlarge =  useCallback(() => {
    setFormVisible(true)
  }, [formVisible])

  const hideEnlarge =   useCallback(() => {
    setFormVisible(false)
  }, [formVisible])


  const src = useMemo(() => path ? path : logo, [path])

  const itemClass =  useMemo(() => {
    return classnames({
      [styles.img]: true,
      [styles.profile]: size === 'profile',
      [styles.large]: size === 'large',
      [styles.default]: size === 'default',
      [styles.small]: size === 'small',
      [styles.isEnlarge]: enlarge
    })
  }, [size, enlarge])

  const isEnlarge = useMemo(() => {
    return enlarge
    ? <img className={itemClass} src={src} alt="" onClick={showEnlarge}/>
    : <img className={itemClass} src={src} alt=""/>
  }, [enlarge, showEnlarge])

  const wrapper = useMemo(() => {
    return classnames({
      [styles.enlargeAvatarWrapper]: size === 'large',
      [styles.avatarWrapper]: size === 'profile'
    })
  }, [size])

  return (
    <div className={wrapper}>
      <div className={`${size === 'small' ? styles.imgWrapper : ''}`}>
        {isEnlarge}
      </div>
      <Modal
        title={null}
        footer={null}
        visible={formVisible}
        onCancel={hideEnlarge}
      >
        <img src={src} alt="" className={styles.sourceSrc}/>
      </Modal>
    </div>
  )
}

export default Avatar

