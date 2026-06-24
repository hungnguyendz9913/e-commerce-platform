import { DatabaseModule } from '@e-commerce-platform/database';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminDashboardController } from './admin-dashboard.controller';
import { DashboardRepository } from './dashboard.repository';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [AdminDashboardController],
  providers: [DashboardRepository, DashboardService],
})
export class DashboardModule {}