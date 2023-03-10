import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import stateMachine from './core'
import { psmType } from './types'

export const useStateMachine = <V> (topic: psmType, defaultValue?: V):[V, Dispatch<SetStateAction<V>>] => {
  const [_topicValue, _topicUpdater] = useState<V>(defaultValue)

  const updateReceiver = (topicUpdate: { [topic: psmType]: V }) => {
    if (topicUpdate[topic] != null) { _topicUpdater(topicUpdate[topic]) }
  }

  useEffect(() => {
    stateMachine.sub(topic, updateReceiver)

    return () => {
      stateMachine.unsub(topic, updateReceiver)
    }
  }, [])

  useEffect(() => {
    stateMachine.pub(topic, _topicValue)
  }, [_topicValue])

  return [_topicValue, _topicUpdater]
}
