/* global beforeEach:true, describe:true, it:true */
'use strict';

// Angular:
import angular from 'angular';
import 'angular-mocks';

// Utilities:
import chai from 'chai';
import sinon from 'sinon';

// Test setup:
const expect = chai.expect;

// Testing:
import './StepDefinitionParserService';
let stepDefinitionParserService;

describe('StepDefinitionParserService.js:', () => {
    let StepDefinitionModel;
    let stepParserService;

    beforeEach(() => {
        angular.mock.module('tractor.componentFileService');
        angular.mock.module('tractor.mockDataFileService');
        angular.mock.module('tractor.stepDefinitionParserService');

        angular.mock.module($provide => {
            $provide.factory('stepParserService', () => {
                stepParserService = {};
                return stepParserService;
            });
        });

        angular.mock.inject((
            _StepDefinitionModel_,
            _stepDefinitionParserService_
        ) => {
            StepDefinitionModel = _StepDefinitionModel_;
            stepDefinitionParserService = _stepDefinitionParserService_;
        });
    });

    describe('StepDefinitionParserService.parse:', () => {
        it('should return a StepDefinitionModel', () => {
            let stepDefinitionFile = {
                ast: {
                    comments: [{
                        value: JSON.stringify({})
                    }],
                    body: [{
                        expression: {
                            right: {
                                body: {
                                    body: []
                                }
                            }
                        }
                    }]
                }
            };

            let stepDefinitionModel = stepDefinitionParserService.parse(stepDefinitionFile);

            expect(stepDefinitionModel).to.be.an.instanceof(StepDefinitionModel);
        });

        it('should have the correct path', () => {
            let stepDefinitionFile = {
                ast: {
                    comments: [{
                        value: JSON.stringify({})
                    }],
                    body: [{
                        expression: {
                            right: {
                                body: {
                                    body: []
                                }
                            }
                        }
                    }]
                },
                path: 'some/path/to/step/definition'
            };

            let stepDefinitionModel = stepDefinitionParserService.parse(stepDefinitionFile);

            expect(stepDefinitionModel.path).to.equal('some/path/to/step/definition');
        });

        it('should get the name from the meta data', () => {
            let stepDefinitionFile = {
                ast: {
                    comments: [{
                        value: JSON.stringify({
                            name: 'Step Definition'
                        })
                    }],
                    body: [{
                        expression: {
                            right: {
                                body: {
                                    body: []
                                }
                            }
                        }
                    }]
                }
            };

            let stepDefinitionModel = stepDefinitionParserService.parse(stepDefinitionFile);

            expect(stepDefinitionModel.name).to.equal('Step Definition');
        });

        it('should parse any components', () => {
            let stepDefinitionFile = {
                ast: {
                    comments: [{
                        value: JSON.stringify({
                            name: 'Step Definition',
                            components: [{
                                name: 'Component'
                            }]
                        })
                    }],
                    body: [{
                        expression: {
                            right: {
                                body: {
                                    body: [{
                                        declarations: [{
                                            init: {
                                                callee: {
                                                    name: 'Component'
                                                }
                                            }
                                        }]
                                    }]
                                }
                            }
                        }
                    }]
                }
            };

            sinon.stub(StepDefinitionModel.prototype, 'addComponent');

            stepDefinitionParserService.parse(stepDefinitionFile);

            expect(StepDefinitionModel.prototype.addComponent).to.have.been.calledWith('Component');

            StepDefinitionModel.prototype.addComponent.restore();
        });

        it('should parse any mock data', () => {
            let stepDefinitionFile = {
                ast: {
                    comments: [{
                        value: JSON.stringify({
                            name: 'Step Definition',
                            mockData: [{
                                name: 'Mock Data'
                            }]
                        })
                    }],
                    body: [{
                        expression: {
                            right: {
                                body: {
                                    body: [{
                                        declarations: [{
                                            init: {
                                                arguments: [{
                                                    value: 'mockData.mock.json'
                                                }],
                                                callee: {
                                                    name: 'require'
                                                }
                                            }
                                        }]
                                    }]
                                }
                            }
                        }
                    }]
                }
            };

            sinon.stub(StepDefinitionModel.prototype, 'addMock');

            stepDefinitionParserService.parse(stepDefinitionFile);

            expect(StepDefinitionModel.prototype.addMock).to.have.been.calledWith('Mock Data');

            StepDefinitionModel.prototype.addMock.restore();
        });

        it('should parse any steps', () => {
            let statement = {};
            let stepDefinitionFile = {
                ast: {
                    comments: [{
                        value: JSON.stringify({})
                    }],
                    body: [{
                        expression: {
                            right: {
                                body: {
                                    body: [statement]
                                }
                            }
                        }
                    }]
                }
            };
            let step = {};

            stepParserService.parse = angular.noop;
            sinon.stub(stepParserService, 'parse').returns(step);

            let stepDefinitionModel = stepDefinitionParserService.parse(stepDefinitionFile);

            expect(stepParserService.parse).to.have.been.calledWith(stepDefinitionModel, statement);
            expect(stepDefinitionModel.step).to.equal(step);
        });

        it('should bail out and return `null` when it cannot parse', () => {
            let stepDefinitionFile = {
                ast: {
                    comments: [{
                        value: JSON.stringify({
                            name: 'Step Definition'
                        })
                    }],
                    body: [{
                        expression: {
                            right: {
                                body: {
                                    body: [{}]
                                }
                            }
                        }
                    }]
                }
            };

            sinon.stub(console, 'warn');

            let stepDefinitionModel = stepDefinitionParserService.parse(stepDefinitionFile);

            expect(stepDefinitionModel).to.equal(null);

            console.warn.restore();
        });
    });
});
