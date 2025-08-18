import type { Criteria } from "$shared/core/domain/criteria/Criteria";

export interface ICriteriaRepository<T> {
    matching(criteria: Criteria): AsyncResult<T[]>;
}
