import * as React from 'react'
import styled from 'styled-components'
import { ipc, getPlatform, getIsMinimizable, getIsMaximizable, getIsResizable, getIsClosable } from '../ipc/client'
import { IconWinMinimize, IconWinMaximize, IconWinClose } from './icons'

export const BodyDragArea = React.memo(() => {
  const onDoubleClick = React.useMemo(() => () => ipc.sync('toggleMaximize')(), [])

  const platform = getPlatform()

  return (
    <DragArea
      onDoubleClick={onDoubleClick}
    >
      <div className="bg" />
      {platform === 'darwin' ? null : <Bar />}
    </DragArea>
  )
}, () => true)

BodyDragArea.displayName = 'BodyDragArea'

const Bar = React.memo(() => {
  const iconMinimize = <IconWinMinimize />
  const iconMaximize = <IconWinMaximize />
  const iconClose = <IconWinClose />

  const platform = getPlatform()

  console.log({ platform })

  const isMinimizable = getIsMinimizable()
  const isMaximizable = getIsMaximizable() && getIsResizable() || true
  const isClosable = getIsClosable()

  const onMinimize = React.useMemo(() => () => ipc.sync('minimize')(), [])

  const onMaximize = React.useMemo(() => () => ipc.sync('toggleMaximize')(), [])

  const onClose = React.useMemo(() => () => ipc.sync('close')(), [])

  return (
    <Buttons className="buttons">
      {!isMinimizable ? null : (
        <Button key="minimize" className={platform} onClick={onMinimize}>{iconMinimize}</Button>
      )}
      {!isMaximizable ? null : (
        <Button key="maximize" className={platform} onClick={onMaximize}>{iconMaximize}</Button>
      )}
      {!isClosable ? null : (
        <Button key="close" className={`${platform} close`} onClick={onClose}>{iconClose}</Button>
      )}
    </Buttons>
  )
}, () => true)

Bar.displayName = 'Bar'

const DragArea = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 20px;
  -webkit-app-region: drag;
  cursor: grab;
  user-select: none;
  user-zoom: none;

  &:hover {
    .bg, .buttons {
      opacity: 1;
    }
  }

  &:active {
    cursor: grabbing;
  }

  & .bg {
    height: 40px;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%);
    opacity: 0;
    transition: .1s opacity;
  }
`

const Buttons = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  cursor: default;
  -webkit-app-region: no-drag;
  opacity: 0;
`

const Button = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 72px;
  height: 32px;
  &:hover {
    background-color: rgba(196, 196, 196, 0.4);
    &.close {
      color: #fff;
      background-color: #e81123;
    }
  }
  &:active {
    background-color: rgba(168, 168, 168, 0.5);
    &.close {
      color: #fff;
      background-color: rgba(232, 17, 35, 0.6);
    }
  }
`
