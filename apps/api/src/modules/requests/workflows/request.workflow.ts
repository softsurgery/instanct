import { setup } from 'xstate';

export const requestMachine = setup({
  types: {
    context: {} as {},
    events: {} as { type: 'Accept' } | { type: 'Reject' },
  },
}).createMachine({
  context: {},
  id: 'Instanct - Request',
  initial: 'Sent',
  states: {
    Sent: {
      on: {
        Accept: {
          target: 'Accepted',
        },
        Reject: {
          target: 'Rejected',
        },
      },
    },
    Accepted: {
      type: 'final',
    },
    Rejected: {
      type: 'final',
    },
    Expired: {
      type: 'final',
    },
  },
});
