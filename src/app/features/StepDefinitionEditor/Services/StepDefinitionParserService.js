'use strict';

// Utilities:
import assert from 'assert';

// Dependencies:
import angular from 'angular';
import StepParserService from '../Services/StepParserService';
import StepDefinitionModel from '../Models/StepDefinitionModel';

class StepDefinitionParserService {
    constructor (
        stepParserService,
        StepDefinitionModel
    ) {
        this.stepParserService = stepParserService;
        this.StepDefinitionModel = StepDefinitionModel;
    }

    parse (stepDefinitionFile, availableComponents, availableMockData) {
        try {
            let ast = stepDefinitionFile.ast;
            let [metaComment] = ast.comments;
            let meta = JSON.parse(metaComment.value);

            let stepDefinition = new this.StepDefinitionModel({
                availableComponents,
                availableMockData,
                path: stepDefinitionFile.path
            });
            stepDefinition.name = meta.name;

            let [module] = ast.body;
            let statements = module.expression.right.body.body;

            let parsers = [parseComponent, parseMock, parseStep];
            tryParse.call(this, stepDefinition, statements, meta, parsers);

            return stepDefinition;
        } catch (e) {
            console.warn('Invalid step definition:', stepDefinitionFile.ast);
            return null;
        }
    }
}

function tryParse (stepDefinition, statements, meta, parsers) {
    statements.map(statement => {
        let parsed = parsers.some(parser => {
            try {
                return parser.call(this, stepDefinition, statement, meta);
            } catch (e) { }
        });
        if (!parsed) {
            throw new Error();
        }
    });
}

function parseComponent (stepDefinition, statement, meta) {
    let [declarator] = statement.declarations.slice().reverse();
    let name = declarator.init.callee.name;
    assert(name !== 'require');
    stepDefinition.addComponent(meta.components[stepDefinition.components.length].name);
    return true;
}

function parseMock (stepDefinition, statement, meta) {
    let [declarator] = statement.declarations;
    let name = declarator.init.callee.name;
    assert(name === 'require');
    let [path] = declarator.init.arguments;
    assert(path.value.match(/\.mock.json$/));
    stepDefinition.addMock(meta.mockData[stepDefinition.mockData.length].name);
    return true;
}

function parseStep (stepDefinition, statement) {
    let step = this.stepParserService.parse(stepDefinition, statement);
    assert(step);
    stepDefinition.step = step;
    return true;
}

export default angular.module('tractor.stepDefinitionParserService', [
    StepParserService.name,
    StepDefinitionModel.name
])
.service('stepDefinitionParserService', StepDefinitionParserService);
