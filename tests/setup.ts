import "src/shared/global.ts";
import { beforeEach, vi } from "vitest";

const mockUser = {
    userId: 'testuser@donare.com',
    email: 'testuser@donare.com',
    name: 'Test User',
    address: '0xabc123abc123abc123abc123abc123abc123abc1',
}

beforeEach(async () => {
    const { Web3AuthRepository } = await import('src/infraestructure/repositories/web3auth/Web3AuthRepository')
    vi.spyOn(Web3AuthRepository.prototype, 'getUserInfo').mockResolvedValue(Result.Ok(mockUser))

})

