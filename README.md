# pretty-state-machine
A pretty simple state store for React/Javascript

## Background

When I started to code with React, I found redux too unwieldy and clunky to use. Especially in combination with classes.

Instead, I wanted to use a state store that was easy to use, easy to understand, and easy to extend.

For example, I wanted to be able to add a new state to the store, and have it be accessible to all components.

Pretty State Machine (PSM) is a caching event-emitting state store that allows you to do that.

Due to the fact that PSM uses an eventemitter, PSM is complimentary to the state patterns in React, so you can use it as a base for your React components to synchronize states.

PSM is also conducive to handling decoupled API implementations. For example, you can use PSM to handle the state of the current user, have it be accessible to all components, and even preload it while creating new components.

## Usage

To start using Pretty State Machine, you need to import it into your project:

```
import { stateMachine } from 'pretty-state-machine';
```

### React

Frontend components can use Pretty State Machine to synchronize their state with the state of the application.

```
import React, { Component } from "react";
import ReactDOM from "react-dom"

import { stateMachine } from "pretty-state-machine";

stateMachine.sub(({foo}) => console.warn)

class Example extends Component {
    constructor(props) {
        super(props);

        this.state = {
            foo: stateMachine.get('foo', 'bar')
        }
    }

    componentDidMount() {
        stateMachine.sub('foo', this.setState.bind(this));
    }

    componentWillUnmount() {
        stateMachine.sub('foo', this.setState.bind(this));
    }

    render() {
        return (
            <div>
                Foo: {this.state.foo}
            </div>
        );
    }
}

const Updater = function() {
  const bump = () => {
    const foo = Math.round(Math.random()*1000)
    console.log({foo})
    stateMachine.pub({foo})
  }
  return (
    <button onClick={bump}>Change to random number</button>
  )
}

const App = function(props) {
  return (
    <>
      <Example />
      <Updater />
      </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
```

[Example Pen](https://codepen.io/pen?template=yLPRrvO)

#### Caveats

In OOP, it will be needed to bind the update function to the component.

## Persistence

In frontend environments, it will persist through the use of localStorage, allowing for caching of states.

## API

### constructor

Arguments:
* name: string, optional, default: '', the name of the state

Returns: PrettyStateMachine instance

### delete

Arguments:
* topic: string, the name of the state

### fetch

Arguments:
* topic: string, the name of the state
* defaultVal: any, the default value to return if the state is not found

Returns: an object value of the state

### get

Arguments:
* topic: string, the name of the state
* defaultVal: any, the default value to return if the state is not found

Returns: the value of the state

### pub

Receives and merges an object of state changes to a particular topic (state key), and then emits it to both consumers of the specific and default topics.

Arguments:
* topic: string, optional, default: 'state', the name of the state
* value: any, the value of the state

### sub

Arguments:
* topic: string, optional, default: 'state', the name of the state
* callback: function, the callback to be called when the state changes

### unsub

Arguments:
* topic: string, optional, default: 'state', the name of the state
* callback: function, the callback to be called when the state changes

### attach

Alias for: sub

### unattach

Alias for: unsub

### detach

Alias for: unsub

### shutdown

Removes all listeners