import { Filter } from "./Filter";
import { Order } from "./Order";

export class Criteria {
    private filters: Filter[] = [];
    private order: Order;
    private orderBy: string;
    private limit: number;
    private offset: number;

    constructor(
        filters: Filter[] = [],
        order: Order = Order.ASC,
        limit: number = -1,
        offset: number = -1,
        orderBy: string = ""
    ) {
        this.filters = filters;
        this.order = order;
        this.limit = limit;
        this.offset = offset;
        this.orderBy = orderBy;
    }

    addFilter(filter: Filter): void {
        this.filters.push(filter);
    }

    getFilters(): Filter[] {
        return this.filters;
    }

    getOrder(): Order {
        return this.order;
    }

    getLimit(): number {
        return this.limit;
    }

    getOffset(): number {
        return this.offset;
    }

    getOrderBy(): string {
        return this.orderBy;
    }

    setOrder(order: Order): void {
        this.order = order;
    }

    setLimit(limit: number): void {
        this.limit = limit;
    }

    setOffset(offset: number): void {
        this.offset = offset;
    }

    setOrderBy(orderBy: string): void {
        this.orderBy = orderBy;
    }
}
