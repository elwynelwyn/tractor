'use strict';

// Utilities:
import assert from 'assert';

// Dependencies:
import angular from 'angular';
import ExpectationParserService from '../Services/ExpectationParserService';
import MockParserService from '../Services/MockParserService';
import StepModel from '../Models/StepModel';
import TaskParserService from '../Services/TaskParserService';

class StepParserService {
    constructor (
        expectationParserService,
        mockParserService,
        StepModel,
        taskParserService
    ) {
        this.expectationParserService = expectationParserService;
        this.mockParserService = mockParserService;
        this.StepModel = StepModel;
        this.taskParserService = taskParserService;
    }

    parse (stepDefinition, ast) {
        try {
            let step = new this.StepModel(stepDefinition);

            let stepCallExpression = ast.expression;
            step.type = parseType(step, stepCallExpression);
            step.regex = parseRegex(step, stepCallExpression);

            let [stepFunction] = ast.expression.arguments.slice().reverse();
            let statements = stepFunction.body.body;
            let parsers = [parseMock, parseTask, parseExpectation, parsePending, parseMockDone, parseTaskDone];
            tryParse.call(this, step, statements, parsers);

            return step;
        } catch (e) {
            console.warn('Invalid step:', ast);
            return null;
        }
    }
}

function parseType (step, stepCallExpression) {
    let type = stepCallExpression.callee.property.name;
    assert(step.stepTypes.includes(type));
    return type;
}

function parseRegex (step, stepCallExpression) {
    let [stepRegexArgument] = stepCallExpression.arguments;
    let regex = stepRegexArgument.raw.replace(/^\//, '').replace(/\/$/, '');
    assert(regex);
    return new RegExp(regex);
}

function tryParse (step, statements, parsers) {
    statements.map(statement => {
        let parsed = parsers.some(parser => {
            try {
                return parser.call(this, step, statement);
            } catch (e) {}
        });
        if (!parsed) {
            throw new Error();
        }
    });
}

function parseMock (step, statement) {
    let httpBackendOnloadMemberExpression = statement.expression.callee.object.callee;
    assert(httpBackendOnloadMemberExpression.object.name === 'httpBackend');
    assert(httpBackendOnloadMemberExpression.property.name.indexOf('when') === 0);
    let mock = this.mockParserService.parse(step, statement);
    assert(mock);
    step.mocks.push(mock);
    return true;
}

function parseTask (step, statement) {
    let [tasksDeclaration] = statement.declarations;
    assert(tasksDeclaration.id.name === 'tasks');
    this.taskParserService.parse(step, tasksDeclaration.init);
    return true;
}

function parseExpectation (step, statement) {
    let [argument] = statement.expression.callee.object.callee.object.arguments
    argument.elements.forEach(element => {
        assert(!(element.name && element.name === 'tasks'));
        let expectation = this.expectationParserService.parse(step, element);
        assert(expectation);
        step.expectations.push(expectation);
    });
    return true;
}

function parsePending (step, statement) {
    let callee = statement.expression.callee;
    assert(callee.object.name === 'callback' || callee.object.name === 'done');
    assert(callee.property.name === 'pending');
    return true;
}

function parseMockDone (step, statement) {
    assert(statement.expression.callee.name === 'done');
    return true;
}

function parseTaskDone (step, statement) {
    let [argument] = statement.expression.callee.object.arguments;
    assert(argument.name === 'done');
    return true;
}

export default angular.module('tractor.stepParserService', [
    ExpectationParserService.name,
    MockParserService.name,
    StepModel.name,
    TaskParserService.name
])
.service('stepParserService', StepParserService);
