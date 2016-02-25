'use strict';

// Utilities:
import assert from 'assert';

// Dependencies:
import angular from 'angular';
import ElementModel from '../Models/ElementModel';
import FilterParserService from '../Services/FilterParserService';

class ElementParserService {
    constructor (
        ElementModel,
        filterParserService
    ) {
        this.ElementModel = ElementModel;
        this.filterParserService = filterParserService;
    }

    parse (component, ast, element) {
        try {
            if (!element) {
                element = new this.ElementModel(component);
            }

            let parseState = {
                callee: ast.expression.right.callee,
                expression: ast.expression.right
            };

            let parsers = [parseNestedElement, parseFirstElement, parseFirstElementAll, parseElement, parseElementAll, parseFilter, parseGet];
            tryParse.call(this, component, element, parseState, parsers);

            return element;
        } catch (e) {
            console.warn('Invalid element:', ast)
            return null;
        }
    }
}

function tryParse (component, element, parseState, parsers) {
    let parsed = parsers.some(parser => {
        try {
            return parser.call(this, component, element, parseState);
        } catch (e) {}
    });
    if (!parsed) {
        throw new Error();
    }
}

function parseNestedElement (component, element, parseState) {
    let { callee, expression } = parseState;
    assert(callee.object.callee);

    try {
        assert(callee.object.callee.property.name === 'filter');
        parseState.callee = callee.object.callee;
        parseState.expression = expression.callee.object;
    } catch (e) {}

    return this.parse(component, {
        expression: {
            right: parseState.callee.object
        }
    }, element);
}

function parseFirstElement (component, element, parseState) {
    let { callee, expression } = parseState;
    assert(callee.name === 'element');
    let [filterAST] = expression.arguments;
    let filter = this.filterParserService.parse(element, filterAST);
    element.addFilter(filter);
    return true;
}

function parseFirstElementAll (component, element, parseState) {
    let { callee, expression } = parseState;
    assert(callee.object.name === 'element');
    assert(callee.property.name === 'all');
    let [filterAllAST] = expression.arguments;
    let filter = this.filterParserService.parse(element, filterAllAST);
    element.addFilter(filter);
    return true;
}

function parseElement (component, element, parseState) {
    let { callee, expression } = parseState;
    assert(callee.property.name === 'element');
    let [filterAST] = expression.arguments;
    let filter = this.filterParserService.parse(element, filterAST);
    element.addFilter(filter);
    return true;
}

function parseElementAll (component, element, parseState) {
    let { callee, expression } = parseState;
    assert(callee.property.name === 'all');
    let [filterAllAST] = expression.arguments;
    let filter = this.filterParserService.parse(element, filterAllAST);
    element.addFilter(filter);
    return true;
}

function parseFilter (component, element, parseState) {
    let { callee, expression } = parseState;
    assert(callee.property.name === 'filter');
    let [filterAST] = expression.arguments;
    let filter = this.filterParserService.parse(element, filterAST);
    element.addFilter(filter);
    return true;
}

function parseGet (component, element, parseState) {
    let { callee, expression } = parseState;
    assert(callee.property.name === 'get');
    let [filterAST] = expression.arguments;
    let filter = this.filterParserService.parse(element, filterAST);
    element.addFilter(filter);
    return true;
}

export default angular.module('tractor.elementParserService', [
    ElementModel.name,
    FilterParserService.name
])
.service('elementParserService', ElementParserService);
