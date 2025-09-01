import type { ICriteriaRepository } from "$shared/infraestructure/ports/ICriteriaRepository";
import type { Criteria } from "../domain/criteria/Criteria";

async function listByCriteria<T>(
    repository: ICriteriaRepository<T>,
    criteria: Criteria
) {
    return await repository.matching(criteria);
}

export default listByCriteria;
