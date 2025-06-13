export class User {
    constructor(
        public readonly id: number | null,
        public fullName: string,
        public email: string,
        public address: string,
        public readonly createdAt: Date | null
    ) { }

    static create(props: {
        fullName: string;
        email: string;
        address: string;
    }): User {
        return new User(null, props.fullName, props.email, props.address, null);
    }
}