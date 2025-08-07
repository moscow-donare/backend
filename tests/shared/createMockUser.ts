export const createMockUser = () => ({
    userId: 1,
    email: `testuser-${Date.now()}@donare.com`,
    name: 'Test User',
    address: `0x${Math.floor(Math.random() * 1e16).toString(16).padStart(40, '0')}`,
})
