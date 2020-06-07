import * as React from 'react'

declare module 'react' {
  export * from React

  export interface CSSProperties extends React.CSSProperties {
    WebkitAppRegion?: 'drag' | 'no-drag'
  }
}
