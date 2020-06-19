import { IStarUser } from 'containers/Projects/types'
export interface IStar {
  proId: number
  isStar: boolean
  starNum: number
  unStar?: (id: number) => any
  userList?: (id: number) => any
  starUser?: IStarUser[]
}

export interface IStarUserList {
  visible: boolean
  starUser: IStarUser[]
  closeUserListModal: () => void
}

export type IEvent = React.MouseEvent<HTMLElement>
