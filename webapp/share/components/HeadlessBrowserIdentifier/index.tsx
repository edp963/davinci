import React from 'react'

interface IHeadlessBrowserIdentifierProps {
  renderSign: boolean
  parentNode: HTMLElement
}

function HeadlessBrowserIdentifier (props: IHeadlessBrowserIdentifierProps) {
  if (!props.renderSign) {
    return (
      <span />
    )
  } else {
    const { offsetWidth, offsetHeight } = props.parentNode
    return (
      <>
        <input id="headlessBrowserRenderSign" type="hidden" />
        <input id="width" type="hidden" value={offsetWidth} />
        <input id="height" type="hidden" value={offsetHeight} />
      </>
    )
  }
}


export default HeadlessBrowserIdentifier
