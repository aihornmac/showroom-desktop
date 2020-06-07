import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './styles.css'
import '../ipc/client'
import { App } from './app'

const body = document.createElement('div')
document.body.appendChild(body)
ReactDOM.render(<App />, body)
