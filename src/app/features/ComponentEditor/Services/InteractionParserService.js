'use strict';

// Utilities:
import assert from 'assert';

// Dependencies:
import angular from 'angular';
import ArgumentParserService from './ArgumentParserService';
import InteractionModel from '../Models/InteractionModel';

class InteractionParserService {
    constructor (
        argumentParserService,
        InteractionModel
    ) {
        this.argumentParserService = argumentParserService;
        this.InteractionModel = InteractionModel;
    }

    parse (action, ast) {
        try {
            let interaction = new this.InteractionModel(action);

            let { argument } = ast;
            let parseState = { argument };

            let parsers = [parseNestedInteraction, parseFirstOwnPromiseInteraction, parseFirstWrappedPromiseInteraction, parseOwnPromiseInteraction, parseWrappedPromiseInteraction];
            tryParse.call(this, action, interaction, parseState, parsers);

            return interaction;
        } catch (e) {
            console.warn('Invalid interaction:', ast);
            return null;
        }
    }
}

function tryParse (action, interaction, parseState, parsers) {
    let parsed = parsers.some(parser => {
        try {
            return parser.call(this, action, interaction, parseState);
        } catch (e) {}
    });
    if (!parsed) {
        throw new Error();
    }
}

function parseNestedInteraction (action, interaction, parseState) {
    assert(parseState.argument.callee.object.callee);
    this.parse(action, {
        argument: parseState.argument.callee.object
    });
}

function parseFirstOwnPromiseInteraction (action, interaction, parseState) {
    parseState.expression = parseState.argument;
    assert(!parseState.expression.callee.object.callee);
    parseInteraction.call(this, action, interaction, parseState);
    return true;
}

function parseFirstWrappedPromiseInteraction (action, interaction, parseState) {
    let [wrappedThenFunctionExpression] = parseState.argument.arguments;
    let [interactionResolveExpressionStatement] = wrappedThenFunctionExpression.body.body;
    let [expression] = interactionResolveExpressionStatement.expression.arguments;
    parseState.expression = expression;
    parseInteraction.call(this, action, interaction, parseState);
    return true;
}

function parseOwnPromiseInteraction (action, interaction, parseState) {
    let [wrappedThenFunctionExpression] = parseState.argument.arguments;
    let [wrappedNewPromiseReturnStatement] = wrappedThenFunctionExpression.body.body;
    let [wrappedResolveFunctionExpression] = wrappedNewPromiseReturnStatement.argument.arguments;
    let [interactionResolveExpressionStatement] = wrappedResolveFunctionExpression.body.body;
    let [expression] = interactionResolveExpressionStatement.expression.arguments;
    parseState.expression = expression;
    parseInteraction.call(this, action, interaction, parseState);
    return true;
}

function parseWrappedPromiseInteraction (action, interaction, parseState) {
    let [wrappedThenFunctionExpression] = parseState.argument.arguments;
    let [interactionReturnStatement] = wrappedThenFunctionExpression.body.body;
    parseState.expression = interactionReturnStatement.argument;
    parseInteraction.call(this, action, interaction, parseState);
    return true;
}

function parseInteraction (action, interaction, parseState) {
    if (parseState.expression.callee.object.name === 'browser') {
        interaction.element = action.component.browser;
    } else {
        interaction.element = action.component.elements.find(element => {
            return element.variableName === parseState.expression.callee.object.property.name;
        });
    }
    assert(interaction.element);
    interaction.method = interaction.element.methods.find(elementAction => {
        return elementAction.name === parseState.expression.callee.property.name;
    });
    assert(interaction.method);
    let args = parseState.expression.arguments.map((argument, index) => {
        let arg = this.argumentParserService.parse(interaction.methodInstance, interaction.method.arguments[index], argument);
        assert(arg);
        let parameter = action.parameters.find(parameter => {
            return parameter.variableName === arg.value;
        });
        if (parameter) {
            arg.value = parameter.name;
        }
        return arg;
    });
    interaction.methodInstance.arguments = args;
    action.interactions.push(interaction);
}

export default angular.module('tractor.interactionParserService', [
    ArgumentParserService.name,
    InteractionModel.name
])
.service('interactionParserService', InteractionParserService);
