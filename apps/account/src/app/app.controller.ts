import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { IUser } from '@monorepo-microservices/interfaces';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get()
    getData(): { user: IUser } {
        // return this.appService.getData();
        return this.appService.getUser();
    }
}
