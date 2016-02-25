'use strict';

// Utilities:
import assert from 'assert';

// Dependencies:
import angular from 'angular';
import MockDataModel from '../Models/MockDataModel';

class MockDataParserService {
    constructor (MockDataModel) {
        this.MockDataModel = MockDataModel;
    }

    parse (mockDataFile) {
        try {
            let { content, path } = mockDataFile;
            let mockDataModel = new this.MockDataModel(content, {
                isSaved: true,
                path
            });

            parseMockData(mockDataModel, mockDataFile);

            return mockDataModel;
        } catch (e) {
            console.warn('Invalid mock data:', mockDataFile.content);
            return null;
        }
    }
}

function parseMockData (mockDataModel, mockDataFile) {
    let { name } = mockDataFile;
    mockDataModel.name = name;
    assert(mockDataModel.name);
}

export default angular.module('tractor.mockDataParserService', [
    MockDataModel.name
])
.service('mockDataParserService', MockDataParserService);
