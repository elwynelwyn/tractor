'use strict';

// Utilities:
import Promise from 'bluebird';

// Dependencies:
import createTestDirectoryStructure from './server/cli/init/create-test-directory-structure';
import del from 'del';

// Constants:
const TRACTOR_E2E_TESTS_RUNNING = './tractor_e2e_tests_running';

export default {
    environments: [
        'http://localhost:3000',
        'http://localhost:4000'
    ],
	beforeProtractor () {
        const fileStructure = require('./server/file-structure');

		this._testDirectory = this.testDirectory;
		this.testDirectory = TRACTOR_E2E_TESTS_RUNNING;
        return createTestDirectoryStructure.run(this.testDirectory)
        .then(() => fileStructure.refresh());
	},
	afterProtractor () {
        const fileStructure = require('./server/file-structure');

		this.testDirectory = this._testDirectory;
		delete this._testDirectory;
        return fileStructure.refresh()
        .then(() => del(TRACTOR_E2E_TESTS_RUNNING, {
            force: true
        }));
	}
};
