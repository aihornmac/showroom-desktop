import * as React from 'react'
import { CornerMenu } from './corner-menu'
import { TodaysPick } from './todays-pick'
import { BodyDragArea } from './body-drag-area'

export function App() {
  return (
    <>
      <TodaysPick />
      <CornerMenu />
      <BodyDragArea />
    </>
  )
}
