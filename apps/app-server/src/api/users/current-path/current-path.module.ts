import { Module } from 'src/nest-plus';

import { CurrentPathController } from './current-path.controller';
import { CurrentPathService } from './current-path.service';

@Module({
  controllers: [CurrentPathController],
  providers: [CurrentPathService],
})
export class CurrentPathModule {}
