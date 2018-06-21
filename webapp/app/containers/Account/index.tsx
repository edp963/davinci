import * as React from 'react'
import Box from '../../components/Box'
import Menus from './components/Menus'


const styles = require('./Account.less')
export class Account extends React.PureComponent<{}, {}> {
    public render () {
        return (
          <div className={styles.wrapper}>
            <div className={styles.container}>
              <div className={styles.sidebar}>
                <div className={styles.user}>
                  <Box>
                    <div className={styles.userWrap}>
                      <div className={styles.userAvatar}/>
                      <div className={styles.userItems}>
                        <div className={styles.userName}>hanruan</div>
                        <div className={styles.userDesc}>2856197796@qq.com</div>
                      </div>
                    </div>
                    <div className={styles.menu}>
                      <Menus/>
                    </div>
                  </Box>
                </div>
              </div>
              <div className={styles.content}>
                {this.props.children}
              </div>
            </div>
          </div>
        )
    }
}

export default Account



