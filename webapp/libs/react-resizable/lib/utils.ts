import React, { PropsWithChildren } from 'react'

// React.addons.cloneWithProps look-alike that merges style & className.
export function cloneElement(
  element: React.ReactElement<any>,
  props: PropsWithChildren<{ style?: React.CSSProperties; className?: string }>
): React.ReactElement<any> {
  if (props.style && element.props.style) {
    props.style = { ...element.props.style, ...props.style }
  }
  if (props.className && element.props.className) {
    props.className = `${element.props.className} ${props.className}`
  }
  return React.cloneElement(element, props)
}
