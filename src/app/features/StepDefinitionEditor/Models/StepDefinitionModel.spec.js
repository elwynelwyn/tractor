/* global beforeEach:true, describe:true, it:true */
'use strict';

// Angular:
import angular from 'angular';
import 'angular-mocks';

// Utilities:
import chai from 'chai';
import dedent from 'dedent';

// Test setup:
const expect = chai.expect;

// Dependencies:
import escodegen from 'escodegen';
import './StepModel';

// Testing:
import './StepDefinitionModel';
let StepDefinitionModel;

describe('StepDefinitionModel.js:', () => {
    let ComponentInstanceModel;
    let MockDataInstanceModel;
    let StepModel;

    beforeEach(() => {
        angular.mock.module('tractor.componentFileService');
        angular.mock.module('tractor.mockDataFileService');
        angular.mock.module('tractor.stepDefinitionModel');
        angular.mock.module('tractor.stepModel');

        angular.mock.inject((
            _ComponentInstanceModel_,
            _MockDataInstanceModel_,
            _StepDefinitionModel_,
            _StepModel_
        ) => {
            ComponentInstanceModel = _ComponentInstanceModel_;
            MockDataInstanceModel = _MockDataInstanceModel_;
            StepDefinitionModel = _StepDefinitionModel_;
            StepModel = _StepModel_;
        });
    });

    describe('StepDefinitionModel constructor:', () => {
        it('should create a new `StepDefinitionModel`', () => {
            let options = {};

            let stepDefinitionModel = new StepDefinitionModel(options);

            expect(stepDefinitionModel).to.be.an.instanceof(StepDefinitionModel);
        });
    });

    describe('StepDefinitionModel.availableComponents:', () => {
        it('should get the availableComponents from the options object', () => {
            let availableComponents = [];
            let options = { availableComponents };

            let stepDefinitionModel = new StepDefinitionModel(options);

            expect(stepDefinitionModel.availableComponents).to.equal(availableComponents);
        });

        it('should default to an empty array', () => {
            let stepDefinitionModel = new StepDefinitionModel();

            expect(stepDefinitionModel.availableComponents).to.deep.equal([]);
        });
    });

    describe('StepDefinitionModel.availableMockData:', () => {
        it('should get the availableMockData from the options object', () => {
            let availableMockData = [];
            let options = { availableMockData };

            let stepDefinitionModel = new StepDefinitionModel(options);

            expect(stepDefinitionModel.availableMockData).to.equal(availableMockData);
        });

        it('should default to an empty array', () => {
            let stepDefinitionModel = new StepDefinitionModel();

            expect(stepDefinitionModel.availableMockData).to.deep.equal([]);
        });
    });

    describe('StepDefinitionModel.path:', () => {
        it('should get the path from the options object', () => {
            let options = {
                path: 'some/path'
            };

            let stepDefinitionModel = new StepDefinitionModel(options);

            expect(stepDefinitionModel.path).to.equal('some/path');
        });
    });

    describe('StepDefinitionModel.components:', () => {
        it('should default to an empty array', () => {
            let stepDefinitionModel = new StepDefinitionModel();

            expect(stepDefinitionModel.components).to.deep.equal([]);
        });
    });

    describe('StepDefinitionModel.componentInstances:', () => {
        it('should default to an empty array', () => {
            let stepDefinitionModel = new StepDefinitionModel();

            expect(stepDefinitionModel.componentInstances).to.deep.equal([]);
        });
    });

    describe('StepDefinitionModel.mockData:', () => {
        it('should default to an empty array', () => {
            let stepDefinitionModel = new StepDefinitionModel();

            expect(stepDefinitionModel.mockData).to.deep.equal([]);
        });
    });

    describe('StepDefinitionModel.mockDataInstances:', () => {
        it('should default to an empty array', () => {
            let stepDefinitionModel = new StepDefinitionModel();

            expect(stepDefinitionModel.mockDataInstances).to.deep.equal([]);
        });
    });

    describe('StepDefinitionModel.meta:', () => {
        it('should contain the name of the StepDefinitionModel, all the ComponentInstanceModels, and all the MockDataInstanceModels', () => {
            let options = {
                availableMockData: [{
                    name: 'mock data'
                }],
                availableComponents: [{
                    name: 'component'
                }]
            }
            let stepDefinitionModel = new StepDefinitionModel(options);
            stepDefinitionModel.name = 'step definition';

            stepDefinitionModel.addMock('mock data');
            stepDefinitionModel.addComponent('component');

            expect(stepDefinitionModel.meta).to.equal(JSON.stringify({
                name: 'step definition',
                components: [{
                    name: 'component'
                }],
                mockData: [{
                    name: 'mock data'
                }]
            }));
        });
    });

    describe('StepDefinitionModel.ast:', () => {
        it('should be the AST of the StepDefinition', () => {
            let options = {
                path: 'some/path/to/step definition'
            };
            let stepDefinitionModel = new StepDefinitionModel(options);
            stepDefinitionModel.name = 'step definition';

            let step = new StepModel();
            step.type = 'Given';
            step.regex = /something/;
            stepDefinitionModel.step = step;

            let { ast } = stepDefinitionModel;

            expect(escodegen.generate(ast)).to.equal(dedent(`
                module.exports = function () {
                    this.Given(/something/, function (done) {
                        done.pending();
                    });
                };
            `));
        });

        it('should include any necessary mockData and components', () => {
            let options = {
                availableMockData: [{
                    name: 'mock data',
                    path: 'some/path/to/mock'
                }],
                availableComponents: [{
                    name: 'component',
                    path: 'some/path/to/component',
                    variableName: 'Component'
                }],
                path: 'some/path/to/step definition'
            };
            let stepDefinitionModel = new StepDefinitionModel(options);
            stepDefinitionModel.name = 'step definition';

            stepDefinitionModel.addMock('mock data');
            stepDefinitionModel.addComponent('component');
            let step = new StepModel();
            step.type = 'Given';
            step.regex = /something/;
            stepDefinitionModel.step = step;

            let { ast } = stepDefinitionModel;

            expect(escodegen.generate(ast)).to.equal(dedent(`
                module.exports = function () {
                    var Component = require('component'), component = new Component();
                    var mockData = require('mock');
                    this.Given(/something/, function (done) {
                        done.pending();
                    });
                };
            `));
        });
    });

    describe('StepDefinitionModel.data:', () => {
        it('should be an alias for the AST of the StepDefinition:', () => {
            let options = {
                availableMockData: [{
                    name: 'mock data',
                    path: 'some/path/to/mock'
                }],
                availableComponents: [{
                    name: 'component',
                    path: 'some/path/to/component',
                    variableName: 'Component'
                }],
                path: 'some/path/to/step definition'
            };
            let stepDefinitionModel = new StepDefinitionModel(options);
            stepDefinitionModel.name = 'step definition';

            stepDefinitionModel.addMock('mock data');
            stepDefinitionModel.addComponent('component');
            let step = new StepModel();
            step.type = 'Given';
            step.regex = /something/;
            stepDefinitionModel.step = step;

            expect(stepDefinitionModel.ast).to.deep.equal(stepDefinitionModel.data);
        });
    });

    describe('StepDefinitionModel.addComponent:', () => {
        it('should look up the component by name and add it to the StepDefintionModel', () => {
            let availableComponent = {
                name: 'component'
            };
            let options = {
                availableComponents: [availableComponent]
            };
            let stepDefinitionModel = new StepDefinitionModel(options);

            stepDefinitionModel.addComponent('component');

            expect(stepDefinitionModel.components.length).to.equal(1);
            let [component] = stepDefinitionModel.components;
            expect(component).to.equal(availableComponent);
        });

        it('should also add a ComponentInstanceModel to the StepDefintionModel', () => {
            let availableComponent = {
                name: 'component'
            };
            let options = {
                availableComponents: [availableComponent]
            };
            let stepDefinitionModel = new StepDefinitionModel(options);

            stepDefinitionModel.addComponent('component');

            expect(stepDefinitionModel.componentInstances.length).to.equal(1)
            let [componentInstance] = stepDefinitionModel.componentInstances;
            expect(componentInstance).to.be.an.instanceof(ComponentInstanceModel);
            expect(componentInstance.component).to.equal(availableComponent);
        });

        it(`shouldn't add it if it has already been added`, () => {
            let availableComponent = {
                name: 'component'
            };
            let options = {
                availableComponents: [availableComponent]
            };
            let stepDefinitionModel = new StepDefinitionModel(options);

            stepDefinitionModel.addComponent('component');
            stepDefinitionModel.addComponent('component');

            expect(stepDefinitionModel.components.length).to.equal(1);
        });
    });

    describe('StepDefinitionModel.removeComponent:', () => {
        it('should remove the component', () => {
            let availableComponent = {
                name: 'component'
            };
            let options = {
                availableComponents: [availableComponent]
            };
            let stepDefinitionModel = new StepDefinitionModel(options);

            stepDefinitionModel.addComponent('component');
            let [toRemove] = stepDefinitionModel.componentInstances;
            stepDefinitionModel.removeComponent(toRemove);

            expect(stepDefinitionModel.components.length).to.equal(0);
        });

        it('should remove the corresponding ComponentInstance', () => {
            let availableComponent = {
                name: 'component'
            };
            let options = {
                availableComponents: [availableComponent]
            };
            let stepDefinitionModel = new StepDefinitionModel(options);

            stepDefinitionModel.addComponent('component');
            let [toRemove] = stepDefinitionModel.componentInstances;
            stepDefinitionModel.removeComponent(toRemove);

            expect(stepDefinitionModel.componentInstances.length).to.equal(0);
        });
    });

    describe('StepDefinitionModel.addMock:', () => {
        it('should look up the mockData by name and add it to the StepDefintionModel', () => {
            let availableMockData = {
                name: 'mock data'
            };
            let options = {
                availableMockData: [availableMockData]
            };
            let stepDefinitionModel = new StepDefinitionModel(options);

            stepDefinitionModel.addMock('mock data');

            expect(stepDefinitionModel.mockData.length).to.equal(1);
            let [mockData] = stepDefinitionModel.mockData;
            expect(mockData).to.equal(availableMockData);
        });

        it('should also add a MockDataInstanceModel to the StepDefintionModel', () => {
            let availableMockData = {
                name: 'mock data'
            };
            let options = {
                availableMockData: [availableMockData]
            };
            let stepDefinitionModel = new StepDefinitionModel(options);

            stepDefinitionModel.addMock('mock data');

            expect(stepDefinitionModel.mockDataInstances.length).to.equal(1)
            let [mockDataInstance] = stepDefinitionModel.mockDataInstances;
            expect(mockDataInstance).to.be.an.instanceof(MockDataInstanceModel);
            expect(mockDataInstance.mockData).to.equal(availableMockData);
        });

        it(`shouldn't add it if it has already been added`, () => {
            let availableMockData = {
                name: 'mock data'
            };
            let options = {
                availableMockData: [availableMockData]
            };
            let stepDefinitionModel = new StepDefinitionModel(options);

            stepDefinitionModel.addMock('mock data');
            stepDefinitionModel.addMock('mock data');

            expect(stepDefinitionModel.mockData.length).to.equal(1);
        });
    });

    describe('StepDefinitionModel.removeMock:', () => {
        it('should remove the mockData', () => {
            let availableMockData = {
                name: 'mock data'
            };
            let options = {
                availableMockData: [availableMockData]
            };
            let stepDefinitionModel = new StepDefinitionModel(options);

            stepDefinitionModel.addMock('mock data');
            let [toRemove] = stepDefinitionModel.mockDataInstances;
            stepDefinitionModel.removeMock(toRemove);

            expect(stepDefinitionModel.mockData.length).to.equal(0);
        });

        it('should remove the corresponding MockDataInstance', () => {
            let availableMockData = {
                name: 'mock data'
            };
            let options = {
                availableMockData: [availableMockData]
            };
            let stepDefinitionModel = new StepDefinitionModel(options);

            stepDefinitionModel.addMock('mock data');
            let [toRemove] = stepDefinitionModel.mockDataInstances;
            stepDefinitionModel.removeMock(toRemove);

            expect(stepDefinitionModel.mockDataInstances.length).to.equal(0);
        });
    });
});
