'use strict';

// Utilities:
import assert from 'assert';

// Dependencies:
import angular from 'angular';
import ArgumentModel from '../Models/ArgumentModel';

class ArgumentParserService {
    constructor (
        ArgumentModel
    ) {
        this.ArgumentModel = ArgumentModel
    }

    parse (method, argument, ast) {
        try {
            argument = new this.ArgumentModel(method, argument);
            parseValue(argument, ast);

            return argument;
        } catch (e) {
            console.warn('Invalid argument:', ast);
            return null;
        }
    }
}

function parseValue (argument, ast) {
    argument.value = ast.name || ast.value;
    assert(argument.value !== undefined);
}

export default angular.module('argumentParserService', [
    ArgumentModel.name
])
.service('argumentParserService', ArgumentParserService);
