/**
 * log errors using captureException
 * @type {{StackFrame: StackFrame, Breadcrumb: Breadcrumb, NodeOptions: NodeOptions, getHubFromCarrier(carrier: Carrier): Hub, flush(timeout?: number): Promise<boolean>, Event: Event, setTag(key: string, value: Primitive): void, setExtra(key: string, extra: Extra): void, withScope(callback: (scope: Scope) => void): void, setExtras(extras: Extras): void, captureEvent(event: Event): string, NodeClient: NodeClient, setContext(name: string, context: ({[p: string]: any} | null)): void, SdkInfo: SdkInfo, lastEventId(): (string | undefined), User: User, setUser(user: (User | null)): void, Transports, Severity: Severity, SDK_VERSION: string, NodeBackend: NodeBackend, getCurrentHub(): Hub, Stacktrace: Stacktrace, addGlobalEventProcessor(callback: EventProcessor): void, setTags(tags: {[p: string]: Primitive}): void, init(options?: NodeOptions): void, close(timeout?: number): Promise<boolean>, Status: Status, Exception: Exception, Integrations, addBreadcrumb(breadcrumb: Breadcrumb): void, BreadcrumbHint: BreadcrumbHint, configureScope(callback: (scope: Scope) => void): void, Thread: Thread, startTransaction(context: TransactionContext, customSamplingContext?: CustomSamplingContext): Transaction, makeMain(hub: Hub): Hub, Handlers, EventHint: EventHint, captureMessage(message: string, captureContext?: (CaptureContext | Severity)): string, defaultIntegrations: (FunctionToString | InboundFilters | Console | Http | OnUncaughtException | OnUnhandledRejection | LinkedErrors)[], SDK_NAME: string, Request: Request, Scope: Scope, captureException(exception: any, captureContext?: CaptureContext): string, Response: Response, Hub: Hub}|{init(*), captureException(*=, *): void}}
 */
const Sentry = require('@sentry/node');
const StubLogger = {
  captureException(exception, captureContext) {
    try {
      console.log(exception);
    } catch(e) {
      console.log(e.message);
    }
  },
  init(option) {}
};
module.exports = (process.env.SENTRY_DSN) ? Sentry : StubLogger;

