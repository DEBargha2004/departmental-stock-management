import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ResponseBuilder } from './lib/response';
import { Auth } from './authentication/auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/upload/product-image')
  @Auth('product.create', 'product.update')
  async getPresignedUrl() {
    const { path, url } = await this.appService.generateProductImageUploadUrl();

    return ResponseBuilder.success({ url, path });
  }
}
