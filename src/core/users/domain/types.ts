export type UserDB = {
    id: number;
    full_name: string;
    email: string;
    address: string;
    created_at: Date | null;
}

export type UserInputFromWeb3Auth = {
    userId: string;
    email: string;
    name: string;
    address: string;
    provider: string;
}

export type UserDataDB = {
    id: number;
    user_id: number;
    birthday: Date | null;
    country: string | null;
    state: string | null;
    city: string | null;
    gender: string | null;
    provider: string | null;
    created_at: Date | null;
    updated_at: Date | null;
}