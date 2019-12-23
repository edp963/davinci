import React, {useState, useCallback} from 'react'
import { Modal, Row, Col } from 'antd'
import { IStarUser } from 'containers/Projects/types'
import { IStar, IEvent} from './type'
const styles = require('./Star.less')
import Avatar from 'components/Avatar'




function stopPPG (e: IEvent) {
  e.stopPropagation()
}

const Star: React.FC<IStar> = ({
  proId, 
  isStar,
  unStar,
  starNum,
  userList,
  starUser,
}) => {
  const [visible, setVisible] = useState(false)

  const toggleModal = useCallback((e: IEvent) => {
    stopPPG(e)
    setVisible(!visible)
  }, [visible]) 


  return (
    <div className={styles.starWrapper} onClick={stopPPG}>
      <span onClick={stopPPG}>
        <span className={styles.leftWrapper} onClick={unStar(proId)}>
        <span className={`iconfont ${isStar ? 'icon-star1' : 'icon-star'}`} style={{fontSize: '12px'}}/>&nbsp;
          <span>{isStar ? 'Unstar' : 'star'}</span>
        </span>
      </span>
      <span onClick={toggleModal}>
        <span className={styles.starCount} onClick={userList(proId)}>
          {starNum}
        </span>
      </span>
      <Modal
        title={null}
        visible={visible}
        footer={null}
        onCancel={toggleModal}
      >
        <div className={styles.formWrapper}>
          <div className={styles.header}>
            <div className={styles.title}>
              点赞用户
            </div>
          </div>
          <div className={styles.body}>
              {
                starUser ? starUser.map((user: IStarUser, index) => (
                  <div className={styles.avatar} key={`star${index}list`}>
                    <Avatar path={user.avatar} size="small" enlarge={true}/>
                    <p className={styles.title}>
                      {user.username}
                    </p>
                  </div>
                )) : ''
              }
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Star
