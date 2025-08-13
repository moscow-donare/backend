const createMockUser = (id: number) => ({
    userId: id,
    email: `testuser${id}@donare.com`,
    name: `Test User${id}`,
    address: `0x${id.toString(16).padStart(40, '0')}`,
})

export class CreateMockUser {
    private startId = 1;
    private constructor() { }

    static instance: CreateMockUser;

    static getInstance() {
        if (!CreateMockUser.instance) {
            CreateMockUser.instance = new CreateMockUser();
        }
        return CreateMockUser.instance;
    }

    public create() {
        const user = createMockUser(this.startId);
        this.startId++;
        return user;
    }
}
