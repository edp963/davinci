import React, { ReactNode, SyntheticEvent } from 'react'
import { DraggableCore, DraggableData, DraggableEvent } from 'react-draggable'
import { cloneElement } from './utils'

import { ResizableProps, ResizeHandle } from './types'

type ResizableState = {
  slackW: number
  slackH: number
}

export default class Resizable extends React.Component<
  ResizableProps,
  ResizableState
> {
  public static defaultProps: Partial<ResizableProps> = {
    handleSize: [20, 20],
    lockAspectRatio: false,
    axis: 'both',
    minConstraints: [20, 20],
    maxConstraints: [Infinity, Infinity],
    resizeHandles: ['se']
  }

  public state: Readonly<ResizableState> = {
    slackW: 0,
    slackH: 0
  }

  public lockAspectRatio(
    width: number,
    height: number,
    aspectRatio: number
  ): [number, number] {
    height = width / aspectRatio
    width = height * aspectRatio
    return [width, height]
  }

  // If you do this, be careful of constraints
  private runConstraints(width: number, height: number): [number, number] {
    const [min, max] = [this.props.minConstraints, this.props.maxConstraints]
    if (!min && !max) return [width, height]

    // Fit width & height to aspect ratio
    if (this.props.lockAspectRatio) {
      if (height === this.props.height) {
        const ratio = this.props.width / this.props.height
        height = width / ratio
        width = height * ratio
      } else {
        // Take into account vertical resize with N/S handles on locked aspect
        // ratio. Calculate the change height-first, instead of width-first
        const ratio = this.props.height / this.props.width
        width = height / ratio
        height = width * ratio
      }
    }

    const [oldW, oldH] = [width, height]

    // Add slack to the values used to calculate bound position. This will ensure that if
    // we start removing slack, the element won't react to it right away until it's been
    // completely removed.
    let { slackW, slackH } = this.state
    width += slackW
    height += slackH

    if (min) {
      width = Math.max(min[0], width)
      height = Math.max(min[1], height)
    }
    if (max) {
      width = Math.min(max[0], width)
      height = Math.min(max[1], height)
    }

    // If the numbers changed, we must have introduced some slack. Record it for the next iteration.
    slackW += oldW - width
    slackH += oldH - height
    if (slackW !== this.state.slackW || slackH !== this.state.slackH) {
      this.setState({ slackW, slackH })
    }

    return [width, height]
  }

  /**
   * Wrapper around drag events to provide more useful data.
   *
   * @private
   * @param {string} handlerName Handler name to wrap.
   * @param {ResizeHandle} axis
   * @returns Handler function.
   * @memberof Resizable
   */
  private resizeHandler(handlerName: string, axis: ResizeHandle) {
    return (
      e: DraggableEvent,
      { node, deltaX, deltaY }: DraggableData
    ) => {
      deltaX = Math.round(deltaX)
      deltaY = Math.round(deltaY)
      // Axis restrictions
      const canDragX =
        (this.props.axis === 'both' || this.props.axis === 'x') &&
        ['n', 's'].indexOf(axis) === -1
      const canDragY =
        (this.props.axis === 'both' || this.props.axis === 'y') &&
        ['e', 'w'].indexOf(axis) === -1

      // reverse delta if using top or left drag handles
      if (canDragX && axis[axis.length - 1] === 'w') {
        deltaX = -deltaX
      }
      if (canDragY && axis[0] === 'n') {
        deltaY = -deltaY
      }

      // Update w/h
      let width = this.props.width + (canDragX ? deltaX : 0)
      let height = this.props.height + (canDragY ? deltaY : 0)

      // Early return if no change
      const widthChanged = width !== this.props.width
      const heightChanged = height !== this.props.height
      if (handlerName === 'onResize' && !widthChanged && !heightChanged) return
      ;[width, height] = this.runConstraints(width, height)

      // Set the appropriate state for this handler.
      const { slackW, slackH } = this.state
      const newState: ResizableState = { slackW, slackH }
      if (handlerName === 'onResizeStart') {
        // nothing
      } else if (handlerName === 'onResizeStop') {
        newState.slackW = newState.slackH = 0
      } else {
        // Early return if no change after constraints
        if (width === this.props.width && height === this.props.height) return
      }

      const hasCb = typeof this.props[handlerName] === 'function'
      if (hasCb) {
        if (typeof (e as SyntheticEvent).persist === 'function')
          (e as SyntheticEvent).persist()
        this.setState(newState, () =>
          this.props[handlerName](e, {
            node,
            size: { width, height },
            handle: axis
          })
        )
      } else {
        this.setState(newState)
      }
    }
  }

  renderResizeHandle(resizeHandle: ResizeHandle): ReactNode {
    const { handle } = this.props
    if (handle) {
      if (typeof handle === 'function') {
        return handle(resizeHandle)
      }
      return handle
    }
    return (
      <span
        className={`react-resizable-handle react-resizable-handle-${resizeHandle}`}
      />
    )
  }

  public render() {
    // eslint-disable-next-line no-unused-vars
    const {
      children,
      draggableOpts,
      width,
      height,
      handle,
      handleSize,
      lockAspectRatio,
      axis,
      minConstraints,
      maxConstraints,
      onResize,
      onResizeStop,
      onResizeStart,
      resizeHandles,
      scale,
      ...p
    } = this.props

    const className = p.className
      ? `${p.className} react-resizable`
      : 'react-resizable'

    // What we're doing here is getting the child of this element, and cloning it with this element's props.
    // We are then defining its children as:
    // Its original children (resizable's child's children), and
    // A draggable handle.
    return cloneElement(children, {
      ...p,
      className,
      children: [
        children.props.children,
        resizeHandles.map((h) => (
          <DraggableCore
            {...draggableOpts}
            scale={scale}
            key={`resizableHandle-${h}`}
            onStop={this.resizeHandler('onResizeStop', h)}
            onStart={this.resizeHandler('onResizeStart', h)}
            onDrag={this.resizeHandler('onResize', h)}
          >
            {this.renderResizeHandle(h)}
          </DraggableCore>
        ))
      ]
    })
  }
}
