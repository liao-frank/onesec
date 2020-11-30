import React, {useEffect, useLayoutEffect, useRef, useState} from 'react'
import {render} from 'react-dom'
import {echo} from '../../src/Onesec'

import './EchoDemo.scss'

export default () => {
  const [showSubjectTwo, setShowSubjectTwo] = useState(true)

  // Store state so that the SubjectTwo render loop can access it later.
  const showSubjectTwoRef = useRef(showSubjectTwo)
  useEffect(() => {showSubjectTwoRef.current = showSubjectTwo})

  // Start the SubjectTwo render loop.
  useEffect(() => {
    setTimeout(() => {
      setInterval(() => {
        setShowSubjectTwo(!showSubjectTwoRef.current)
      }, ECHO_INTERVAL / 2)
    }, ECHO_INTERVAL / 2)
  }, [])

  return (
    <div className="demo demo-echo">
      <SubjectOne />
      {
        /**
         * The subject placeholder just reserves the space while the subject
         * isn't rendered.
         */
      }
      <div className="subject-placeholder">
        {showSubjectTwo && <SubjectTwo />}
      </div>
    </div>
  )
}

const SubjectOne = () => {
  const subjectRef = useRef(null)

  useEffect(() => {
    if (subjectRef.current) {
      setInterval(() => echo(subjectRef.current), ECHO_INTERVAL)
    }
  }, [subjectRef])

  return (
    <div className="subject subject-one" ref={subjectRef} />
  )
}

const SubjectTwo = () => {
  const subjectRef = useRef(null)

  // Echo when the component is about to unmount.
  useLayoutEffect(() => () => {
    echo(subjectRef.current)
  }, [])

  return (
    <div className="subject subject-two" ref={subjectRef} />
  )
}

const ECHO_INTERVAL = 2000
