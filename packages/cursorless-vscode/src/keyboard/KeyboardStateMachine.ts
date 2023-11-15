interface StateMachine {
  initialState: StateId;
  states: Record<StateId, State>;
}

interface State<T> {
  id: StateId<T>;
  transitions: Record<string, Transition>;
}

interface Transition<T> {
  name: string;
  text: string;
  destination: StateId<T>;
  action?(): Promise<void>;
  argument: T;
}

const stateMachine: StateMachine = {
  initialState: "root",
  states: {
    root: {
      id: "root",
      transitions: {
        a: {
          destination: "a",
          argument: "a",
        },
        b: {
          destination: "b",
          argument: "b",
        },
      },
    },
  },
};
