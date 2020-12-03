import React, {Component, createRef, RefObject, useEffect, useLayoutEffect, useRef, useState} from 'react'
import {echo} from '../../lib/Onesec'

import './Echo.scss'

export const EchoManager = ({children}) => {
  const [show, setShow] = useState(true)

  // Store `show` so that the render loop can access it later.
  const showRef = useRef(show)
  useEffect(() => {showRef.current = show})

  // Start the render loop.
  useEffect(() => {
    setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setShow(!showRef.current)
      }, ECHO_INTERVAL / 2)
    }, ECHO_INTERVAL / 2)
  }, [])

  // Clean-up interval on unmount.
  const intervalRef = useRef(undefined)

  useEffect(() => () => {
    clearInterval(intervalRef.current)
  }, [])

  // The placeholder just reserves space on the page while the subject isn't
  // rendered.
  return (
    <div className="subject-placeholder">
      {show && children}
    </div>
  )
}

export const EchoStatic = () => {
  const subjectRef = useRef(undefined)

  useEffect(() => {
    const {current: el} = subjectRef
    if (el) {
      intervalRef.current = setInterval(() => echo(el), ECHO_INTERVAL)
    }
  }, [subjectRef])

  // Clean-up interval on unmount.
  const intervalRef = useRef(undefined)

  useEffect(() => () => {
    clearInterval(intervalRef.current)
  }, [])

  return (
    <div className="subject" ref={subjectRef} />
  )
}

export const EchoWithHook = () => {
  const subjectRef = useRef(null)

  // Echo when the component is about to unmount.
  useLayoutEffect(() => () => {
    echo(subjectRef.current)
  }, [])

  return (
    <div className="subject" ref={subjectRef} />
  )
}

export class EchoWithComponentWillUnmount extends Component {
  private readonly subjectRef: RefObject<HTMLDivElement>

  constructor(props) {
    super(props)
    this.subjectRef = createRef()
  }

  render() {
    return (
      <div className="subject" ref={this.subjectRef} />
    )
  }

  componentWillUnmount() {
    echo(this.subjectRef.current)
  }
}

const ECHO_INTERVAL = 4000
