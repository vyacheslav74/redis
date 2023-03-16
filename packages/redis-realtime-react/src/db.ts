export function dbReducer(state: STATE, action: ACTION_TYPES) {
  switch (action.type) {
    case 'HANDSHAKE_SUCCESS':
      return { connectionId: action.id }
    case 'DB_SET':
      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          data: action.data,
        },
      }
    case 'DB_DEL':
      return {
        ...state,
        [action.key]: undefined,
      }
    case 'DB_INITIALISE': {
      const newState = { ...state }
      action.keys.forEach(
        (k) =>
          (newState[k] = { status: DB_KEY_STATUS.loaded, data: action.datas[k] })
      )
      return newState
    }
    case 'DB_INITIALISING': {
      const newState = { ...state }
      action.keys.forEach((k) => (newState[k] = { status: DB_KEY_STATUS.isLoading }))
      return newState
    }
    case 'DB_ARRAY_INSERT':
      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          data: [action.data, ...(state[action.key]?.data || [])],
        },
      }
    case 'DB_ARRAY_POP':
      console.log()
      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          data: state[action.key]?.data?.filter(
            (d: any, i: number) => i !== action.data.index && d.id !== action.data.id
          ),
        },
      }
    default:
      throw new Error('Action not defined')
  }
}

type STATE = {
  [key: string]: any
  connectionId?: string
}

export type ACTION_TYPES =
  | {
      type: 'HANDSHAKE_SUCCESS'
      id: string
    }
  | {
      type: 'DB_SET'
      key: string
      data: any
    }
  | {
      type: 'DB_DEL'
      key: string
    }
  | {
      type: 'DB_INITIALISE'
      keys: string[]
      datas: any
    }
  | {
      type: 'DB_INITIALISING'
      keys: string[]
    }
  | {
      type: 'DB_ARRAY_INSERT'
      key: string
      data: any
    }
  | {
      type: 'DB_ARRAY_POP'
      key: string
      data: {
        id: string
        index: number
      }
    }

export const DB_KEY_STATUS = {
  isLoading: 'IS_LOADING',
  loaded: 'LOADED',
}
