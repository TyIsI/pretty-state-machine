/**
 * @jest-environment jsdom
*/

// eslint-disable-next-line no-use-before-define
import React, { FC, useState } from 'react'
import { stateMachine, useStateMachine } from '../src'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

interface NameTestComponentProps {
  name: string
}

const NameTestComponent: FC<NameTestComponentProps> = ({ name }) => {
  const [_name, setName] = useState<string>(name)
  const [_globalName, setGlobalName] = useStateMachine<string>('name', name)

  return (
    <>
      <input data-testid="local-name" type="text" value={_name} onChange={(event) => { setName(event.target.value) }} />
      <div data-testid="global-name">{_globalName}</div>
      <button data-testid="update-global-button" onClick={() => setGlobalName(_name)}>Update</button>
    </>
  )
}

interface ValueTestComponentProps {
  name: string
}

const ValueTestComponent: FC<ValueTestComponentProps> = ({ name }) => {
  const [_globalName] = useStateMachine<string>('name', name)

  return (
    <>
      <div data-testid="value">{_globalName}</div>
    </>
  )
}

interface TestAppProps {
  name: string
}

const TestApp: FC<TestAppProps> = ({ name }) => {
  return (
    <>
      <NameTestComponent name={name} />
      <ValueTestComponent name={name} />
    </>
  )
}

describe('testing pretty-state-machine with React', () => {
  it('render the test app component', () => {
    render(<TestApp name="Marvin" />)

    expect(screen.getByTestId('global-name')).toHaveTextContent('Marvin')
  })

  it('updates the input name', () => {
    render(<TestApp name="Marvin" />)

    fireEvent.change(screen.getByTestId('local-name'), { target: { value: 'Kevin' } })

    fireEvent.click(screen.getByTestId('update-global-button'))

    expect(screen.getByTestId('global-name')).toHaveTextContent('Kevin')
    expect(screen.getByTestId('value')).toHaveTextContent('Kevin')
  })
})

afterAll(() => {
  stateMachine.shutdown()
})
