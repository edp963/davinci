import { IStarUser } from 'containers/Projects/types'
export interface IStar {
  proId: number
  isStar: boolean
  starNum: number
  unStar?: (id: number) => any
  userList?: (id: number) => any
  starUser?: IStarUser[]
}

export type IEvent = React.MouseEvent<HTMLElement>