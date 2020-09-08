import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import classnames from 'classnames'
import styles from './Avatar.less'
const logo = require('assets/images/profile.png')
import { Modal, Spin } from 'antd'
import { IAvatarProps, TSize, TImageState } from './types'
import { useIntersectionObserver } from './useIntersectionObserver'

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
  const [status, setStatus] = useState<TImageState>('loading')
  const loading = useMemo(() => {
    return size === 'profile' ? (
      <Spin size="large" />
    ) : (
      <Spin size={size as TSize} />
    )
  }, [size, status])

  const showEnlarge = useCallback(() => {
    setFormVisible(true)
  }, [formVisible])

  const hideEnlarge = useCallback(() => {
    setFormVisible(false)
  }, [formVisible])

  const itemClass = useMemo(() => {
    return classnames({
      [styles.isEnlarge]: enlarge,
      [styles.large]: size === 'large',
      [styles.small]: size === 'small',
      [styles.profile]: size === 'profile',
      [styles.default]: size === 'default',
      [styles.height0]: status === 'loading',
      [styles.height1]: status !== 'loading'
    })
  }, [size, enlarge, status])

  const imgContent = useMemo(() => {
    const img = enlarge ? (
      <img className={itemClass} ref={elementRef} onClick={showEnlarge} />
    ) : (
      <img className={itemClass} ref={elementRef} />
    )
    return (
      <>
        {status === 'loading' ? loading : ''}
        {img}
      </>
    )
  }, [enlarge, showEnlarge, status])

  const wrapper = useMemo(() => {
    return classnames({
      [styles.profileWrapper]: size === 'profile',
      [styles.defaultWrapper]: size === 'default',
      [styles.smallWrapper]: size === 'small',
      [styles.largeWrapper]: size === 'large',
      [styles.border]: border
    })
  }, [size])

  const loaded = useCallback(() => {
    if (logo !== elementRef.current.src) {
      setStatus('loaded')
    }
  }, [status])

  const loadFail = useCallback(() => {
    elementRef.current.src = logo
    setStatus('loadFail')
  }, [status])

  useEffect(() => {
    if (!inView) {
      return
    }
    if (!elementRef.current.src) {
      elementRef.current.src = path
    }
    elementRef.current.addEventListener('load', loaded, false)
    elementRef.current.addEventListener('error', loadFail, false)

    return () => {
      elementRef.current.removeEventListener('load', loaded)
      elementRef.current.removeEventListener('error', loadFail)
    }
  }, [inView, status])

  const modalSrc = useMemo(() => {
    return status === 'loaded' ? path : logo
  }, [path, status])

  return (
    <div className={wrapper}>
      {imgContent}
      <Modal
        title={null}
        footer={null}
        visible={formVisible}
        onCancel={hideEnlarge}
      >
        <img src={modalSrc} className={styles.sourceSrc} />
      </Modal>
    </div>
  )
}

export default Avatar
