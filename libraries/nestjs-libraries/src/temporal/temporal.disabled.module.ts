import { Global, Module } from '@nestjs/common';
import { TemporalService } from 'nestjs-temporal-core';

/**
 * Temporary stand-in when DISABLE_TEMPORAL=true.
 * Keeps Temporal code in the repo; scheduling/jobs are no-ops until re-enabled.
 */
const noopHandle = {
  terminate: async () => undefined,
  cancel: async () => undefined,
  result: async () => undefined,
  describe: async () => ({}),
};

const stubClient = {
  getRawClient: () => null,
  getWorkflowHandle: async () => noopHandle,
  workflow: {
    start: async () => noopHandle,
    signalWithStart: async () => noopHandle,
    getHandle: async () => noopHandle,
  },
};

const temporalStub = {
  client: stubClient,
  terminateWorkflow: async () => undefined,
  signalWorkflow: async () => undefined,
};

@Global()
@Module({
  providers: [
    {
      provide: TemporalService,
      useValue: temporalStub,
    },
  ],
  exports: [TemporalService],
})
export class TemporalDisabledModule {}
