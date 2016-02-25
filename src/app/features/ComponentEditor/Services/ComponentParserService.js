'use strict';

// Utilities:
import assert from 'assert';

// Dependencies:
import angular from 'angular';
import ActionParserService from '../Services/ActionParserService';
import ComponentModel from '../Models/ComponentModel';
import ElementParserService from '../Services/ElementParserService';
import PersistentStateService from '../../../Core/Services/PersistentStateService';

class ComponentParserService {
    constructor (
        actionParserService,
        ComponentModel,
        elementParserService,
        persistentStateService
    ) {
        this.actionParserService = actionParserService;
        this.ComponentModel = ComponentModel;
        this.elementParserService = elementParserService;
        this.persistentStateService = persistentStateService;
    }

    parse (componentFile) {
        let { ast } = componentFile;
        try {
            let [metaComment] = ast.comments;
            let meta = JSON.parse(metaComment.value);

            let component = new this.ComponentModel({
                isSaved: true,
                path: componentFile.path
            });
            component.name = meta.name;

            let state = this.persistentStateService.get(component.name);
            let [componentModuleExpressionStatement] = ast.body;
            let moduleBlockStatement = componentModuleExpressionStatement.expression.right.callee.body;

            let statements = moduleBlockStatement.body;
            let parsers = [parseElements, parseAction, parseReturnStatement];
            tryParse.call(this, component, statements, meta, state, parsers);

            return component;
        } catch (e) {
            console.warn('Invalid component:', ast);
            return null;
        }
    }
}

function tryParse (component, statements, meta, state, parsers) {
    statements.forEach(statement => {
        let parsed = parsers.some(parser => {
            try {
                return parser.call(this, component, statement, meta, state);
            } catch (e) {}
        });
        if (!parsed) {
            throw new Error();
        }
    });
}

function parseElements (component, statement, meta, state) {
    let [constructorDeclarator] = statement.declarations;
    let constructorBlockStatement = constructorDeclarator.init.body;
    constructorBlockStatement.body.forEach((statement) => {
        parseElement.call(this, component, statement, meta, state);
    });
    return true;
}

function parseElement (component, statement, meta, state) {
    let domElement = this.elementParserService.parse(component, statement);
    assert(domElement);
    domElement.name = meta.elements[component.domElements.length].name;
    domElement.minimised = !!state[domElement.name];
    component.elements.push(domElement);
    component.domElements.push(domElement);
}

function parseAction (component, statement, meta, state) {
    let actionMeta = meta.actions[component.actions.length];
    assert(statement.expression);
    let action = this.actionParserService.parse(component, statement, actionMeta);
    assert(action);
    action.name = actionMeta.name;
    action.minimised = !!state[action.name];
    component.actions.push(action);
    return true;
}

function parseReturnStatement (component, statement) {
    assert(statement.argument.name === component.variableName);
    return true;
}

export default angular.module('tractor.componentParserService', [
    ActionParserService.name,
    ComponentModel.name,
    ElementParserService.name,
    PersistentStateService.name
])
.service('componentParserService', ComponentParserService);
