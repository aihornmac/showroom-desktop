import * as React from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { BodyDragArea } from './body-drag-area'

import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import { Player } from './player'
import { Home } from './home'


export function App() {
  // disable shortcut ⌘+q to quit
  useHotkeys('command+q', e => e.preventDefault())

  return (
    <>
      <BodyDragArea />
      <Router>
        <Switch>
          {/* <Route path="/player/:roomId" render={p => <Player roomId={p.match.params.roomId} />} />
          <Route component={Home} /> */}
          <Route render={() => <Player roomId={123} />} />
        </Switch>
      </Router>
    </>
  )
}
