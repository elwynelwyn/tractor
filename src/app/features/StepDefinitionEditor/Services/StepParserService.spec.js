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
import './StepParserService';
let stepParserService;

describe('StepParserService.js:', () => {
    let expectationParserService;
    let mockParserService;
    let StepModel;
    let taskParserService;

    beforeEach(() => {
        angular.mock.module('tractor.stepParserService');

        angular.mock.module($provide => {
            $provide.factory('expectationParserService', () => {
                expectationParserService = {};
                return expectationParserService;
            });

            $provide.factory('mockParserService', () => {
                mockParserService = {};
                return mockParserService;
            });

            $provide.factory('taskParserService', () => {
                taskParserService = {};
                return taskParserService;
            });
        });

        angular.mock.inject((
            _StepModel_,
            _stepParserService_
        ) => {
            StepModel = _StepModel_;
            stepParserService = _stepParserService_;
        });
    });

    describe('StepParserService.parse:', () => {
        it('should return a StepModel', () => {
            let ast = {
                expression: {
                    arguments: [{
                        raw: 'something'
                    }, {
                        body: {
                            body: []
                        }
                    }],
                    callee: {
                        property: {
                            name: 'Given'
                        }
                    }
                }
            };
            let stepDefinition = {};

            let stepModel = stepParserService.parse(stepDefinition, ast);

            expect(stepModel).to.be.an.instanceof(StepModel);
        });

        it('should parse the correct type', () => {
            let ast = {
                expression: {
                    arguments: [{
                        raw: 'something'
                    }, {
                        body: {
                            body: []
                        }
                    }],
                    callee: {
                        property: {
                            name: 'Given'
                        }
                    }
                }
            };
            let stepDefinition = {};

            let stepModel = stepParserService.parse(stepDefinition, ast);

            expect(stepModel.type).to.equal('Given');
        });

        it('should parse the correct regex', () => {
            let ast = {
                expression: {
                    arguments: [{
                        raw: 'something'
                    }, {
                        body: {
                            body: []
                        }
                    }],
                    callee: {
                        property: {
                            name: 'Given'
                        }
                    }
                }
            };
            let stepDefinition = {};

            let stepModel = stepParserService.parse(stepDefinition, ast);

            expect(stepModel.regex).to.deep.equal(/something/);
        });

        it('should parse a mock', () => {
            let ast = {
                expression: {
                    arguments: [{
                        raw: 'something'
                    }, {
                        body: {
                            body: [{
                                expression: {
                                    callee: {
                                        object: {
                                            callee: {
                                                object: {
                                                    name: 'httpBackend'
                                                },
                                                property: {
                                                    name: 'whenGET'
                                                }
                                            }
                                        }
                                    }
                                }
                            }, {
                                expression: {
                                    callee: {
                                        name: 'done'
                                    }
                                }
                            }]
                        }
                    }],
                    callee: {
                        property: {
                            name: 'Given'
                        }
                    }
                }
            };
            let mock = {};
            let stepDefinition = {};

            mockParserService.parse = angular.noop;
            sinon.stub(mockParserService, 'parse').returns(mock);

            let stepModel = stepParserService.parse(stepDefinition, ast);

            expect(stepModel.mocks.length).to.equal(1);
            expect(stepModel.mocks.includes(mock)).to.equal(true);
        });

        it('should parse a task', () => {
            let init = {};
            let ast = {
                expression: {
                    arguments: [{
                        raw: 'something'
                    }, {
                        body: {
                            body: [{
                                declarations: [{
                                    id: {
                                        name: 'tasks'
                                    },
                                    init
                                }]
                            }, {
                                expression: {
                                    callee: {
                                        object: {
                                            arguments: [{
                                                name: 'done'
                                            }]
                                        }
                                    }
                                }
                            }]
                        }
                    }],
                    callee: {
                        property: {
                            name: 'Given'
                        }
                    }
                }
            };
            let stepDefinition = {};

            taskParserService.parse = angular.noop;
            sinon.stub(taskParserService, 'parse');

            let stepModel = stepParserService.parse(stepDefinition, ast);

            expect(taskParserService.parse).to.have.been.calledWith(stepModel, init);
        });

        it('should parse an expectation', () => {
            let ast = {
                expression: {
                    arguments: [{
                        raw: 'something'
                    }, {
                        body: {
                            body: [{
                                expression: {
                                    callee: {
                                        object: {
                                            callee: {
                                                object: {
                                                    arguments: [{
                                                        elements: [{
                                                            name: 'element'
                                                        }]
                                                    }]
                                                }
                                            }
                                        }
                                    }
                                }
                            }]
                        }
                    }],
                    callee: {
                        property: {
                            name: 'Given'
                        }
                    }
                }
            };
            let expectation = {};
            let stepDefinition = {};

            expectationParserService.parse = angular.noop;
            sinon.stub(expectationParserService, 'parse').returns(expectation);

            let stepModel = stepParserService.parse(stepDefinition, ast);

            expect(stepModel.expectations.length).to.equal(1);
            expect(stepModel.expectations.includes(expectation)).to.equal(true);
        });

        it('should parse a pending step', () => {
            let ast = {
                expression: {
                    arguments: [{
                        raw: 'something'
                    }, {
                        body: {
                            body: [{
                                expression: {
                                    callee: {
                                        object: {
                                            name: 'done'
                                        },
                                        property: {
                                            name: 'pending'
                                        }
                                    }
                                }
                            }]
                        }
                    }],
                    callee: {
                        property: {
                            name: 'Given'
                        }
                    }
                }
            };
            let stepDefinition = {};

            let stepModel = stepParserService.parse(stepDefinition, ast);

            expect(stepModel).not.to.equal(null);
        });

        it('should bail out and return `null` when it cannot parse', () => {
            let ast = {
                expression: {
                    arguments: [{
                        raw: 'something'
                    }, {
                        body: {
                            body: [{}]
                        }
                    }],
                    callee: {
                        property: {
                            name: 'Given'
                        }
                    }
                }
            };
            let stepDefinition = {};

            sinon.stub(console, 'warn');

            let stepModel = stepParserService.parse(stepDefinition, ast);

            expect(stepModel).to.equal(null);

            console.warn.restore();
        });
    });
});
