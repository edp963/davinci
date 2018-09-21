import * as React from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'
import reducer from '../Organizations/reducer'
import saga from '../Organizations/sagas'
import reducerTeam from '../Teams/reducer'
import sagaTeam from '../Teams/sagas'
import Avatar from '../../components/Avatar'
import Box from '../../components/Box'
import Menus from './components/Menus'
const Tooltip = require('antd/lib/tooltip')
import {createStructuredSelector} from 'reselect'
import {makeSelectLoginUser} from '../App/selectors'

interface IAccountProps {
  loginUser: any,
  routes: any
}

const styles = require('./Account.less')
export class Account extends React.PureComponent<IAccountProps, {}> {
    public render () {
      const { loginUser, routes } = this.props
      return (
        <div className={styles.wrapper}>
          <div className={styles.container}>
            <div className={styles.sidebar}>
              <div className={styles.user}>
                <Box>
                  <div className={styles.userWrap}>
                    <div className={styles.userAvatar}>
                      <Avatar size="profile" path={`${loginUser.avatar}`} enlarge={true}/>
                    </div>
                    <div className={styles.userItems}>
                      <div className={styles.userName}>{loginUser.username}</div>
                      <Tooltip placement="bottomLeft" title={loginUser.email}>
                        <div className={styles.userDesc}>{loginUser.email}</div>
                      </Tooltip>
                    </div>
                  </div>
                  <div className={styles.menu}>
                    <Menus
                      active={routes[3]['name']}
                    />
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

// export default connect<{}, {}, IAccountProps>(mapStateToProps, null)(Account)


const withConnect = connect(mapStateToProps, null)

const withReducer = injectReducer({ key: 'organization', reducer })
const withSaga = injectSaga({ key: 'organization', saga })

const withTeamReducer = injectReducer({ key: 'team', reducer: reducerTeam})
const withTeamSaga = injectSaga({ key: 'team', saga: sagaTeam})

export default compose(
  withReducer,
  withTeamReducer,
  withTeamSaga,
  withSaga,
  withConnect
)(Account)


