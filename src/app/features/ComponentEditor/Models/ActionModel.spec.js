/* global beforeEach:true, describe:true, it:true */
'use strict';

// Angular:
import angular from 'angular';
import 'angular-mocks';

// Utilities:
import chai from 'chai';
import dedent from 'dedent';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

// Test setup:
const expect = chai.expect;
chai.use(sinonChai);

// Dependencies:
import escodegen from 'escodegen';

// Testing:
import './ActionModel';
let ActionModel;

describe('ActionModel.js:', () => {
    let ParameterModel;
    let InteractionModel;

    beforeEach(() => {
        angular.mock.module('tractor.actionModel');

        angular.mock.inject((_ActionModel_, _ParameterModel_, _InteractionModel_) => {
            ActionModel = _ActionModel_;
            ParameterModel = _ParameterModel_;
            InteractionModel = _InteractionModel_;
        });
    });

    describe('ActionModel constructor:', () => {
        it('should create a new `ActionModel`:', () => {
            let actionModel = new ActionModel();
            expect(actionModel).to.be.an.instanceof(ActionModel);
        });

        it('should have default properties:', () => {
            let component = {};
            let actionModel = new ActionModel(component);

            expect(actionModel.component).to.equal(component);
            expect(actionModel.interactions.length).to.equal(0);
            expect(actionModel.parameters.length).to.equal(0);
            expect(actionModel.name).to.equal('');
            expect(actionModel.meta).to.deep.equal({
                name: '',
                parameters: []
            });
        });
    });

    describe('ActionModel.variableName:', () => {
        it('should turn the full name of the Action into a JS variable:', () => {
            let actionModel = new ActionModel();

            actionModel.name = 'A long name that describes the action.';
            expect(actionModel.variableName).to.equal('aLongNameThatDescribesTheAction');
        });
    });

    describe('ActionModel.meta:', () => {
        it('should contain the full name of the Action:', () => {
            let actionModel = new ActionModel();

            actionModel.name = 'A long name that describes the Action.';
            expect(actionModel.meta.name).to.equal('A long name that describes the Action.');
        });

        it('should contain the meta data for the Parameters of the Action:', () => {
            let meta = {};

            let actionModel = new ActionModel();
            actionModel.parameters.push({ meta });

            let [parameter] = actionModel.meta.parameters
            expect(parameter).to.equal(meta);
        });
    });

    describe('ActionModel.ast:', () => {
        it('should be the AST of the Action:', () => {
            let component = {
                variableName: 'Component'
            };
            let actionModel = new ActionModel(component);
            actionModel.name = 'Action';
            let { ast } = actionModel;

            expect(escodegen.generate(ast)).to.equal(dedent(`
                Component.prototype.action = function () {
                }
            `));
        });

        it('should include any Parameters of the Action:', () => {
            let component = {
                variableName: 'Component'
            };
            let actionModel = new ActionModel(component);
            actionModel.name = 'Action';
            actionModel.addParameter();
            let [parameter] = actionModel.parameters;
            parameter.name = 'parameter';
            let { ast } = actionModel;

            expect(escodegen.generate(ast)).to.equal(dedent(`
                Component.prototype.action = function (parameter) {
                }
            `));
        });

        it('should include any Interactions of the Action:', () => {
            let method = {
                name: 'method',
                returns: 'promise'
            };
            let browser = {
                methods: [method],
                name: 'browser',
                variableName: 'browser'
            };
            let component = {
                browser,
                variableName: 'Component'
            };
            let actionModel = new ActionModel(component);
            actionModel.name = 'Action';
            actionModel.addInteraction();
            let { ast } = actionModel;

            expect(escodegen.generate(ast)).to.equal(dedent(`
                Component.prototype.action = function () {
                    var self = this;
                    return browser.method();
                }
            `));
        });

        it('should include Interactions using any Element:', () => {
            let browserMethod = {
                name: 'method',
                returns: 'promise'
            };
            let browser = {
                methods: [browserMethod],
                name: 'browser',
                variableName: 'browser'
            };
            let elementMethod = {
                name: 'method',
                returns: 'promise'
            };
            let element = {
                methods: [elementMethod],
                name: 'element',
                variableName: 'element'
            };
            let component = {
                browser,
                domElements: [element],
                elements: [browser, element],
                variableName: 'Component'
            };
            let actionModel = new ActionModel(component);
            actionModel.name = 'Action';
            actionModel.addInteraction();
            let [interaction] = actionModel.interactions;
            interaction.element = element;
            let { ast } = actionModel;

            expect(escodegen.generate(ast)).to.equal(dedent(`
                Component.prototype.action = function () {
                    var self = this;
                    return self.element.method();
                }
            `));
        });

        it('should include Interactions that return promises:', () => {
            let browserMethod = {
                name: 'method',
                returns: 'promise'
            };
            let browser = {
                methods: [browserMethod],
                name: 'browser',
                variableName: 'browser'
            };
            let elementMethod = {
                name: 'method',
                returns: 'promise'
            };
            let element = {
                methods: [elementMethod],
                name: 'element',
                variableName: 'element'
            };
            let component = {
                browser,
                domElements: [element],
                elements: [browser, element],
                variableName: 'Component'
            };
            let actionModel = new ActionModel(component);
            actionModel.name = 'Action';
            actionModel.addInteraction();
            let [interactionOne] = actionModel.interactions;
            interactionOne.element = element;
            actionModel.addInteraction();
            let [interactionTwo] = actionModel.interactions.slice().reverse();
            interactionTwo.element = element;
            let { ast } = actionModel;

            expect(escodegen.generate(ast)).to.equal(dedent(`
                Component.prototype.action = function () {
                    var self = this;
                    return self.element.method().then(function () {
                        return self.element.method();
                    });
                }
            `));
        });

        it('should include Interactions that don\'t return promises:', () => {
            let browserMethod = {
                name: 'method',
                returns: 'promise'
            };
            let browser = {
                methods: [browserMethod],
                name: 'browser',
                variableName: 'browser'
            };
            let elementMethod = {
                name: 'method',
                returns: 'string'
            };
            let element = {
                methods: [elementMethod],
                name: 'element',
                variableName: 'element'
            };
            let component = {
                browser,
                domElements: [element],
                elements: [browser, element],
                variableName: 'Component'
            };
            let actionModel = new ActionModel(component);
            actionModel.name = 'Action';
            actionModel.addInteraction();
            let [interactionOne] = actionModel.interactions;
            interactionOne.element = element;
            actionModel.addInteraction();
            let [interactionTwo] = actionModel.interactions.slice().reverse();
            interactionTwo.element = element;
            let { ast } = actionModel;

            expect(escodegen.generate(ast)).to.equal(dedent(`
                Component.prototype.action = function () {
                    var self = this;
                    return new Promise(function (resolve) {
                        resolve(self.element.method());
                    }).then(function () {
                        return new Promise(function (resolve) {
                            resolve(self.element.method());
                        });
                    });
                }
            `));
        });

        it('should include Interactions that return values:', () => {
            let browserMethod = {
                name: 'method',
                returns: 'promise'
            };
            let browser = {
                methods: [browserMethod],
                name: 'browser',
                variableName: 'browser'
            };
            let elementMethod = {
                name: 'method',
                returns: 'promise',
                promise: {
                    name: 'resultValue'
                }
            };
            let element = {
                methods: [elementMethod],
                name: 'element',
                variableName: 'element'
            };
            let component = {
                browser,
                domElements: [element],
                elements: [browser, element],
                variableName: 'Component'
            };
            let actionModel = new ActionModel(component);
            actionModel.name = 'Action';
            actionModel.addInteraction();
            let [interactionOne] = actionModel.interactions;
            interactionOne.element = element;
            actionModel.addInteraction();
            let [interactionTwo] = actionModel.interactions.slice().reverse();
            interactionTwo.element = element;
            let { ast } = actionModel;

            expect(escodegen.generate(ast)).to.equal(dedent(`
                Component.prototype.action = function () {
                    var self = this;
                    return self.element.method().then(function (resultValue) {
                        return self.element.method();
                    });
                }
            `));
        });
    });

    describe('ActionModel.addParameter:', () => {
        it('should add a new Parameter to the Action:', () => {
            let actionModel = new ActionModel();
            actionModel.addParameter();

            expect(actionModel.parameters.length).to.equal(1);
            let [parameter] = actionModel.parameters;
            expect(parameter).to.be.an.instanceof(ParameterModel);
        });
    });

    describe('ActionModel.removeParameter:', () => {
        it('should remove a Parameter from the Action:', () => {
            let actionModel = new ActionModel();
            actionModel.addParameter();

            let [parameter] = actionModel.parameters;
            actionModel.removeParameter(parameter);
            expect(actionModel.parameters.length).to.equal(0);
        });
    });

    describe('ActionModel.addInteraction:', () => {
        it('should add a new Interaction to the Action:', () => {
            let browser = {
                methods: [{}]
            };
            let component = {
                browser
            };
            let actionModel = new ActionModel(component);
            actionModel.addInteraction();

            expect(actionModel.interactions.length).to.equal(1);
            let [interaction] = actionModel.interactions;
            expect(interaction).to.be.an.instanceof(InteractionModel);
        });

        it('should set the default element of the Interaction to be the browser:', () => {
            let browser = {
                methods: [{}]
            };
            let component = {
                browser
            };
            let actionModel = new ActionModel(component);
            actionModel.addInteraction();

            expect(actionModel.interactions.length).to.equal(1);
            let [interaction] = actionModel.interactions;
            expect(interaction.element).to.equal(browser);
        });
    });

    describe('ActionModel.removeInteraction:', () => {
        it('should remove a Interaction from the Action:', () => {
            let browser = {
                methods: [{}]
            };
            let component = {
                browser
            };
            let actionModel = new ActionModel(component);
            actionModel.addInteraction();

            let [interaction] = actionModel.interactions;
            actionModel.removeInteraction(interaction);
            expect(actionModel.interactions.length).to.equal(0);
        });
    });

    describe('ActionModel.getAllVariableNames:', () => {
        it('should return all the variables associated with this Action\'s Component:', () => {
            let component = {
                getAllVariableNames: angular.noop
            };
            let allVariableNames = [];

            let actionModel = new ActionModel(component);

            sinon.stub(component, 'getAllVariableNames').returns(allVariableNames);

            expect(actionModel.getAllVariableNames()).to.equal(allVariableNames);
        });
    });
});
