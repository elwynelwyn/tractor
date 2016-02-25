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
import './ComponentParserService';
let componentParserService;

describe('ComponentParserService.js:', () => {
    let actionParserService;
    let elementParserService;
    let persistentStateService;

    beforeEach(() => {
        angular.mock.module('tractor.componentParserService');

        angular.mock.module($provide => {
            $provide.factory('actionParserService', () => {
                actionParserService = {};
                return actionParserService;
            });
            $provide.factory('elementParserService', () => {
                elementParserService = {};
                return elementParserService;
            });
            $provide.factory('persistentStateService', () => {
                persistentStateService = {};
                return persistentStateService;
            });
        });

        angular.mock.inject((
            _componentParserService_
        ) => {
            componentParserService = _componentParserService_;
        });
    });

    describe('ComponentParserService.parse:', () => {
        it('should return a `ComponentModel`', () => {
            let ast = {
                body: [{
                    expression: {
                        right: {
                            callee: {
                                body: {
                                    body: []
                                }
                            }
                        }
                    }
                }],
                comments: [{
                    value: JSON.stringify({
                        name: 'Component'
                    })
                }]
            };
            let path = 'path';
            let componentFile = { ast, path };

            persistentStateService.get = angular.noop;
            sinon.stub(persistentStateService, 'get');

            let component = componentParserService.parse(componentFile);

            expect(component.isSaved).to.equal(true);
            expect(component.path).to.equal('path');
        });

        it('should attempt to parse each statement into an `ElementModel`', () => {
            let statement1 = {};
            let statement2 = {};
            let ast = {
                body: [{
                    expression: {
                        right: {
                            callee: {
                                body: {
                                    body: [{
                                        declarations: [{
                                            init: {
                                                body: {
                                                    body: [statement1, statement2]
                                                }
                                            }
                                        }]
                                    }]
                                }
                            }
                        }
                    }
                }],
                comments: [{
                    value: JSON.stringify({
                        name: 'Component',
                        elements: [{
                            name: 'element 1'
                        }, {
                            name: 'element 2'
                        }]
                    })
                }]
            };
            let path = 'path';
            let componentFile = { ast, path };
            let state = {
                'element 1': true
            };

            let element1 = {};
            let element2 = {};
            persistentStateService.get = angular.noop;
            sinon.stub(persistentStateService, 'get').returns(state);
            elementParserService.parse = angular.noop;
            sinon.stub(elementParserService, 'parse')
            .onCall(0).returns(element1)
            .onCall(1).returns(element2);

            let component = componentParserService.parse(componentFile);
            let [elementModel1, elementModel2] = component.domElements;

            expect(elementParserService.parse).to.have.been.calledWith(component, statement1);
            expect(elementParserService.parse).to.have.been.calledWith(component, statement2);
            expect(elementModel1.name).to.equal('element 1');
            expect(elementModel1.minimised).to.equal(true);
            expect(elementModel2.name).to.equal('element 2');
            expect(elementModel2.minimised).to.equal(false);
            /* eslint-disable no-magic-numbers */
            expect(component.elements.length).to.equal(3);
            expect(component.domElements.length).to.equal(2);
            /* eslint-enable no-magic-numbers */
        });

        it('should attempt to parse each statement into an `ActionModel`', () => {
            let statement1 = {
                expression: {}
            };
            let statement2 = {
                expression: {}
            };
            let ast = {
                body: [{
                    expression: {
                        right: {
                            callee: {
                                body: {
                                    body: [statement1, statement2]
                                }
                            }
                        }
                    }
                }],
                comments: [{
                    value: JSON.stringify({
                        name: 'Component',
                        actions: [{
                            name: 'action 1'
                        }, {
                            name: 'action 2'
                        }]
                    })
                }]
            };
            let path = 'path';
            let componentFile = { ast, path };
            let state = {
                'action 1': true
            };

            let action1 = {};
            let action2 = {};
            persistentStateService.get = angular.noop;
            sinon.stub(persistentStateService, 'get').returns(state);
            actionParserService.parse = angular.noop;
            sinon.stub(actionParserService, 'parse')
            .onCall(0).returns(action1)
            .onCall(1).returns(action2);

            let component = componentParserService.parse(componentFile);
            let [actionModel1, actionModel2] = component.actions;

            expect(actionParserService.parse).to.have.been.calledWith(component, statement1);
            expect(actionParserService.parse).to.have.been.calledWith(component, statement2);
            expect(actionModel1.name).to.equal('action 1');
            expect(actionModel1.minimised).to.equal(true);
            expect(actionModel2.name).to.equal('action 2');
            expect(actionModel2.minimised).to.equal(false);
            expect(component.actions.length).to.equal(2);
        });

        it('should attempt to parse each statement as `ReturnStatement`', () => {
            let ast = {
                body: [{
                    expression: {
                        right: {
                            callee: {
                                body: {
                                    body: [{
                                        argument: {
                                            name: 'Component'
                                        }
                                    }]
                                }
                            }
                        }
                    }
                }],
                comments: [{
                    value: JSON.stringify({
                        name: 'Component'
                    })
                }]
            };
            let path = 'path';
            let componentFile = { ast, path };

            persistentStateService.get = angular.noop;
            sinon.stub(persistentStateService, 'get');
            actionParserService.parse = angular.noop;
            sinon.stub(actionParserService, 'parse');

            let component = componentParserService.parse(componentFile);

            expect(component).not.to.equal(null);
        });

        it('should bail out and return `null` when it cannot parse', () => {
            let ast = {
                body: [{
                    expression: {
                        right: {
                            callee: {
                                body: {
                                    body: [{}]
                                }
                            }
                        }
                    }
                }],
                comments: [{
                    value: JSON.stringify({
                        name: 'Component'
                    })
                }]
            };
            let componentFile = { ast };

            sinon.stub(console, 'warn');
            persistentStateService.get = angular.noop;
            sinon.stub(persistentStateService, 'get');
            elementParserService.parse = angular.noop;
            sinon.stub(elementParserService, 'parse').throws();
            actionParserService.parse = angular.noop;
            sinon.stub(actionParserService, 'parse').throws();

            let component = componentParserService.parse(componentFile);

            expect(component).to.equal(null);
            expect(console.warn).to.have.been.calledWith('Invalid component:');

            console.warn.restore();
        });
    });
});
