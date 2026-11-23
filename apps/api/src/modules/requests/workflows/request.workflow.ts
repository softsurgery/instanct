import { setup } from 'xstate';

export const requestMachine = setup({
  types: {
    context: {},
    events: {} as { type: 'Accept' } | { type: 'Reject' } | { type: 'Cancel' },
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
        Cancel: {
          target: 'Cancelled',
        },
      },
    },
    Accepted: {
      on: {
        Cancel: {
          target: 'Cancelled',
        },
      },
    },
    Rejected: {
      type: 'final',
    },
    Cancelled: {
      type: 'final',
    },
    Expired: {
      type: 'final',
    },
  },
});
