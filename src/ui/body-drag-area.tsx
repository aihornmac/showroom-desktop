import * as React from 'react'
import styled from 'styled-components'
import { ipc } from '../ipc/client'

export const BodyDragArea = React.memo(() => {
  const onDoubleClick = React.useMemo(() => () => ipc.sync('toggleMaximize')(), [])

  return (
    <DragArea
      onDoubleClick={onDoubleClick}
    >
      <div />
    </DragArea>
  )
})

BodyDragArea.displayName = 'BodyDragArea'

const DragArea = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 20px;
  -webkit-app-region: drag;
  transition: .1s opacity;
  opacity: 0;
  cursor: grab;
  user-select: none;
  user-zoom: none;

  &:hover {
    opacity: 1;
  }

  &:active {
    cursor: grabbing;
  }

  & > div {
    height: 40px;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%);
  }
`
