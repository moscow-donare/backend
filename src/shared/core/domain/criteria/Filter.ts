import { OperatorSQLValueObject } from "../OperatorSQLValueObject";

export class Filter {
    constructor(
        private field: string,
        private value: unknown,
        private operator: OperatorSQLValueObject = new OperatorSQLValueObject(
            "="
        )
    ) { }

    getField(): string {
        return this.field;
    }

    getValue(): unknown {
        return this.value;
    }

    getOperator(): OperatorSQLValueObject {
        return this.operator;
    }
}
