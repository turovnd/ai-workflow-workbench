/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface GetHealthData {
  status: 'ok';
  mode: 'deterministic' | 'openrouter';
}

export interface GetCapabilitiesData {
  generationMode: 'deterministic' | 'openrouter';
}

export interface PostAuthDemoData {
  token: string;
  /**
   * @format uuid
   * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
   */
  workspaceId: string;
  email: null | string;
  demo: boolean;
}

export interface PostAuthRegisterPayload {
  /**
   * @format email
   * @maxLength 254
   */
  email: string;
  /**
   * @minLength 12
   * @maxLength 128
   */
  password: string;
}

export interface PostAuthRegisterData {
  token: string;
  /**
   * @format uuid
   * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
   */
  workspaceId: string;
  email: null | string;
  demo: boolean;
}

export interface PostAuthLoginPayload {
  /**
   * @format email
   * @maxLength 254
   */
  email: string;
  /**
   * @minLength 12
   * @maxLength 128
   */
  password: string;
}

export interface PostAuthLoginData {
  token: string;
  /**
   * @format uuid
   * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
   */
  workspaceId: string;
  email: null | string;
  demo: boolean;
}

export interface GetAuthMeData {
  /**
   * @format uuid
   * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
   */
  workspaceId: string;
  email: null | string;
  demo: boolean;
}

export type PostAuthLogoutPayload = object;

export interface PostAuthLogoutData {
  ok: true;
}

export interface GetTicketsParams {
  /**
   * Page size 1–50. Tickets default to 12; history to 8.
   * @pattern ^([1-9]|[1-4][0-9]|50)$
   * @example "12"
   */
  limit?: string;
  /**
   * Opaque nextCursor from the previous response. Omit to restart; never construct or modify it.
   * @minLength 1
   * @maxLength 900
   */
  cursor?: string;
  status?: 'all' | 'open' | 'resolved';
}

export interface GetTicketsData {
  items: {
    /**
     * @format uuid
     * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
     */
    id: string;
    sequence: string;
    subject: string;
    customer: string;
    email: string;
    message: string;
    topic: string;
    status: 'open' | 'resolved';
    createdAt: string;
  }[];
  nextCursor: null | string;
}

export interface GetTicketsIdParams {
  /**
   * @format uuid
   * @example "11111111-1111-4111-8111-111111111111"
   */
  id: string;
}

