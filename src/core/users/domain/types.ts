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
}