import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import classnames from 'classnames'
const styles = require('./Avatar.less')
const logo = require('assets/images/profile.png')
const loading = require('assets/images/loading.gif')
import { Modal } from 'antd'
import { IAvatarProps } from './type'
import { useIntersectionObserver } from './useIntersectionObserver'
import { useImage } from './useImage'


export const Avatar: React.FC<IAvatarProps> = ({
  path,
  size,
  enlarge,
  border
}) => {
  const elementRef = useRef(null)
  const [formVisible, setFormVisible] = useState(false)
  const [inView, entry] = useIntersectionObserver(elementRef, {
    threshold: 0,
    rootMargin: '0%',
    root: null
  })
  const { image, status, error } = useImage(path)

  const showEnlarge = useCallback(() => {
    setFormVisible(true)
  }, [formVisible])

  const hideEnlarge = useCallback(() => {
    setFormVisible(false)
  }, [formVisible])

  const itemClass = useMemo(() => {
    return classnames({
      [styles.profile]: size === 'profile',
      [styles.default]: size === 'default',
      [styles.large]: size === 'large',
      [styles.small]: size === 'small',
      [styles.isEnlarge]: enlarge
    })
  }, [size, enlarge])

  const isEnlarge = useMemo(() => {
    return enlarge ? (
      <img className={itemClass} src={loading} ref={elementRef} onClick={showEnlarge} />
    ) : (
      <img className={itemClass} src={loading} ref={elementRef} />
    )
  }, [enlarge, showEnlarge])

  const wrapper = useMemo(() => {
    return classnames({
      [styles.profileWrapper]: size === 'profile',
      [styles.defaultWrapper]: size === 'default',
      [styles.smallWrapper]: size === 'small',
      [styles.largeWrapper]: size === 'large',
      [styles.border]: border
    })
  }, [size])

  useEffect(() => {
    if (!inView) {
      return
    }

    if (typeof(image) === 'string' && image.length && status === 'loaded') {
      elementRef.current.src = path
    }

    if (status === 'loadFail'){
      elementRef.current.src = logo
    }
  }, [inView, status, image])

  return (
    <div className={wrapper}>
      {isEnlarge}
      <Modal
        title={null}
        footer={null}
        visible={formVisible}
        onCancel={hideEnlarge}
      >
        <img src={path} className={styles.sourceSrc} />
      </Modal>
    </div>
  )
}

export default Avatar
