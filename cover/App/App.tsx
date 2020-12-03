import React, {Component, createContext} from 'react'

import './App.scss'

interface State {
  setAppState: (state: any) => void;
}

export const AppContext = createContext({} as State)

export default class App extends Component<{}, State> {
  constructor(props) {
    super(props)

    this.setState = this.setState.bind(this)
    this.state = {
      setAppState: this.setState,
    }
  }

  render() {
    return (
      <AppContext.Provider value={this.state}>
      </AppContext.Provider>
    )
  }
}
