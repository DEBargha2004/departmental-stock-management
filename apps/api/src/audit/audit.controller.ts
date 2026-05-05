import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AUDIT_ACTION, ENTITY_TYPE } from '@repo/contracts/status';
import { Auth } from 'src/authentication/auth.guard';
import { ResponseBuilder } from 'src/lib/response';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Auth('audit.read')
  async getAuditLogs(
    @Query('query') query?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('action') action?: AUDIT_ACTION,
    @Query('entity') entity?: ENTITY_TYPE,
  ) {
    const res = await this.auditService.getAuditLogs({
      query,
      limit,
      page,
      action,
      entity,
    });

    return ResponseBuilder.success(res, 'Audit logs fetched successfully');
  }
}
