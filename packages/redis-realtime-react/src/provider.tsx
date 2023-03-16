import React, { useContext, useEffect, useReducer, useState } from 'react'
import { dbReducer, DB_KEY_STATUS } from './db'
import { useSocket } from './socket'
import { ConnectionStatus } from './types'

type Publish = <T extends unknown>(
  key: string
) => {
  setDb: (data: T) => void
  delDb: () => void
  arrayInsertDb: <E extends { id: string }>(data: E) => void
  arrayPopDb: (id: string, index: number) => void
}

interface RealtimeContextType {
  connectionStatus: ConnectionStatus
  db: string
  publisher: Publish
  state: any
  subscribe: <T extends unknown>(
    key: string
  ) => {
    isLoading: boolean
    data: T
  }
}

const RealtimeContext = React.createContext<RealtimeContextType>(
  {} as RealtimeContextType
)
export const useRealtime = () => useContext(RealtimeContext)

interface RealtimeProviderProps {
  children: React.ReactNode
  db: string
  baseUrl: string
  token?: string
  secure?: boolean
}

export const RealtimeProvider = ({
  children,
  baseUrl,
  db,
  token,
  secure = true,
}: RealtimeProviderProps) => {
  const [dbState, dispatch] = useReducer(dbReducer, { connectionId: undefined })
  const [subscriptions, setSubscriptions] = useState<string[]>([])

  const onNewData = (data: any) => {
    dispatch(data)
  }

  const { sendMessage, status } = useSocket(
    `${secure ? 'wss' : 'ws'}://${baseUrl}/${db}`,
    onNewData,
    token
  )

  const initialise = () => {
    if (dbState.connectionId) {
      const unintialisedKeys = subscriptions.filter((s) => {
        return !dbState[s]?.status
      })
      if (unintialisedKeys.length > 0) {
        dispatch({
          type: 'DB_INITIALISING',
          keys: unintialisedKeys,
        })
        sendMessage({
          type: 'DB_INITIALISE',
          keys: unintialisedKeys,
          id: dbState.connectionId,
        })
      }
    }
  }

  useEffect(() => {
    initialise()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbState.connectionId, subscriptions])

  const publisher: Publish = (key: string) => ({
    setDb: (data) => {
      sendMessage({
        type: 'DB_SET',
        key,
        data,
        id: dbState.connectionId,
      })
      dispatch({
        type: 'DB_SET',
        key,
        data,
      })
    },
    delDb: () => {
      sendMessage({
        type: 'DB_DEL',
        key,
        id: dbState.connectionId,
      })
      dispatch({
        type: 'DB_DEL',
        key,
      })
    },
    arrayInsertDb: (data) => {
      sendMessage({
        type: 'DB_ARRAY_INSERT',
        key,
        data,
        id: dbState.connectionId,
      })
      dispatch({
        type: 'DB_ARRAY_INSERT',
        key,
        data,
      })
    },
    arrayPopDb: (id: string, index: number) => {
      sendMessage({
        type: 'DB_ARRAY_POP',
        key,
        data: { id, index },
        id: dbState.connectionId,
      })
      dispatch({
        type: 'DB_ARRAY_POP',
        key,
        data: { id, index },
      })
    },
  })

  const subscribe = (key: string) => {
    console.log('Subscribing...', key)
    if (!subscriptions.includes(key)) {
      setSubscriptions([...subscriptions, key])
    }
    return {
      isLoading: dbState[key]?.status === DB_KEY_STATUS.isLoading,
      data: dbState[key]?.data,
    }
  }

  const contextValue = React.useMemo(
    () => ({
      connectionStatus: status,
      db,
      publisher,
      state: dbState,
      subscribe,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sendMessage]
  )

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  )
}
