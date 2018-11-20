import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as classNames from 'classnames'
import {createCSSTransform, createSVGTransform} from './utils/domFns'
import {canDragX, canDragY, createDraggableData, getBoundPosition} from './utils/positionFns'
import DraggableCore, {IControlPosition, IDraggableBounds, IDraggableCoreProps} from './DraggableCore'
import log from './utils/log'
import {DraggableEventHandler} from './utils/types'

interface IDraggableState {
  dragging: boolean,
  dragged: boolean,
  x: number, y: number,
  slackX: number, slackY: number,
  isElementSVG: boolean
}

export interface IDraggableProps extends IDraggableCoreProps {
  axis?: 'both' | 'x' | 'y' | 'none',
  bounds: IDraggableBounds | string | false,
  defaultClassName?: string,
  defaultClassNameDragging?: string,
  defaultClassNameDragged?: string,
  defaultPosition?: IControlPosition,
  position: IControlPosition,
}

//
// Define <Draggable>
//

export default class Draggable extends React.Component<IDraggableProps, Partial<IDraggableState>> {

  public static displayName = 'Draggable'

  public static defaultProps = {
    ...DraggableCore.defaultProps,
    axis: 'both',
    bounds: false,
    defaultClassName: 'react-draggable',
    defaultClassNameDragging: 'react-draggable-dragging',
    defaultClassNameDragged: 'react-draggable-dragged',
    defaultPosition: {x: 0, y: 0},
    position: null
  }

  public constructor (props: IDraggableProps) {
    super(props)

    this.state = {
      // Whether or not we are currently dragging.
      dragging: false,

      // Whether or not we have been dragged before.
      dragged: false,

      // Current transform x and y.
      x: props.position ? props.position.x : props.defaultPosition.x,
      y: props.position ? props.position.y : props.defaultPosition.y,

      // Used for compensating for out-of-bounds drags
      slackX: 0, slackY: 0,

      // Can only determine if SVG after mounting
      isElementSVG: false
    }
  }

  public componentWillMount () {
    if (this.props.position && !(this.props.onDrag || this.props.onStop)) {
      // eslint-disable-next-line
      console.warn('A `position` was applied to this <Draggable>, without drag handlers. This will make this ' +
        'component effectively undraggable. Please attach `onDrag` or `onStop` handlers so you can adjust the ' +
        '`position` of this element.')
    }
  }

  public componentDidMount () {
    // Check to see if the element passed is an instanceof SVGElement
    if (typeof (window as any).SVGElement !== 'undefined' && ReactDOM.findDOMNode(this) instanceof SVGElement) {
      this.setState({ isElementSVG: true })
    }
  }

  public componentWillReceiveProps (nextProps: IDraggableProps) {
    // Set x/y if position has changed
    if (nextProps.position &&
        (!this.props.position ||
          nextProps.position.x !== this.props.position.x ||
          nextProps.position.y !== this.props.position.y
        )
      ) {
      this.setState({ x: nextProps.position.x, y: nextProps.position.y })
    }
  }

  public componentWillUnmount () {
    this.setState({dragging: false}) // prevents invariant if unmounted while dragging
  }

  private onDragStart: DraggableEventHandler = (e, coreData) => {
    log('Draggable: onDragStart: %j', coreData)

    // Short-circuit if user's callback killed it.
    const shouldStart = this.props.onStart(e, createDraggableData(this, coreData))
    // Kills start event on core as well, so move handlers are never bound.
    if (shouldStart === false) {
      return false
    }

    this.setState({dragging: true, dragged: true})
  }

  private onDrag: DraggableEventHandler = (e, coreData) => {
    if (!this.state.dragging) {
      return false
    }
    log('Draggable: onDrag: %j', coreData)

    const uiData = createDraggableData(this, coreData)

    const newState: Partial<IDraggableState> = {
      x: uiData.x,
      y: uiData.y
    }

    // Keep within bounds.
    if (this.props.bounds) {
      // Save original x and y.
      const {x, y} = newState

      // Add slack to the values used to calculate bound position. This will ensure that if
      // we start removing slack, the element won't react to it right away until it's been
      // completely removed.
      newState.x += this.state.slackX
      newState.y += this.state.slackY

      // Get bound position. This will ceil/floor the x and y within the boundaries.
      const [newStateX, newStateY] = getBoundPosition(this, newState.x, newState.y)
      newState.x = newStateX
      newState.y = newStateY

      // Recalculate slack by noting how much was shaved by the boundPosition handler.
      newState.slackX = this.state.slackX + (x - newState.x)
      newState.slackY = this.state.slackY + (y - newState.y)

      // Update the event we fire to reflect what really happened after bounds took effect.
      uiData.x = newState.x
      uiData.y = newState.y
      uiData.deltaX = newState.x - this.state.x
      uiData.deltaY = newState.y - this.state.y
    }

    // Short-circuit if user's callback killed it.
    const shouldUpdate = this.props.onDrag(e, uiData)
    if (shouldUpdate === false) {
      return false
    }

    this.setState({
      ...newState
    })
  }

  private onDragStop: DraggableEventHandler = (e, coreData) => {
    if (!this.state.dragging) {
      return false
    }

    // Short-circuit if user's callback killed it.
    const shouldStop = this.props.onStop(e, createDraggableData(this, coreData))
    if (shouldStop === false) {
      return false
    }

    log('Draggable: onDragStop: %j', coreData)

    const newState: Partial<IDraggableState> = {
      dragging: false,
      slackX: 0,
      slackY: 0
    }

    // If this is a controlled component, the result of this operation will be to
    // revert back to the old position. We expect a handler on `onDragStop`, at the least.
    const controlled = Boolean(this.props.position)
    if (controlled) {
      const {x, y} = this.props.position
      newState.x = x
      newState.y = y
    }

    this.setState(newState)
  }

  public render () {
    let style = {}
    let svgTransform = null

    // If this is controlled, we don't want to move it - unless it's dragging.
    const controlled = Boolean(this.props.position)
    // const draggable = !controlled || this.state.dragging // FIXME fixed
    const draggable = !controlled

    const position = this.props.position || this.props.defaultPosition
    const transformOpts = {
      // Set left if horizontal drag is enabled
      x: canDragX(this) && draggable ?
        this.state.x :
        position.x,

      // Set top if vertical drag is enabled
      y: canDragY(this) && draggable ?
        this.state.y :
        position.y
    }

    // If this element was SVG, we use the `transform` attribute.
    if (this.state.isElementSVG) {
      svgTransform = createSVGTransform(transformOpts)
    } else {
      // Add a CSS transform to move the element around. This allows us to move the element around
      // without worrying about whether or not it is relatively or absolutely positioned.
      // If the item you are dragging already has a transform set, wrap it in a <span> so <Draggable>
      // has a clean slate.
      style = createCSSTransform(transformOpts)
    }

    const {
      defaultClassName,
      defaultClassNameDragging,
      defaultClassNameDragged
    } = this.props

    const children = React.Children.only(this.props.children)

    // Mark with class while dragging
    const className = classNames((children.props.className || ''), defaultClassName, {
      [defaultClassNameDragging]: this.state.dragging,
      [defaultClassNameDragged]: this.state.dragged
    })

    // Reuse the child provided
    // This makes it flexible to use whatever element is wanted (div, ul, etc)
    return (
      <DraggableCore
        {...this.props}
        onStart={this.onDragStart}
        onDrag={this.onDrag}
        onStop={this.onDragStop}
      >
        {React.cloneElement(children, {
          className,
          style: {...children.props.style, ...style},
          transform: svgTransform
        })}
      </DraggableCore>
    )
  }
}
