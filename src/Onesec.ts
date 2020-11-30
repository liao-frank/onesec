import units from 'units-css'

const callAfterRepaint = (func) => requestAnimationFrame(() => setTimeout(func))

const getPhaseDuration = (el: HTMLElement): number => {
  const styles = window.getComputedStyle(el)
  const properties = styles.transitionProperty.split(', ')

  const index = properties.indexOf('visibility')
  if (index === -1) return 0

  const delays = styles.transitionDelay.split(', ')
  const delay = delays[index % delays.length]
  const durations = styles.transitionDuration.split(', ')
  const duration = durations[index % delays.length]

  return parseFloat(delay) * (delay.endsWith('ms') ? 1 : 1000) +
    parseFloat(duration) * (duration.endsWith('ms') ? 1 : 1000)
}

export const getSnapshot = (el: HTMLElement): Snapshot => {
  const computedStyle = window.getComputedStyle(el)
  const rect = el.getBoundingClientRect()

  return {
    style: computedStyle,
    globalX: window.scrollX + rect.x,
    globalY: window.scrollY + rect.y,
    localX: el.offsetLeft,
    localY: el.offsetTop,
    width: computedStyle.boxSizing === 'border-box'
      ? el.offsetWidth
      : (el.clientWidth
        - units.convert('px', computedStyle.paddingLeft, el, 'paddingLeft')
        - units.convert('px', computedStyle.paddingRight, el, 'paddingRight')),
    height: computedStyle.boxSizing === 'border-box'
      ? el.offsetHeight
      : (el.clientHeight
        - units.convert('px', computedStyle.paddingTop, el, 'paddingTop')
        - units.convert('px', computedStyle.paddingBottom, el, 'paddingBottom')),
  }
}

export const echo = (el: HTMLElement) => {
  el.classList.add(Css.Exiting)
  const duration = getPhaseDuration(el)
  if (!duration) return
  // Create echo.
  const snapshot = getSnapshot(el)
  const echoEl = el.cloneNode(true) as HTMLElement
  // Enforce snapshot.
  echoEl.style.position = 'absolute'
  echoEl.style.top = snapshot.localY + 'px'
  echoEl.style.left = snapshot.localX + 'px'
  echoEl.style.maxWidth = echoEl.style.minWidth = snapshot.width + 'px'
  echoEl.style.maxHeight = echoEl.style.minHeight = snapshot.height + 'px'
  // Setup transition.
  echoEl.classList.add(Css.Exiting)
  el.before(echoEl)
  // Start transition.
  callAfterRepaint(() => echoEl.classList.add(Css.DidExit))
  // Setup echo cleanup. Don't do this in `requestAnimationFrame` because it
  // should still run when the tab is not active.
  setTimeout(() => echoEl.remove(), duration + AVG_FRAME_MS)
}

export const rewind = (el: HTMLElement, prevSnapshot: Snapshot) => {
  const {globalX: currX, globalY: currY} = getSnapshot(el)
  const {
    style: prevStyle,
    globalX: prevX,
    globalY: prevY,
    width: prevWidth,
    height: prevHeight,
  } = prevSnapshot

  el.style.transition = 'none'
  // Rewind dimensions.
  el.style.maxWidth = el.style.minWidth = prevWidth + 'px'
  el.style.maxHeight = el.style.minHeight = prevHeight + 'px'
  // Rewind positions.
  el.style.transform =
    (prevStyle.transform && prevStyle.transform + ', ') +
    `translate(${prevX - currX}, ${prevY - currY})`
}

export const replay = (el: HTMLElement) => {
  el.style.transition = ''
  // Play dimensions.
  el.style.maxWidth = el.style.minWidth = ''
  el.style.maxHeight = el.style.minHeight = ''
  // Play positions.
  el.style.transform = ''
}

type Snapshot = {
  style: CSSStyleDeclaration, // Computed styles.
  globalX: number, // Distance from left side of document body.
  globalY: number, // Distance from top of document body.
  localX: number, // Distance from left of offset parent.
  localY: number, // Distanc from top of offset parent.
  width: number, // Box width.
  height: number, // Box height.
}

// Re-assignable enum of related CSS clases.
const Css = {
  WillEnter: 'will-enter',
  Entering: 'entering',
  Updating: 'updating',
  Exiting: 'exiting',
  DidExit: 'did-exit',
}

const AVG_FRAME_MS = 1000 / 60
