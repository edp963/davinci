import React from 'react'

interface IVideoProps {
  src: string
  autoPlay?: boolean
  loop?: boolean
  controls?: boolean
  start?: number
  end?: number
}

export class Video extends React.PureComponent<IVideoProps, {}> {

  public render () {
    const { src, autoPlay, loop, controls, start, end } = this.props
    let srcWithParams = src
    if (srcWithParams && (start || end)) {
      srcWithParams = `${srcWithParams}#t=${start ? start : 0}`
      if (end) {
        srcWithParams = `${srcWithParams},${end}`
      }
    }
    return (
      <video
        // crossOrigin=""
        src={srcWithParams}
        preload="auto"
        autoPlay={autoPlay}
        loop={loop}
        controls={controls}
      >
        你的浏览器不支持 <code>video</code> 标签.
      </video>
    )
  }
}

export default Video
