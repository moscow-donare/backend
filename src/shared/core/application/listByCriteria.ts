import type { ICriteriaRepository } from "$shared/infraestructure/ports/ICriteriaRepository";
import type { Criteria } from "../domain/criteria/Criteria";

async function listByCriteria<T>(
    repositoy: ICriteriaRepository<T>,
    criteria: Criteria
) {
    return await repositoy.matching(criteria);
}

export default listByCriteria;
