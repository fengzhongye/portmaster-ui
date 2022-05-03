import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TrackByFunction } from "@angular/core";
import { forkJoin, interval, Observable, of, Subject } from "rxjs";
import { catchError, debounceTime, map, mergeMap, startWith, switchMap, takeUntil, tap } from "rxjs/operators";
import { ChartResult, Condition, Netquery, NetqueryConnection, PossilbeValue, Query, QueryResult, Select, Verdict } from "src/app/services";
import { ActionIndicatorService } from "../action-indicator";

interface Suggestion<T = any> extends PossilbeValue<T> {
  count: number;
}

interface Model<T> {
  suggestions: Suggestion<T>[];
  searchValues: any[];
}


const freeTextSearchFields: (keyof Partial<NetqueryConnection>)[] = [
  'domain',
  'as_owner',
  'path',
]

const groupByKeys: (keyof Partial<NetqueryConnection>)[] = [
  'domain',
  'as_owner',
  'country',
  'direction',
  'path'
]

const orderByKeys: (keyof Partial<NetqueryConnection>)[] = [
  'domain',
  'as_owner',
  'country',
  'direction',
  'path',
  'started',
  'ended'
]

@Component({
  selector: 'sfng-netquery-viewer',
  templateUrl: './netquery.component.html',
  styles: [
    `
    :host {
      @apply flex flex-col h-full gap-3 overflow-hidden;
    }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetqueryViewer implements OnInit, OnDestroy {
  /** @private - used to trigger a reload of the current filter */
  private search$ = new Subject();

  /** @private - emits and completed when the component is destroyed */
  private destroy$ = new Subject();

  results: QueryResult[] = [];

  /** The value of the free-text search */
  textSearch: string = '';

  /** a list of allowed group-by keys */
  readonly allowedGroupBy = groupByKeys;

  /** a list of allowed order-by keys */
  readonly allowedOrderBy = orderByKeys;

  /** @private - whether or not we are currently loading data */
  loading = false;

  /** @private - the total amount of results */
  totalCount = 0;

  /** @private - the chart data */
  chartData: ChartResult[] = [];

  constructor(
    private netquery: Netquery,
    private cdr: ChangeDetectorRef,
    private actionIndicator: ActionIndicatorService
  ) { }

  models: { [key in keyof Partial<NetqueryConnection>]: Model<any> } = {
    domain: {
      searchValues: [],
      suggestions: [],
    },
    path: {
      searchValues: [],
      suggestions: [],
    },
    as_owner: {
      searchValues: [],
      suggestions: [],
    },
    country: {
      searchValues: [],
      suggestions: [],
    }
  }

  keyTranslation: { [key: string]: string } = {
    domain: "Domain",
    path: "Application",
    as_owner: "Organization",
    country: "Country",
    direction: 'Direction',
    started: 'Started',
    ended: 'Ended'
  }

  groupByKeys: string[] = [];
  orderByKeys: string[] = [];

  ngOnInit(): void {
    this.search$
      .pipe(
        debounceTime(1000),
        switchMap(() => {
          this.loading = true;
          this.cdr.markForCheck();

          const query = this.getQuery();

          return forkJoin({
            results: this.netquery.query(query)
              .pipe(
                catchError(err => {
                  this.actionIndicator.error(
                    'Internal Error',
                    'Failed to perform search: ' + this.actionIndicator.getErrorMessgae(err)
                  );

                  return of([] as QueryResult[]);
                }),
              ),
            chart: this.netquery.activeConnectionChart(query.query!)
              .pipe(
                catchError(err => {
                  this.actionIndicator.error(
                    'Internal Error',
                    'Failed to load chart: ' + this.actionIndicator.getErrorMessgae(err)
                  );

                  return of([] as ChartResult[]);
                }),
              ),
            totalCount: this.groupByKeys.length === 0
              ? this.netquery.query({
                query: query.query,
                select: { $count: { field: '*', as: 'totalCount' } },
              }).pipe(map(result => result[0].totalCount || null))
              : of(null),
          })
        }),
      )
      .subscribe(result => {
        this.results = result.results.map(r => {
          const grpFilter: Condition = {};
          this.groupByKeys.forEach(key => {
            grpFilter[key] = r[key];
          })

          return {
            ...r,
            _chart: this.groupByKeys.length > 0 ? this.getGroupChart(grpFilter) : null,
          }
        });
        this.chartData = result.chart;
        if (result.totalCount === null) {
          this.totalCount = result.results?.length || 0;
        } else {
          this.totalCount = result.totalCount;
        }
        this.loading = false;
        this.cdr.markForCheck();
      })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.search$.complete();
  }

  getGroupChart(groupFilter: Condition): Observable<ChartResult[]> {
    const query = this.getQuery().query || {};

    Object.keys(groupFilter).forEach(key => {
      let existing = query[key];
      if (existing === undefined) {
        existing = [];
      } else {
        if (!Array.isArray(existing)) {
          existing = [existing];
        }
      }
      existing.push(groupFilter[key] as any);
      query[key] = existing;
    });

    return this.netquery.activeConnectionChart(query);
  }

  loadSuggestion(field: string): void;
  loadSuggestion<T extends keyof NetqueryConnection>(field: T) {
    const search = this.getQuery([field]);

    this.netquery.query({
      select: [
        field,
        {
          $count: {
            field: "*",
            as: "count"
          },
        }
      ],
      query: search.query,
      groupBy: [
        field,
      ],
      orderBy: [{ field: "count", desc: true }]
    })
      .subscribe(result => {
        // create a set that we can use to lookup if a value
        // is currently selected.
        // This is needed to ensure selected values are sorted to the top.
        let currentlySelected = new Set<any>();
        this.models[field]!.searchValues.forEach(
          val => currentlySelected.add(val)
        );

        this.models[field]!.suggestions =
          result.map(record => ({
            Name: record[field]!,
            Value: record[field]!,
            Description: '',
            count: record.count,
          }))
            .sort((a, b) => {
              const hasA = currentlySelected.has(a.Value);
              const hasB = currentlySelected.has(b.Value);

              if (hasA && !hasB) {
                return -1;
              }
              if (hasB && !hasA) {
                return 1;
              }

              return b.count - a.count;
            }) as any;

        this.cdr.markForCheck();
      })
  }

  /** @private - query the portmaster service for connections matching the current settings */
  performSearch() {
    this.search$.next();
  }

  /** @private - constructs a query from the current page settings */
  getQuery(excludeFields: string[] = []): Query {
    let query: Condition = {}

    // create the query conditions for all key on this.models
    const keys: (keyof NetqueryConnection)[] = Object.keys(this.models) as any;
    keys.forEach((key: keyof NetqueryConnection) => {
      if (excludeFields.includes(key)) {
        return;
      }

      if (this.models[key]!.searchValues.length > 0) {
        query[key] = {
          $in: this.models[key]!.searchValues,
        }
      }
    })

    if (this.textSearch !== '') {
      freeTextSearchFields.forEach(key => {
        let existing = query[key];
        if (existing === undefined) {
          existing = [];
        } else {
          if (!Array.isArray(existing)) {
            existing = [existing];
          }
        }

        existing.push({
          $like: "%" + this.textSearch + "%"
        })
        query[key] = existing;
      });
    }

    let select: (Select | string)[] | undefined = undefined;
    if (this.groupByKeys.length > 0) {
      // we always want to show the total and the number of allowed connections
      // per group so we need to add those to the select part of the query
      select = [
        {
          $count: {
            field: "*",
            as: "totalCount",
          },
        },
        {
          $sum: {
            condition: {
              verdict: {
                $in: [
                  Verdict.Accept,
                  Verdict.RerouteToNs,
                  Verdict.RerouteToTunnel
                ],
              }
            },
            as: "countAllowed"
          }
        },
        ...this.groupByKeys,
      ]
    }

    return {
      select: select,
      query: query,
      groupBy: this.groupByKeys,
      orderBy: this.orderByKeys,
    }
  }

  trackSuggestion: TrackByFunction<Suggestion> = (_: number, s: Suggestion) => s.Value;

  //
  // Debug-Code
  //
  collapseQueryInspector = true;
}
