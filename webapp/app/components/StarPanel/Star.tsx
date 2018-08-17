import * as React from 'react'
const styles = require('./Star.less')
interface IStar {
  d?: {isLike?: boolean}
}

export class Star extends React.PureComponent <IStar> {
  public render () {
    const {d} = this.props
    return (
      <div className={styles.starWrapper}>
        <span className={styles.leftWrapper}>
          <span className={`iconfont ${d && d.isLike ? 'icon-star1' : 'icon-star'}`} style={{fontSize: '12px'}}/>&nbsp;
          <span>{d && d.isLike ? 'like' : 'Unlike'}</span>
        </span>
        <span className={styles.starCount}>
          1000
        </span>
      </div>
    )
  }
}

export default Star
