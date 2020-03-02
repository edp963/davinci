import React, { SyntheticEvent } from 'react'
import Resizable from './Resizable'
import { ResizableProps, ResizeCallbackData } from './types'

type ResizableBoxState = {
  width: number
  height: number
  propsWidth: number
  propsHeight: number
}

// An example use of Resizable.
export default class ResizableBox extends React.Component<
  ResizableProps,
  ResizableBoxState
> {
  public static defaultProps: Partial<ResizableProps> = {
    handleSize: [20, 20]
  }

  public state: Readonly<ResizableBoxState> = {
    width: this.props.width,
    height: this.props.height,
    propsWidth: this.props.width,
    propsHeight: this.props.height
  }

  static getDerivedStateFromProps(
    props: ResizableProps,
    state: ResizableBoxState
  ) {
    // If parent changes height/width, set that in our state.
    if (
      state.propsWidth !== props.width ||
      state.propsHeight !== props.height
    ) {
      return {
        width: props.width,
        height: props.height,
        propsWidth: props.width,
        propsHeight: props.height
      }
    }
    return {}
  }

  private onResize = (e: SyntheticEvent, data: ResizeCallbackData) => {
    const { size } = data

    if (this.props.onResize) {
      if (e.persist) {
        e.persist()
      }
      this.setState(
        size,
        () => this.props.onResize && this.props.onResize(e, data)
      )
    } else {
      this.setState(size)
    }
  }

  public render() {
    // Basic wrapper around a Resizable instance.
    // If you use Resizable directly, you are responsible for updating the child component
    // with a new width and height.
    const {
      handle,
      handleSize,
      onResize,
      onResizeStart,
      onResizeStop,
      draggableOpts,
      minConstraints,
      maxConstraints,
      lockAspectRatio,
      axis,
      width,
      height,
      scale,
      resizeHandles,
      ...props
    } = this.props

    return (
      <Resizable
        handle={handle}
        handleSize={handleSize}
        width={this.state.width}
        height={this.state.height}
        scale={scale}
        onResizeStart={onResizeStart}
        onResize={this.onResize}
        onResizeStop={onResizeStop}
        draggableOpts={draggableOpts}
        minConstraints={minConstraints}
        maxConstraints={maxConstraints}
        lockAspectRatio={lockAspectRatio}
        axis={axis}
        resizeHandles={resizeHandles}
      >
        <div
          style={{
            width: this.state.width + 'px',
            height: this.state.height + 'px'
          }}
          {...props}
        />
      </Resizable>
    )
  }
}
