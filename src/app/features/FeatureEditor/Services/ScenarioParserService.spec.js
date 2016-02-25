/* global beforeEach:true, describe:true, it:true */
'use strict';

// Angular:
import angular from 'angular';
import 'angular-mocks';

// Utilities:
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

// Test setup:
const expect = chai.expect;
chai.use(sinonChai);

// Testing:
import './ScenarioParserService';
let scenarioParserService;

describe('ScenarioParserService.js:', () => {
    let exampleParserService;
    let ScenarioModel;
    let stepDeclarationParserService;

    beforeEach(() => {
        angular.mock.module('tractor.scenarioParserService');

        angular.mock.module($provide => {
            $provide.factory('exampleParserService', () => {
                exampleParserService = {};
                return exampleParserService;
            });
            $provide.factory('FeatureIndent', () => {
                return '  ';
            });
            $provide.factory('FeatureNewLine', () => {
                return '\n';
            });
            $provide.factory('stepDeclarationParserService', () => {
                stepDeclarationParserService = {};
                return stepDeclarationParserService;
            });
        });

        angular.mock.inject((
            _scenarioParserService_,
            _ScenarioModel_
        ) => {
            scenarioParserService = _scenarioParserService_;
            ScenarioModel = _ScenarioModel_;
        });
    });

    describe('ScenarioParserService.parse:', () => {
        it('should return a `ScenarioModel`', () => {
            let tokens = {
                examples: [],
                name: 'scenario',
                stepDeclarations: []
            };

            let scenarioModel = scenarioParserService.parse(tokens);

            expect(scenarioModel).to.be.an.instanceof(ScenarioModel);
        });

        it('should parse the name of the scenario', () => {
            let tokens = {
                examples: [],
                name: 'scenario',
                stepDeclarations: []
            };

            let scenarioModel = scenarioParserService.parse(tokens);

            expect(scenarioModel.name).to.equal('scenario');
        });

        it('should parse each `example` into an `ExampleModel`', () => {
            let example = {};
            let tokens = {
                examples: [example],
                name: 'scenario',
                stepDeclarations: []
            };

            let exampleModel = {};
            exampleParserService.parse = angular.noop;
            sinon.stub(exampleParserService, 'parse').returns(exampleModel);

            let scenarioModel = scenarioParserService.parse(tokens);

            expect(exampleParserService.parse).to.have.been.calledWith(scenarioModel, example);
            expect(scenarioModel.examples.length).to.equal(1);
        });

        it('should parse each `stepDeclaration` into an `StepDeclarationModel`', () => {
            let stepDeclaration = {};
            let tokens = {
                examples: [],
                name: 'scenario',
                stepDeclarations: [stepDeclaration]
            };

            let stepDeclarationModel = {};
            stepDeclarationParserService.parse = angular.noop;
            sinon.stub(stepDeclarationParserService, 'parse').returns(stepDeclarationModel);

            let scenarioModel = scenarioParserService.parse(tokens);

            expect(stepDeclarationParserService.parse).to.have.been.calledWith(stepDeclaration);
            expect(scenarioModel.stepDeclarations.length).to.equal(1);
        });

        it('should bail out and return `null` when it cannot parse', () => {
            let tokens = {
                name: 'scenario'
            };

            sinon.stub(console, 'warn');

            let scenarioModel = scenarioParserService.parse(tokens);

            expect(scenarioModel).to.equal(null);

            console.warn.restore();
        });
    });
});
