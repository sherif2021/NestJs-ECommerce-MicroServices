import { RULES_KEY, Rule } from "@app/common";
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RulesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const requiredRules = this.reflector.getAllAndOverride<Rule[]>(RULES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    return requiredRules.some((rule) => request.user.rules?.includes(rule));
  }
}