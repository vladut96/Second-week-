import { req } from './test-helpers';
import { db } from '../src/db/db'; // Import your database to verify data is cleared

describe('/testing/all-data', () => {
    // Optional: Add setup code to populate the database before tests
    beforeEach(() => {
        db.blogs = [{
            id: 'string',
            name: 'string',
            description: 'string',
            websiteUrl: 'https://chat.deepseek.com/a/chat/s/30547b21-4cb5-4824-a815-f2e38ae5b18b'
        }];

    });

    it('should clear all data and return 204', async () => {
        // Send a DELETE request to the endpoint
        await req
            .delete('/testing/all-data')
            .expect(204);

        // Verify that the data is cleared
        expect(db.blogs.length).toBe(0);
        expect(db.posts.length).toBe(0);
    });

    it('should return 204 even if the database is already empty', async () => {
        // Clear the database before the test
        db.blogs = [];
        db.posts = [];

        // Send a DELETE request to the endpoint
        await req
            .delete('/testing/all-data')
            .expect(204);

        // Verify that the data remains empty
        expect(db.blogs.length).toBe(0);
        expect(db.posts.length).toBe(0);
    });
});