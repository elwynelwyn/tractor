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
import './TaskParserService';
let taskParserService;

describe('TaskParserService.js:', () => {
    let TaskModel;

    beforeEach(() => {
        angular.mock.module('tractor.taskParserService');

        angular.mock.inject((
            _TaskModel_,
            _taskParserService_
        ) => {
            TaskModel = _TaskModel_;
            taskParserService = _taskParserService_;
        });
    });

    describe('TaskParserService.parse:', () => {
        it('should return a TaskModel', () => {
            let step = {
                stepDefinition: {
                    componentInstances: [{
                        component: {
                            actions: [{
                                parameters: [],
                                variableName: 'action'
                            }]
                        },
                        variableName: 'component'
                    }]
                },
                tasks: []
            };
            let ast = {
                arguments: [],
                callee: {
                    object: {
                        name: 'component'
                    },
                    property: {
                        name: 'action'
                    }
                }
            };

            taskParserService.parse(step, ast);
            let [taskModel] = step.tasks;

            expect(taskModel).to.be.an.instanceof(TaskModel);
        });

        it('should parse the correct component', () => {
            let component = {
                component: {
                    actions: [{
                        parameters: [],
                        variableName: 'action'
                    }]
                },
                variableName: 'component'
            };
            let step = {
                stepDefinition: {
                    componentInstances: [component]
                },
                tasks: []
            };
            let ast = {
                arguments: [],
                callee: {
                    object: {
                        name: 'component'
                    },
                    property: {
                        name: 'action'
                    }
                }
            };

            taskParserService.parse(step, ast);
            let [taskModel] = step.tasks;

            expect(taskModel.component).to.equal(component);
        });

        it('should parse the correct action', () => {
            let action = {
                parameters: [],
                variableName: 'action'
            };
            let step = {
                stepDefinition: {
                    componentInstances: [{
                        component: {
                            actions: [action]
                        },
                        variableName: 'component'
                    }]
                },
                tasks: []
            };
            let ast = {
                arguments: [],
                callee: {
                    object: {
                        name: 'component'
                    },
                    property: {
                        name: 'action'
                    }
                }
            };

            taskParserService.parse(step, ast);
            let [taskModel] = step.tasks;

            expect(taskModel.action).to.equal(action);
        });

        it('should parse task argument values', () => {
            let step = {
                stepDefinition: {
                    componentInstances: [{
                        component: {
                            actions: [{
                                parameters: [{
                                    name: 'parameter'
                                }],
                                variableName: 'action'
                            }]
                        },
                        variableName: 'component'
                    }]
                },
                tasks: []
            };
            let ast = {
                arguments: [{
                    value: 'argument'
                }],
                callee: {
                    object: {
                        name: 'component'
                    },
                    property: {
                        name: 'action'
                    }
                }
            };

            taskParserService.parse(step, ast);
            let [taskModel] = step.tasks;

            let [argument] = taskModel.arguments;
            expect(argument.name).to.equal('Parameter');
            expect(argument.value).to.equal('argument');
        });

        it('should parse chained task', () => {
            let step = {
                stepDefinition: {
                    componentInstances: [{
                        component: {
                            actions: [{
                                parameters: [],
                                variableName: 'action'
                            }]
                        },
                        variableName: 'component1'
                    }, {
                        component: {
                            actions: [{
                                parameters: [],
                                variableName: 'action'
                            }]
                        },
                        variableName: 'component2'
                    }]
                },
                tasks: []
            };

            let ast = {
                callee: {
                    object: {
                        callee: {
                            object: {
                                name: 'component1'
                            },
                            property: {
                                name: 'action'
                            }
                        },
                        arguments: []
                    },
                    property: {
                        name: 'then'
                    }
                },
                arguments: [{
                    body: {
                        body: [{
                            argument: {
                                callee: {
                                    object: {
                                        name: 'component2'
                                    },
                                    property: {
                                        name: 'action'
                                    }
                                },
                                arguments: []
                            }
                        }]
                    }
                }]
            };

            taskParserService.parse(step, ast);
            let [taskModel1, taskModel2] = step.tasks;

            expect(taskModel1).to.be.an.instanceof(TaskModel);
            expect(taskModel2).to.be.an.instanceof(TaskModel);
        });

        it('should bail out and return `null` when it cannot parse a taskCallExpression', () => {
            let step = {};
            let ast = {};

            sinon.stub(console, 'warn');

            let taskModel = taskParserService.parse(step, ast);

            expect(taskModel).to.equal(null);

            console.warn.restore();
        });

        it('should bail out and return `null` when it cannot parse a TaskModel', () => {
            let step = {
                stepDefinition: {
                    componentInstances: []
                },
                tasks: []
            };
            let ast = {
                arguments: [],
                callee: {
                    object: {
                        name: 'component'
                    },
                    property: {
                        name: 'action'
                    }
                }
            };

            sinon.stub(console, 'warn');

            let taskModel = taskParserService.parse(step, ast);

            expect(taskModel).to.equal(null);

            console.warn.restore();
        });
    });
});
