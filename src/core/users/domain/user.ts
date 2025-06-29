export class User {
    private constructor(
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

    static createWithId(props: {
        id: number;
        fullName: string;
        email: string;
        address: string;
        createdAt: Date | null;
    }): User {
        return new User(props.id, props.fullName, props.email, props.address, props.createdAt);
    }
}