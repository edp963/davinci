import * as React from 'react'
import { Modal, Row, Col } from 'antd'
import { IProject, IStarUser } from 'containers/Projects'
const styles = require('./Star.less')
import Avatar from 'components/Avatar'
import * as Organization from 'containers/Organizations/Organization'

interface IStar {
  unStar?: (id: number) => any
  userList?: (id: number) => any
  starUser?: IStarUser[]
  d?: {
    createBy?: { avatar?: string, id?: number, username?: string}
    isStar?: boolean
    type?: string
    name?: string
    id?: number
    description?: string
    pic?: string
    orgId?: number
    visibility?: boolean
    starNum?: number
  }
}


interface IStarState {
  visible: boolean
}
export class Star extends React.PureComponent <IStar, IStarState> {
  constructor (props) {
    super(props)
    this.state = {
      visible: false
    }
  }
  private stopPPG = (e) => {
    e.stopPropagation()
  }
  private show = (e) => {
    e.stopPropagation()
    this.setState({
      visible: true
    })
  }
  private hideModal = () => {
    this.setState({
      visible: false
    })
  }
  public render () {
    const {d, starUser} = this.props
    return (
      <div className={styles.starWrapper}>
        <span onClick={this.stopPPG}>
          <span className={styles.leftWrapper} onClick={this.props.unStar(d.id)}>
          <span className={`iconfont ${d && d.isStar ? 'icon-star1' : 'icon-star'}`} style={{fontSize: '12px'}}/>&nbsp;
            <span>{d && d.isStar ? 'Unstar' : 'star'}</span>
          </span>
        </span>
        <span onClick={this.show}>
          <span className={styles.starCount} onClick={this.props.userList(d.id)}>
            {d.starNum}
          </span>
        </span>
        <Modal
          title={null}
          width="760"
          visible={this.state.visible}
          footer={null}
          onCancel={this.hideModal}
        >
          <div className={styles.formWrapper}>
            <div className={styles.header}>
              <div className={styles.title}>
                点赞用户
              </div>
            </div>
            <div className={styles.body}>
              <ol>
                <Row>
                  {
                    starUser ? starUser.map((user: IStarUser, index) => (
                      <Col
                        xxl={12}
                        xl={12}
                        lg={12}
                        md={24}
                        sm={24}
                        key={user.id}
                      >
                        <li className={styles.userList} key={`star${index}list`}>
                          <div className={styles.orgHeader}>
                            <div className={styles.avatar}>
                              <Avatar path={user.avatar} size="small" enlarge={true}/>
                            </div>
                            <header className={styles.name}>
                              <h3 className={styles.title}>
                                {user.username}
                                {/*{editHint}*/}
                              </h3>
                              <p className={styles.content}>
                                点赞时间： {user.starTime}
                              </p>
                            </header>
                          </div>
                        </li>
                      </Col>
                    )) : ''
                  }
                </Row>
              </ol>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

export default Star
