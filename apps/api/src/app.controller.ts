import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ResponseBuilder } from './lib/response';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/upload/product-image')
  async getPresignedUrl() {
    const randomKey = Math.random().toString(36).substring(2, 15);
    const path = `images/products/${randomKey}.jpg`;
    const url = await this.appService.getPresignedUrl(path, 'image/jpeg');

    return ResponseBuilder.success({ url, path });
  }
}
