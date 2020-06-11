import * as React from 'react'

declare module 'react' {
  export * from React

  export interface CSSProperties extends React.CSSProperties {
    WebkitAppRegion?: 'drag' | 'no-drag'
  }

  export interface SVGElement extends React.SVGElement {
    beginElement(): this
  }
}
