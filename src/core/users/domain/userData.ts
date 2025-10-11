export class UserData {
    private constructor(
        public readonly id: number | null,
        public userId: number,
        public birthday: Date | null,
        public country: string | null,
        public state: string | null,
        public city: string | null,
        public gender: string | null,   
        public provider: string | null,
        public createdAt: Date,
        public updatedAt: Date
    ) { }

    static create(props: {
        userId: number;
        birthday: Date | null;
        country: string | null;
        state: string | null;
        city: string | null;
        gender: string | null;
        provider: string | null;
        createdAt: Date;
        updatedAt: Date;
    }): UserData {
        return new UserData(null, props.userId, props.birthday, props.country, props.state, props.city, props.gender, props.provider, props.createdAt, props.updatedAt);
    }

    static createWithId(props: {
        id: number;
        userId: number;
        birthday: Date | null;
        country: string | null;
        state: string | null;
        city: string | null;
        gender: string | null;
        provider: string | null;
        createdAt: Date;
        updatedAt: Date;
    }): UserData {
        return new UserData(props.id, props.userId, props.birthday, props.country, props.state, props.city, props.gender, props.provider, props.createdAt, props.updatedAt);
    }
}