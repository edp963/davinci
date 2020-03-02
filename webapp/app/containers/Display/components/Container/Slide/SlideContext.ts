import React from 'react'

import { ISlideParams } from 'containers/Viz/types'

export type SlideContextValue = {
  slideId: number
  slideParams: ISlideParams
}

export const SlideContext = React.createContext<SlideContextValue>({
  slideId: 0,
  slideParams: null
})
