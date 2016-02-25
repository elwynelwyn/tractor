'use strict';

// Utilities:
import assert from 'assert';

// Dependencies:
import angular from 'angular';
import MockModel from '../Models/MockModel';

class MockParserService {
    constructor (
        MockModel
    ) {
        this.MockModel = MockModel;
    }

    parse (step, ast) {
        try {
            let mock = new this.MockModel(step);

            let mockCallExpression = ast.expression;

            parseAction(mock, mockCallExpression);
            parseUrl(mock, mockCallExpression);

            let parsers = [parseData, parsePassThrough];
            tryParse.call(this, mock, mockCallExpression, parsers);

            return mock;
        } catch (e) {
            console.warn('Invalid mock:', ast);
            return null;
        }
    }
}

function tryParse (mock, mockCallExpression, parsers) {
    let parsed = parsers.some(parser => {
        try {
            return parser.call(this, mock, mockCallExpression);
        } catch (e) {}
    });
    if (!parsed) {
        throw new Error();
    }
}

function parseAction (mock, mockCallExpression) {
    let action = mockCallExpression.callee.object.callee.property.name.replace(/^when/, '');
    assert(action);
    assert(mock.actions.includes(action));
    mock.action = action;
    return true;
}

function parseUrl (mock, mockCallExpression) {
    let [argument] = mockCallExpression.callee.object.arguments.slice().reverse();
    let url = argument.raw;
    let urlRegex = new RegExp(url.replace(/^\//, '').replace(/\/$/, ''));
    assert(urlRegex);
    mock.url = urlRegex.source;
    return true;
}

function parseData (mock, mockCallExpression) {
    let [argument] = mockCallExpression.arguments;
    let instanceName = argument.name;
    mock.data = mock.step.stepDefinition.mockDataInstances.find(mockDataInstance => {
        return mockDataInstance.variableName === instanceName;
    });
    return true;
}

function parsePassThrough (mock, mockCallExpression) {
    assert(mockCallExpression.callee.property.name === 'passThrough');
    mock.passThrough = true;
    return true;
}

export default angular.module('tractor.mockParserService', [
    MockModel.name
])
.service('mockParserService', MockParserService);
