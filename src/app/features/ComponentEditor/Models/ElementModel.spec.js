/* global beforeEach:true, describe:true, it:true */
'use strict';

// Angular:
import angular from 'angular';
import 'angular-mocks';

// Utilities:
import chai from 'chai';
import dedent from 'dedent';
import dirtyChai from 'dirty-chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

// Test setup:
const expect = chai.expect;
chai.use(dirtyChai);
chai.use(sinonChai);

// Dependencies:
import escodegen from 'escodegen';

// Testing:
import './ElementModel';
let ElementModel;

describe('ElementModel.js:', () => {
    let FilterModel;

    beforeEach(() => {
        angular.mock.module('tractor.elementModel');

        angular.mock.inject((
            _ElementModel_,
            _FilterModel_
        ) => {
            ElementModel = _ElementModel_;
            FilterModel = _FilterModel_;
        });
    });

    describe('ElementModel constructor:', () => {
        it('should create a new `ElementModel`:', () => {
            let elementModel = new ElementModel();
            expect(elementModel).to.be.an.instanceof(ElementModel);
        });

        it('should have default properties:', () => {
            let component = {};
            let elementModel = new ElementModel(component);

            expect(elementModel.component).to.equal(component);
            expect(elementModel.name).to.equal('');
            expect(elementModel.filters).to.deep.equal([]);
            expect(elementModel.sortableFilters).to.deep.equal([]);
        });

        it('should have data about all the element methods from Protractor:', () => {
            let elementModel = new ElementModel();

            let [
                click,
                sendKeys,
                getText,
                isEnabled,
                isSelected,
                submit,
                clear,
                isDisplayed,
                getOuterHtml,
                getInnerHtml
            ] = elementModel.methods;

            expect(click.name).to.equal('click');
            expect(sendKeys.name).to.equal('sendKeys');
            expect(getText.name).to.equal('getText');
            expect(isEnabled.name).to.equal('isEnabled');
            expect(isSelected.name).to.equal('isSelected');
            expect(submit.name).to.equal('submit');
            expect(clear.name).to.equal('clear');
            expect(isDisplayed.name).to.equal('isDisplayed');
            expect(getOuterHtml.name).to.equal('getOuterHtml');
            expect(getInnerHtml.name).to.equal('getInnerHtml');
        });
    });

    describe('ElementModel.selector:', () => {
        it('should return the first Filter of the Element:', () => {
            let filter = {};

            let elementModel = new ElementModel();
            elementModel.filters.push(filter);

            expect(elementModel.selector).to.equal(filter);
        });
    });

    describe('ElementModel.variableName:', () => {
        it('should turn the full name of the Element into a JS variable:', () => {
            let elementModel = new ElementModel();

            elementModel.name = 'A long name that describes the action.';
            expect(elementModel.variableName).to.equal('aLongNameThatDescribesTheAction');
        });
    });

    describe('ElementModel.meta:', () => {
        it('should contain the full name of the Element:', () => {
            let elementModel = new ElementModel();

            elementModel.name = 'A long name that describes the Element.';
            expect(elementModel.meta.name).to.equal('A long name that describes the Element.');
        });
    });

    describe('ElementModel.addFilter:', () => {
        it('should add a new Filter to the Element:', () => {
            let elementModel = new ElementModel();
            elementModel.addFilter();

            expect(elementModel.filters.length).to.equal(1);
            let [filter] = elementModel.filters;
            expect(filter).to.be.an.instanceof(FilterModel);
        });

        it('should add Filters to the `sortableFilters` list when there is more than one:', () => {
            let elementModel = new ElementModel();
            elementModel.addFilter();
            elementModel.addFilter();

            expect(elementModel.filters.length).to.equal(2);
            expect(elementModel.sortableFilters.length).to.equal(1);
        });
    });

    describe('ElementModel.removeFilter:', () => {
        it('should remove a Filter from the Element:', () => {
            let elementModel = new ElementModel();
            elementModel.addFilter();

            let [filter] = elementModel.filters;
            elementModel.removeFilter(filter);
            expect(elementModel.filters.length).to.equal(0);
        });

        it('should remove a Filter from the `sortableFilters` lists:', () => {
            let elementModel = new ElementModel();
            elementModel.addFilter();
            elementModel.addFilter();

            let [filter] = elementModel.filters;
            elementModel.removeFilter(filter);

            expect(elementModel.filters.length).to.equal(1);
            expect(elementModel.sortableFilters.length).to.equal(0);
        });
    });

    describe('ElementModel.getAllVariableNames:', () => {
        it('should return all the variables associated with this Element\'s Component:', () => {
            let component = {
                getAllVariableNames: angular.noop
            };
            let allVariableNames = [];

            let elementModel = new ElementModel(component);

            sinon.stub(component, 'getAllVariableNames').returns(allVariableNames);

            expect(elementModel.getAllVariableNames()).to.equal(allVariableNames);
        });
    });

    describe('ElementModel.ast:', () => {
        it('should be the AST of the Element for a single selector:', () => {
            let elementModel = new ElementModel();
            elementModel.name = 'element';
            elementModel.addFilter();
            let [filter] = elementModel.filters;
            filter.type = 'binding';
            filter.locator = '{{ model.binding }}';
            let ast = elementModel.ast;

            expect(escodegen.generate(ast)).to.equal(dedent(`
                this.element = element(by.binding('{{ model.binding }}'))
            `));
        });

        it('should be the AST of the Element for a group selector:', () => {
            let elementModel = new ElementModel();
            elementModel.name = 'element';
            elementModel.addFilter();
            let [filter] = elementModel.filters;
            filter.type = 'repeater';
            filter.locator = 'item for item in list';
            let ast = elementModel.ast;

            expect(escodegen.generate(ast)).to.equal(dedent(`
                this.element = element.all(by.repeater('item for item in list'))
            `));
        });

        it('should be the AST of the Element for a selector within a selector:', () => {
            let elementModel = new ElementModel();
            elementModel.name = 'element';
            elementModel.addFilter();
            elementModel.addFilter();
            let [filterOne] = elementModel.filters;
            filterOne.type = 'binding';
            filterOne.locator = '{{ model.binding }}';
            let [filterTwo] = elementModel.filters.slice().reverse();
            filterTwo.type = 'model';
            filterTwo.locator = 'model.property';
            let ast = elementModel.ast;

            expect(escodegen.generate(ast)).to.equal(dedent(`
                this.element = element(by.binding('{{ model.binding }}')).element(by.model('model.property'))
            `));
        });

        it('should be the AST of the Element for a index within a group selector:', () => {
            let elementModel = new ElementModel();
            elementModel.name = 'element';
            elementModel.addFilter();
            elementModel.addFilter();
            let [filterOne] = elementModel.filters;
            filterOne.type = 'repeater';
            filterOne.locator = 'item for item in list';
            let [filterTwo] = elementModel.filters.slice().reverse();
            filterTwo.type = 'text';
            filterTwo.locator = '0';
            let ast = elementModel.ast;

            expect(escodegen.generate(ast)).to.equal(dedent(`
                this.element = element.all(by.repeater('item for item in list')).get(0)
            `));
        });

        it('should be the AST of the Element for a text selector within a group selector:', () => {
            let elementModel = new ElementModel();
            elementModel.name = 'element';
            elementModel.addFilter();
            elementModel.addFilter();
            let [filterOne] = elementModel.filters;
            filterOne.type = 'repeater';
            filterOne.locator = 'item for item in list';
            let [filterTwo] = elementModel.filters.slice().reverse();
            filterTwo.type = 'text';
            filterTwo.locator = 'text';
            let ast = elementModel.ast;

            expect(escodegen.generate(ast)).to.equal(dedent(`
                this.element = element.all(by.repeater('item for item in list')).filter(function (element) {
                    return element.getText().then(function (text) {
                        return text.indexOf('text') !== -1;
                    });
                }).get(0)
            `));
        });

        it('should be the AST of the Element for a group selector within a selector:', () => {
            let elementModel = new ElementModel();
            elementModel.name = 'element';
            elementModel.addFilter();
            elementModel.addFilter();
            let [filterOne] = elementModel.filters;
            filterOne.type = 'binding';
            filterOne.locator = '{{ model.binding }}';
            let [filterTwo] = elementModel.filters.slice().reverse();
            filterTwo.type = 'repeater';
            filterTwo.locator = 'item for item in list';
            let ast = elementModel.ast;

            expect(escodegen.generate(ast)).to.equal(dedent(`
                this.element = element(by.binding('{{ model.binding }}')).all(by.repeater('item for item in list'))
            `));
        });
    });
});
