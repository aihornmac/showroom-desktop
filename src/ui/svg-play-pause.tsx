import * as React from 'react'
import { v4 as uuidv4 } from 'uuid'

const IS_BEGIN_ELEMENT_SUPPORTED = true

export interface SVGPlayPauseProps {
  readonly icon?: 'play' | 'pause'
  readonly color?: string
  readonly duration?: string
}

export const SVGPlayPause = React.memo((props: SVGPlayPauseProps) => {
  const icon = props.icon || 'play'
  const color = props.color || '#fff'
  const duration = props.duration || '0.1s'

  const id = React.useMemo(() => uuidv4(), [])
  const animateRef = React.createRef<SVGElement>()

  const prevIconRef = React.useRef(icon)
  const prevIcon = prevIconRef.current
  prevIconRef.current = icon

  if (IS_BEGIN_ELEMENT_SUPPORTED) {
    React.useEffect(() => {
      if (prevIcon !== icon) {
        animateRef.current?.beginElement()
      }
    }, [prevIcon, icon])
  }

  const prevPath = PATHS[prevIcon]
  const currPath = PATHS[icon]

  return (
    <svg width="100%" height="100%" viewBox="0 0 36 36" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
      <path id={`icon-${id}`} d={IS_BEGIN_ELEMENT_SUPPORTED ? prevPath : currPath} fill={color}>
        {IS_BEGIN_ELEMENT_SUPPORTED &&
          <animate
            ref={animateRef}
            begin="indefinite"
            attributeType="XML"
            attributeName="d"
            fill="freeze"
            from={prevPath}
            to={currPath}
            dur={duration}
            keySplines=".4 0 1 1"
            repeatCount="1"
          />
        }
      </path>
    </svg>
  )
})

SVGPlayPause.displayName = 'SVGPlayPause'

const PATHS = {
  pause: 'M11,10 L17,10 17,26 11,26 M20,10 L26,10 26,26 20,26',
  play: 'M11,10 L18,13.74 18,22.28 11,26 M18,13.74 L26,18 26,18 18,22.28',
}

declare global {
  interface SVGElement {
    beginElement(): this
  }
}
