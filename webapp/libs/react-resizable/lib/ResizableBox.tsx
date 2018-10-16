import * as React from 'react'
import Resizable, {IResizableProps, IResizeCallbackData} from './Resizable'

interface IResizableBoxState {
  width: number,
  height: number
}

// An example use of Resizable.
export default class ResizableBox extends React.Component<IResizableProps, IResizableBoxState> {

  public static defaultProps = {
    handleSize: [20, 20]
  }

  public state: IResizableBoxState = {
    width: this.props.width,
    height: this.props.height
  }

  private onResize = (e, data: IResizeCallbackData) => {
    const {size} = data
    const {width, height} = size

    if (this.props.onResize) {
      if (e.persist) { e.persist() }
      this.setState(size, () => this.props.onResize && this.props.onResize(e, data))
    } else {
      this.setState(size)
    }
  }

  public componentWillReceiveProps (nextProps: IResizableProps) {
    if (nextProps.width !== this.props.width || nextProps.height !== this.props.height) {
      this.setState({
        width: nextProps.width,
        height: nextProps.height
      })
    }
  }

  public render () {
    // Basic wrapper around a Resizable instance.
    // If you use Resizable directly, you are responsible for updating the child component
    // with a new width and height.
    const {
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
      ...props  } = this.props

    return (
      <Resizable
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
      >
        <div style={{width: this.state.width + 'px', height: this.state.height + 'px'}} {...props} />
      </Resizable>
    )
  }
}
