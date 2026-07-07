import { Request, Response } from 'express';
import { IEndpointContract, IValidator } from '../interfaces';
import {
  ApiError,
  ConsoleLogger,
  Stopwatch,
  generateRequestId,
} from '../utilities';

export class RequestHandler {
  private logger: ConsoleLogger;
  private validator?: IValidator;

  constructor(options: {
    logger?: ConsoleLogger;
    validator?: IValidator;
  } = {}) {
    this.logger = options.logger || new ConsoleLogger();
    this.validator = options.validator;
  }

  async handle(
    req: Request,
    res: Response,
    contract: IEndpointContract,
    handlerFn: (req: Request, res: Response) => Promise<void> | void,
  ): Promise<void> {
    const timer = new Stopwatch();
    const requestId = generateRequestId();

    res.setHeader('X-Request-Id', requestId);
    res.setHeader('X-Contract-Name', contract.name);
    res.setHeader('X-Contract-Version', contract.version);

    if (contract.deprecated) {
      res.setHeader('X-Deprecated', 'true');
      res.setHeader('X-Sunset', contract.version);
    }

    try {
      if (this.validator && Object.keys(contract.requestSchema).length > 0) {
        const result = this.validator.validate(
          req.body as any,
          contract.requestSchema,
        );

        if (!result.valid) {
          res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Request validation failed',
              details: result.errors,
            },
            meta: {
              requestId,
              duration: timer.elapsed,
              timestamp: new Date().toISOString(),
              version: contract.version,
            },
          });
          return;
        }
      }

      await handlerFn(req, res);

      if (!res.headersSent) {
        res.status(200).json({
          success: true,
          data: res.locals.data || null,
          meta: {
            requestId,
            duration: timer.elapsed,
            timestamp: new Date().toISOString(),
            version: contract.version,
          },
        });
      }
    } catch (error) {
      this.handleError(error, req, res, contract, timer.elapsed, requestId);
    }
  }

  private handleError(
    error: unknown,
    req: Request,
    res: Response,
    contract: IEndpointContract,
    duration: number,
    requestId: string,
  ): void {
    if (error instanceof ApiError) {
      this.logger.warn('API error occurred', {
        code: error.code,
        message: error.message,
        path: req.path,
        method: req.method,
        contract: contract.name,
      });

      res.status(error.statusCode).json({
        success: false,
        error: error.toJSON(),
        meta: {
          requestId,
          duration,
          timestamp: new Date().toISOString(),
          version: contract.version,
        },
      });
      return;
    }

    this.logger.error('Unhandled error', {
      error: String(error),
      path: req.path,
      method: req.method,
      contract: contract.name,
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
      meta: {
        requestId,
        duration,
        timestamp: new Date().toISOString(),
        version: contract.version,
      },
    });
  }
}
