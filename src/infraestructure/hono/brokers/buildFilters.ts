import { Filter } from "$shared/core/domain/criteria/Filter";
import { OperatorSQLValueObject } from "$shared/core/domain/OperatorSQLValueObject";

type QueryFilters = Record<string, string[]>;

export function buildFilters(query: QueryFilters, fieldToType: Record<string, string>): Filter[] {
    type FilterProps = Partial<{ field: string; value: unknown; condition: string }>;
    const filtersMap: Record<string, FilterProps> = {};

    for (const [key, valArr] of Object.entries(query)) {
        const match = key.match(/^filters\[(\d+)\]\[(\w+)\]$/);
        if (!match) continue;

        const [, index, prop] = match;
        if (!filtersMap[index!]) filtersMap[index!] = {};
        (filtersMap[index!] as FilterProps)[prop as keyof FilterProps] = valArr[0];
    }

    return Object.values(filtersMap).map((f) => {
        if (!f.field || f.value === undefined) {
            throw new Error("Invalid filter: field and value are required.");
        }
        f = mappingTypeField(f.field, f.value, fieldToType);
        return new Filter(
            f.field!,
            f.value!,
            new OperatorSQLValueObject(f.condition ?? "=")
        );
    });
}

const mappingTypeField = (field: string, value: unknown, objectWithTypes: Record<string, string>) => {
    const type = objectWithTypes[field];
    if (!type) return { field, value };

    switch (type) {
        case "string":
            return { field, value: String(value) };
        case "number":
            return { field, value: Number(value) };
        case "boolean":
            return { field, value: Boolean(value) };
        default:
            return { field, value };
    }
};
