import React, {Component as ReactComponent, ComponentClass, ReactInstance, RefObject} from 'react'
import {findDOMNode} from 'react-dom'
import {callAfterRepaint, echo, getSnapshot, introduce, replay, rewind, Snapshot} from './Onesec'

const withOnesec = (
  Component: ComponentClass<{onesecRef: RefObject<HTMLElement | ReactInstance>}>
) => {
  const OnesecComponent = class extends ReactComponent<any> {
    private onesecRef: RefObject<HTMLElement | ReactComponent>
    private prevSnapshot?: Snapshot

    constructor(props) {
      super(props)
      this.onesecRef = React.createRef()
    }

    componentDidMount() {
      introduce(this.getEl())
    }

    getSnapshotBeforeUpdate() {
      this.prevSnapshot = getSnapshot(this.getEl())
    }

    componentDidUpdate() {
      const el = this.getEl()
      rewind(el, this.prevSnapshot)
      callAfterRepaint(replay, undefined, el)
    }

    componentWillUnmount() {
      echo(this.getEl())
    }

    render() {
      return (
        <Component
          onesecRef={this.onesecRef}
          {...this.props}
        />
      );
    }

    private getEl(): HTMLElement {
      const {current} = this.onesecRef
      if (!current) {
        console.error('Ref could not be found for', this)
        return
      }
      if (current instanceof HTMLElement) {
        return current
      }
      // TODO: Re-consider if this case should be supported (when the user
      // attaches the ref to a `Component`).
      const el = findDOMNode(current) as HTMLElement
      if (!el) {
        console.error('Element could not be found for', this)
        return
      }
      return el
    }
  }

  // Rename the HOC based on the original component's name for convenient
  // debugging.
  Object.defineProperty(OnesecComponent, 'name', {
    value: 'Onesec' + Component.name
  })

  return OnesecComponent
}

export default withOnesec
