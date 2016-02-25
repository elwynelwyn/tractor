'use strict';

// Dependencies:
import angular from 'angular';
import ComponentParserService from './ComponentParserService';
import FileService from '../../../Core/Services/FileService';
import FileStructureService from '../../../Core/Services/FileStructureService';

class ComponentFileService extends FileService {
    constructor (
        $http,
        componentParserService,
        fileStructureService
    ) {
        super($http, componentParserService, fileStructureService, 'components');
    }
}

export default angular.module('tractor.componentFileService', [
    ComponentParserService.name,
    FileStructureService.name
])
.service('componentFileService', ComponentFileService);
