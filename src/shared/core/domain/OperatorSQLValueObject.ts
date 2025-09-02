export class OperatorSQLValueObject {
    static readonly OPERATORS: string[] = [
        "=",
        "!=",
        ">",
        "<",
        ">=",
        "<=",
        "LIKE",
        "IN",
        "NOT IN",
        "IS NULL",
        "IS NOT NULL"
    ];
    private operator: string;

    constructor(operator: string) {
        if (!this.isValidOperator(operator)) {
            throw new Error(`Invalid operator: ${operator}`);
        }
        this.operator = operator;
    }

    getOperator(): string {
        return this.operator;
    }

    isValidOperator(operator: string): boolean {
        return OperatorSQLValueObject.OPERATORS.includes(operator);
    }
}
