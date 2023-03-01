import { ProPlanGuard } from 'src/api/pro-plan.guard';
import { Module, UseModuleGuard } from 'src/nest-plus';

import { NonPersonalGroupGuard } from '../non-personal-group.guard';
import { MakePrivateModule } from './make-private/make-private.module';
import { MakePublicModule } from './make-public/make-public.module';

@UseModuleGuard(NonPersonalGroupGuard)
@UseModuleGuard(ProPlanGuard)
@Module({
  imports: [
    { prefix: 'make-public', module: MakePublicModule },
    { prefix: 'make-private', module: MakePrivateModule },
  ],
})
export class PrivacyModule {}
