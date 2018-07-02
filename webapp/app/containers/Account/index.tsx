import * as React from 'react'
import { connect } from 'react-redux'
import Avatar from '../../components/Avatar'
import Box from '../../components/Box'
import Menus from './components/Menus'
import {createStructuredSelector} from 'reselect'
import {makeSelectLoginUser} from '../App/selectors'

interface IAccountProps {
  loginUser: any
}

const styles = require('./Account.less')
export class Account extends React.PureComponent<IAccountProps, {}> {
    public render () {
      const { loginUser } = this.props
      return (
        <div className={styles.wrapper}>
          <div className={styles.container}>
            <div className={styles.sidebar}>
              <div className={styles.user}>
                <Box>
                  <div className={styles.userWrap}>
                    <div className={styles.userAvatar}>
                      <Avatar size="default" path={loginUser.avatar} enlarge={true}/>
                    </div>
                    <div className={styles.userItems}>
                      <div className={styles.userName}>{loginUser.username}</div>
                      <div className={styles.userDesc}>{loginUser.email}</div>
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

const mapStateToProps = createStructuredSelector({
  loginUser: makeSelectLoginUser()
})

export default connect<{}, {}, IAccountProps>(mapStateToProps, null)(Account)





