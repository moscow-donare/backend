import type { Criteria } from "$shared/core/domain/criteria/Criteria";
import type { ICriteriaRepository } from "../ports/ICriteriaRepository";
import { db } from "src/infraestructure/drizzle/db";
import { and, eq, gt, gte, inArray, isNull, like, lt, lte, not, notInArray, type SQL } from "drizzle-orm";
import type { Filter } from "$shared/core/domain/criteria/Filter";

export abstract class DrizzleCriteriaRepository<T> implements ICriteriaRepository<T> {
    constructor(private drizzleEntity: any) { }

    async matching(criteria: Criteria): AsyncResult<T[]> {
        try {
            const filters = this.getFilters(criteria);
            const orderBy = criteria.getOrderBy() || this.getDefaultOrderBy();
            let result;
            if (criteria.getLimit() > 0 && criteria.getOffset() > 0) {
                result = await db.select().from(this.drizzleEntity).where(and(...filters)).groupBy(this.drizzleEntity[orderBy]).limit(criteria.getLimit()).offset(criteria.getOffset());
            } else {
                result = await db.select().from(this.drizzleEntity).where(and(...filters)).groupBy(this.drizzleEntity[orderBy]);
            }

            return Result.Ok(result.map(row => this.toEntity(row)));

        } catch (error) {
            console.error("Error matching criteria:", error);
            return Result.Err({
                code: "DB_ERROR::CRITERIA_MATCHING_FAILED",
                message: "Error al buscar por criterios",
                details: error,
            });
        }
    }

    private getFilters(criteria: Criteria): SQL[] {
        const filters: SQL[] = [];
        criteria.getFilters().forEach(filter => {
            filters.push(this.translateFilter(filter));
        });
        return filters;
    }

    private translateFilter(filter: Filter): SQL {
        const field = filter.getField();
        const operator = filter.getOperator().getOperator();
        const value = filter.getValue();

        switch (operator) {
            case "=":
                return eq(this.drizzleEntity[field], value);
            case "!=":
                return not(eq(this.drizzleEntity[field], value));
            case ">":
                return gt(this.drizzleEntity[field], value);
            case "<":
                return lt(this.drizzleEntity[field], value);
            case ">=":
                return gte(this.drizzleEntity[field], value);
            case "<=":
                return lte(this.drizzleEntity[field], value);
            case "LIKE":
                return like(this.drizzleEntity[field], `%${value}%`);
            case "IN":
                return inArray(this.drizzleEntity[field], value as any[]);
            case "NOT IN":
                return notInArray(this.drizzleEntity[field], value as any[]);
            case "IS NULL":
                return isNull(this.drizzleEntity[field]);
            case "IS NOT NULL":
                return not(isNull(this.drizzleEntity[field]));
            default:
                throw new Error(`Unsupported operator: ${operator}`);
        }
    }

    abstract toEntity(prismaEntity: any): T;
    abstract getDefaultOrderBy(): string;
}