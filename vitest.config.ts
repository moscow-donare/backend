import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['tests/setup.ts']
    }
})
