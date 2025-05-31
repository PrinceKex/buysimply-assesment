import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ExpressUser } from '../types/express-user.type';

export const CurrentUser = createParamDecorator<ExpressUser>(
  (data: unknown, ctx: ExecutionContext): ExpressUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as ExpressUser;
  },
);
