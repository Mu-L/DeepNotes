import { DeviceModel } from '@deeplib/db';
import { checkRedlockSignalAborted } from '@stdlib/redlock';
import { once } from 'lodash';
import type { InferProcedureOpts } from 'src/trpc/helpers';
import { authProcedure } from 'src/trpc/helpers';
import { checkCorrectUserPassword } from 'src/utils/users';
import { z } from 'zod';

const baseProcedure = authProcedure.input(
  z.object({
    loginHash: z.instanceof(Uint8Array),
  }),
);

export const forgetTrustedDevicesProcedure = once(() =>
  baseProcedure.mutation(forgetTrustedDevices),
);

export async function forgetTrustedDevices({
  ctx,
  input,
}: InferProcedureOpts<typeof baseProcedure>) {
  return await ctx.usingLocks(
    [[`user-lock:${ctx.userId}`]],
    async (signals) => {
      return await ctx.dataAbstraction.transaction(async (dtrx) => {
        await checkCorrectUserPassword({
          userId: ctx.userId,
          loginHash: input.loginHash,
        });

        checkRedlockSignalAborted(signals);

        // Forget all devices

        await DeviceModel.query(dtrx.trx)
          .where('user_id', ctx.userId)
          .patch({ trusted: false });
      });
    },
  );
}
