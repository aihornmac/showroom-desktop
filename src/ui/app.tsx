import * as React from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { BodyDragArea } from './body-drag-area'

import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import { RoomPlayer } from './room-player'
import { Home } from './home'


export function App() {
  // disable shortcut ⌘+q to quit
  useHotkeys('command+q', e => e.preventDefault())

  return (
    <>
      <BodyDragArea />
      <Router>
        <Switch>
          <Route path="/room-player/:roomId" render={p => <RoomPlayer roomId={p.match.params.roomId} />} />
          <Route component={Home} />
          {/* <Route render={() => <RoomPlayer roomId={123} />} /> */}
        </Switch>
      </Router>
    </>
  )
}
