import {
  createContext,
  ReactNode,
  useEffect,
  useReducer,
  useState,
} from 'react'

import { differenceInSeconds } from 'date-fns'

import { Cycle, cyclesReducer } from '../reducers/cycles/reducer'

import * as CyclesActions from '../reducers/cycles/actions'

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

interface CyclesContextProviderProps {
  children: ReactNode
}

export function CyclesContextProvider({
  children,
}: CyclesContextProviderProps) {
  const [cyclesState, dispatch] = useReducer(
    cyclesReducer,
    {
      cycles: [],
      activeCycleId: null,
    },
    () => {
      const storedStateAsJSON = localStorage.getItem(
        '@ignite-timer:cycles-state-1.0.0',
      )

      if (storedStateAsJSON) {
        return JSON.parse(storedStateAsJSON)
      }
    },
  )

  const { cycles, activeCycleId } = cyclesState

  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  const [amountSecondsPassed, setAmountSecondsPassed] = useState(() => {
    if (activeCycle) {
      return differenceInSeconds(new Date(), new Date(activeCycle.startDate))
    }
    return 0
  })

  useEffect(() => {
    const cyclesJSON = JSON.stringify(cyclesState)
    localStorage.setItem('@ignite-timer:cycles-state-1.0.0', cyclesJSON)
  }, [cyclesState])

  function updateSecondsPassed(seconds: number) {
    setAmountSecondsPassed(seconds)
  }

  function markActiveCycleAsFinished() {
    dispatch(CyclesActions.markActiveCycleAsFinishedAction())
  }

  function createNewCycle(data: CreateCycleData) {
    const id = String(new Date().getTime())

    const newCycle: Cycle = {
      id,
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    }

    dispatch(CyclesActions.addNewCycleAction(newCycle))

    setAmountSecondsPassed(0)
  }

  function interruptActiveCycle() {
    dispatch(CyclesActions.interruptActiveCycleAction())
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
