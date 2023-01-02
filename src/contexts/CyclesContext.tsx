import { createContext, ReactNode, useReducer, useState } from 'react'

interface Cycle {
  id: string
  task: string
  minutesAmount: number
  startDate: Date
  interruptedDate?: Date
  finishedDate?: Date
}

interface CreateCycleData {
  task: string
  minutesAmount: number
}

interface CyclesContextType {
  cycles: Cycle[]
  activeCycleId: string | null
  activeCycle: Cycle | undefined
  amountSecondsPassed: number
  createNewCycle: (data: CreateCycleData) => void
  interruptActiveCycle: () => void
  updateSecondsPassed: (seconds: number) => void
  markActiveCycleAsFinished: () => void
}

export const CyclesContext = createContext({} as CyclesContextType)

interface CyclesState {
  cycles: Cycle[]
  activeCycleId: string | null
}

interface CyclesContextProviderProps {
  children: ReactNode
}

export function CyclesContextProvider({
  children,
}: CyclesContextProviderProps) {
  const [cyclesState, dispatch] = useReducer(
    (state: CyclesState, action: any) => {
      switch (action.type) {
        case 'ADD_NEW_CYCLE':
          return {
            ...state,
            cycles: [...state.cycles, action.payload.newCycle],
            activeCycleId: action.payload.newCycle.id,
          }
        case 'INTERRUPT_ACTIVE_CYCLE':
          return {
            ...state,
            cycles: state.cycles.map((cycle) => {
              if (cycle.id === state.activeCycleId) {
                return { ...cycle, interruptedDate: new Date() }
              }
              return cycle
            }),
            activeCycleId: null,
          }
        case 'MARK_ACTIVE_CYCLE_AS_FINISHED':
          return {
            ...state,
            cycles: state.cycles.map((cycle) => {
              if (cycle.id === state.activeCycleId) {
                return { ...cycle, finishedDate: new Date() }
              }
              return cycle
            }),
            activeCycleId: null,
          }
        default:
          return state
      }
    },
    {
      cycles: [],
      activeCycleId: null,
    },
  )

  const { cycles, activeCycleId } = cyclesState
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0)

  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  function updateSecondsPassed(seconds: number) {
    setAmountSecondsPassed(seconds)
  }

  function markActiveCycleAsFinished() {
    dispatch({
      type: 'MARK_ACTIVE_CYCLE_AS_FINISHED',
      payload: { activeCycleId },
    })
  }

  function createNewCycle(data: CreateCycleData) {
    const id = String(new Date().getTime())

    const newCycle: Cycle = {
      id,
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    }

    dispatch({
      type: 'ADD_NEW_CYCLE',
      payload: { newCycle },
    })

    setAmountSecondsPassed(0)
  }

  function interruptActiveCycle() {
    dispatch({
      type: 'INTERRUPT_ACTIVE_CYCLE',
      payload: { activeCycleId },
    })
  }

  return (
    <CyclesContext.Provider
      value={{
        cycles,
        activeCycle,
        activeCycleId,
        amountSecondsPassed,
        createNewCycle,
        interruptActiveCycle,
        updateSecondsPassed,
        markActiveCycleAsFinished,
      }}
    >
      {children}
    </CyclesContext.Provider>
  )
}