export interface GetTicketsIdData {
  /**
   * @format uuid
   * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
   */
  id: string;
  sequence: string;
  subject: string;
  customer: string;
  email: string;
  message: string;
  topic: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface GetTicketsIdHistoryParams {
  /**
   * Page size 1–50. Tickets default to 12; history to 8.
   * @pattern ^([1-9]|[1-4][0-9]|50)$
   * @example "12"
   */
  limit?: string;
  /**
   * Opaque nextCursor from the previous response. Omit to restart; never construct or modify it.
   * @minLength 1
   * @maxLength 900
   */
  cursor?: string;
  /**
   * @format uuid
   * @example "11111111-1111-4111-8111-111111111111"
   */
  id: string;
}

export interface GetTicketsIdHistoryData {
  items: {
    /**
     * @format uuid
     * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
     */
    id: string;
    sequence: string;
    kind: 'run' | 'reply' | 'escalation';
    title: string;
    text: string;
    /**
     * @format uuid
     * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
     */
    runId: string;
    edited: boolean;
    createdAt: string;
  }[];
  nextCursor: null | string;
}

export type PostTicketsIdRunsPayload = object;

export interface PostTicketsIdRunsParams {
  /**
   * @format uuid
   * @example "11111111-1111-4111-8111-111111111111"
   */
  id: string;
}

export interface PostTicketsIdRunsData {
  id: string;
  caseId: string;
  status: 'queued' | 'running' | 'ready' | 'failed' | 'cancelled';
  brief: {
    summary: string;
    /** @maxLength 6000 */
    reply: string;
    findings: {
      text: string;
      citationId: string;
    }[];
    caution: string;
    citations: {
      id: string;
      title: string;
      /**
       * @min -9007199254740991
       * @max 9007199254740991
       */
      revision: number;
      section: string;
      quote: string;
      text: string;
    }[];
    proposal: {
      title: string;
      owner: string;
      steps: string[];
      /**
       * @min -9007199254740991
       * @max 9007199254740991
       */
      version: number;
    } | null;
  } | null;
  draft: string;
  /**
   * @min -9007199254740991
   * @max 9007199254740991
   */
  cursor: number;
  createdAt: string;
  taskId: null | string;
  /** @default null */
  ticketId: string | null;
  /** @default "deterministic" */
  provider: 'deterministic' | 'openrouter';
}

export interface GetRunsIdDraftParams {
  /**
   * @format uuid
   * @example "11111111-1111-4111-8111-111111111111"
   */
  id: string;
}

export interface GetRunsIdDraftData {
  /** @default false */
  approved: boolean;
  /**
   * @minLength 1
   * @maxLength 6000
   */
  text: string;
  /**
   * @exclusiveMin 0
   * @max 9007199254740991
   */
  version: number;
  edited: boolean;
}

export interface PostRunsIdDraftPayload {
  /**
   * @minLength 1
   * @maxLength 6000
   */
  text: string;
  /**
   * @min 1
   * @max 10000
   */
  version: number;
}

export interface PostRunsIdDraftParams {
  /**
   * @format uuid
   * @example "11111111-1111-4111-8111-111111111111"
   */
  id: string;
}

export interface PostRunsIdDraftData {
  /** @default false */
  approved: boolean;
  /**
   * @minLength 1
   * @maxLength 6000
   */
  text: string;
  /**
   * @exclusiveMin 0
   * @max 9007199254740991
   */
  version: number;
  edited: boolean;
}

export interface PostRunsIdReplyPayload {
  /**
   * @minLength 8
   * @maxLength 100
   * @pattern ^[a-zA-Z0-9:_-]+$
   */
  key: string;
  /**
   * @min 1
   * @max 10000
   */
  version: number;
  escalate: boolean;
}

export interface PostRunsIdReplyParams {
  /**
   * @format uuid
   * @example "11111111-1111-4111-8111-111111111111"
   */
  id: string;
}

export interface PostRunsIdReplyData {
  /**
   * @format uuid
   * @pattern ^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$
   */
  replyId: string;
  taskId: string | null;
  replayed: boolean;
}

export interface GetRunsIdParams {
  /** @format uuid */
  id: string;
}

export interface GetRunsIdData {
  id: string;
  caseId: string;
  status: 'queued' | 'running' | 'ready' | 'failed' | 'cancelled';
  brief: {
    summary: string;
    /** @maxLength 6000 */
    reply: string;
    findings: {
      text: string;
      citationId: string;
    }[];
    caution: string;
    citations: {
      id: string;
      title: string;
      /**
       * @min -9007199254740991
       * @max 9007199254740991
       */
      revision: number;
      section: string;
      quote: string;
      text: string;
    }[];
    proposal: {
      title: string;
      owner: string;
      steps: string[];
      /**
       * @min -9007199254740991
       * @max 9007199254740991
       */
      version: number;
    } | null;
  } | null;
  draft: string;
  /**
   * @min -9007199254740991
   * @max 9007199254740991
   */
  cursor: number;
  createdAt: string;
  taskId: null | string;
  /** @default null */
  ticketId: string | null;
  /** @default "deterministic" */
  provider: 'deterministic' | 'openrouter';
}

export type PostRunsIdCancelPayload = object;

export interface PostRunsIdCancelParams {
  /** @format uuid */
  id: string;
}

export interface PostRunsIdCancelData {
  status: 'cancelled';
}

export interface GetRunsIdEventsParams {
  /** @pattern ^[0-9]{1,9}$ */
  after?: string;
  /** @format uuid */
  id: string;
}

/**
 * @example "id: 1
 * data: {"seq":1,"type":"status","data":"queued"}
 *
 * "
 */
export type GetRunsIdEventsData = string;

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  'body' | 'method' | 'query' | 'path'
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<
  D extends unknown,
  E extends unknown = unknown,
> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  JsonApi = 'application/vnd.api+json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = '/api';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&');
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => 'undefined' !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string')
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string')
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== 'string'
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { 'Content-Type': type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === 'undefined' || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Support Desk API
 * @version 1.0.0
 * @baseUrl /api
 *
 * Synthetic customer support workspace. Prepare evidence-backed drafts, review source citations, edit and approve a response. No outgoing email or customer-system integration. Use POST /auth/demo or register/login, then Authorize with the returned opaque token. Sessions last 24 hours. Rate limits are per configured client IP.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  health = {
    /**
     * No description
     *
     * @tags System
     * @name GetHealth
     * @summary Check service and database readiness
     * @request GET:/health
     */
    getHealth: (params: RequestParams = {}) =>
      this.request<
        GetHealthData,
        {
          message: string;
        }
      >({
        path: `/health`,
        method: 'GET',
        format: 'json',
        ...params,
      }),
  };
  capabilities = {
    /**
     * No description
     *
     * @tags System
     * @name GetCapabilities
     * @summary Read the configured generation mode
     * @request GET:/capabilities
     */
    getCapabilities: (params: RequestParams = {}) =>
      this.request<
        GetCapabilitiesData,
        {
          message: string;
        }
      >({
        path: `/capabilities`,
        method: 'GET',
        format: 'json',
        ...params,
      }),
  };
  auth = {
    /**
     * @description Returns one bearer session. Anonymous workspace and its data expire after 24 hours; at most 5 creations per minute per client IP.
     *
     * @tags Authentication
     * @name PostAuthDemo
     * @summary Create an isolated synthetic workspace
     * @request POST:/auth/demo
     */
    postAuthDemo: (params: RequestParams = {}) =>
      this.request<
        PostAuthDemoData,
        {
          message: string;
        }
      >({
        path: `/auth/demo`,
        method: 'POST',
        format: 'json',
        ...params,
      }),

    /**
     * @description Email is an unverified local identity; no email is sent. Password length 12–128 characters. Account data survives anonymous retention cleanup. At most 10 attempts/minute.
     *
     * @tags Authentication
     * @name PostAuthRegister
     * @summary Register a personal email/password account
     * @request POST:/auth/register
     */
    postAuthRegister: (
      data: PostAuthRegisterPayload,
      params: RequestParams = {},
    ) =>
      this.request<
        PostAuthRegisterData,
        {
          message: string;
        }
      >({
        path: `/auth/register`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns a new 24-hour bearer session and revokes the previous session for this account. At most 10 attempts/minute.
     *
     * @tags Authentication
     * @name PostAuthLogin
     * @summary Sign in and replace the previous session
     * @request POST:/auth/login
     */
    postAuthLogin: (data: PostAuthLoginPayload, params: RequestParams = {}) =>
      this.request<
        PostAuthLoginData,
        {
          message: string;
        }
      >({
        path: `/auth/login`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Account
     * @name GetAuthMe
     * @summary Read the current workspace identity
     * @request GET:/auth/me
     * @secure
     */
    getAuthMe: (params: RequestParams = {}) =>
      this.request<
        GetAuthMeData,
        {
          message: string;
        }
      >({
        path: `/auth/me`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Account
     * @name PostAuthLogout
     * @summary Revoke the current session
     * @request POST:/auth/logout
     * @secure
     */
    postAuthLogout: (data: PostAuthLogoutPayload, params: RequestParams = {}) =>
      this.request<
        PostAuthLogoutData,
        {
          message: string;
        }
      >({
        path: `/auth/logout`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  tickets = {
    /**
     * @description Default limit 12; range 1–50. Results order by descending numeric sequence. Opaque signed cursor is bound to workspace and status filter and fixes an insertion ceiling. Status membership remains live: resolved tickets leave an open list. Refresh without a cursor to see changed membership or new inserts. Invalid, tampered or differently scoped cursors return 400.
     *
     * @tags Tickets
     * @name GetTickets
     * @summary List tickets using a stable numeric keyset
     * @request GET:/tickets
     * @secure
     */
    getTickets: (query: GetTicketsParams = {}, params: RequestParams = {}) =>
      this.request<
        GetTicketsData,
        {
          message: string;
        }
      >({
        path: `/tickets`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tickets
     * @name GetTicketsId
     * @summary Read one ticket
     * @request GET:/tickets/{id}
     * @secure
     */
    getTicketsId: ({ id }: GetTicketsIdParams, params: RequestParams = {}) =>
      this.request<
        GetTicketsIdData,
        {
          message: string;
        }
      >({
        path: `/tickets/${id}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Default limit 8; range 1–50. Descending numeric sequence. Opaque signed cursor is bound to this workspace and ticket and fixes an insertion ceiling. Refresh without a cursor to include new entries.
     *
     * @tags Tickets
     * @name GetTicketsIdHistory
     * @summary Read persisted ticket history
     * @request GET:/tickets/{id}/history
     * @secure
     */
    getTicketsIdHistory: (
      { id, ...query }: GetTicketsIdHistoryParams,
      params: RequestParams = {},
    ) =>
      this.request<
        GetTicketsIdHistoryData,
        {
          message: string;
        }
      >({
        path: `/tickets/${id}/history`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Creates a persisted queued run and durable worker job. At most three preparations may run concurrently per workspace. Completed runs do not impose a lifetime cap. Optional global paid-call admission is configured by the operator. No email is sent.
     *
     * @tags Preparation
     * @name PostTicketsIdRuns
     * @summary Prepare a grounded reply asynchronously
     * @request POST:/tickets/{id}/runs
     * @secure
     */
    postTicketsIdRuns: (
      { id }: PostTicketsIdRunsParams,
      data: PostTicketsIdRunsPayload,
      params: RequestParams = {},
    ) =>
      this.request<
        PostTicketsIdRunsData,
        {
          message: string;
        }
      >({
        path: `/tickets/${id}/runs`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  runs = {
    /**
     * No description
     *
     * @tags Review
     * @name GetRunsIdDraft
     * @summary Read the current editable or approved draft
     * @request GET:/runs/{id}/draft
     * @secure
     */
    getRunsIdDraft: (
      { id }: GetRunsIdDraftParams,
      params: RequestParams = {},
    ) =>
      this.request<
        GetRunsIdDraftData,
        {
          message: string;
        }
      >({
        path: `/runs/${id}/draft`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Text must contain 1–6000 characters, including Unicode. Submit the currently observed draft version. A successful edit increments the version and marks the draft as edited. Approved replies are immutable; stale versions return 409.
     *
     * @tags Review
     * @name PostRunsIdDraft
     * @summary Save a reviewer edit with optimistic version checking
     * @request POST:/runs/{id}/draft
     * @secure
     */
    postRunsIdDraft: (
      { id }: PostRunsIdDraftParams,
      data: PostRunsIdDraftPayload,
      params: RequestParams = {},
    ) =>
      this.request<
        PostRunsIdDraftData,
        {
          message: string;
        }
      >({
        path: `/runs/${id}/draft`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Human confirmation only. Use a unique key for this exact run/version/escalation intent. Repeating the same key and intent returns the same stored effect with replayed=true. Reusing it with changed intent or submitting a stale version returns 409. Saves history and resolves the ticket atomically. No email is sent.
     *
     * @tags Review
     * @name PostRunsIdReply
     * @summary Confirm the exact reply and optional internal escalation
     * @request POST:/runs/{id}/reply
     * @secure
     */
    postRunsIdReply: (
      { id }: PostRunsIdReplyParams,
      data: PostRunsIdReplyPayload,
      params: RequestParams = {},
    ) =>
      this.request<
        PostRunsIdReplyData,
        {
          message: string;
        }
      >({
        path: `/runs/${id}/reply`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Preparation
     * @name GetRunsId
     * @summary Read the latest preparation state
     * @request GET:/runs/{id}
     * @secure
     */
    getRunsId: ({ id }: GetRunsIdParams, params: RequestParams = {}) =>
      this.request<
        GetRunsIdData,
        {
          message: string;
        }
      >({
        path: `/runs/${id}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Preparation
     * @name PostRunsIdCancel
     * @summary Cancel preparation and fence pending worker completion
     * @request POST:/runs/{id}/cancel
     * @secure
     */
    postRunsIdCancel: (
      { id }: PostRunsIdCancelParams,
      data: PostRunsIdCancelPayload,
      params: RequestParams = {},
    ) =>
      this.request<
        PostRunsIdCancelData,
        {
          message: string;
        }
      >({
        path: `/runs/${id}/cancel`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Preparation
     * @name GetRunsIdEvents
     * @summary Resume persisted preparation events
     * @request GET:/runs/{id}/events
     * @secure
     */
    getRunsIdEvents: (
      { id, ...query }: GetRunsIdEventsParams,
      params: RequestParams = {},
    ) =>
      this.request<
        GetRunsIdEventsData,
        {
          message: string;
        }
      >({
        path: `/runs/${id}/events`,
        method: 'GET',
        query: query,
        secure: true,
        ...params,
      }),
  };
}
