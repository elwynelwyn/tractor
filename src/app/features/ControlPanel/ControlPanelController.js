'use strict';

// Dependencies:
import angular from 'angular';
import RunnerService from './Services/RunnerService';
import ServerStatusService from './Services/ServerStatusService';

// Symbols:
const environments = Symbol();

class ControlPanelController {
    constructor (
        runnerService,
        serverStatusService,
        config
    ) {
        this.runnerService = runnerService;
        this.serverStatusService = serverStatusService;
        this[environments] = config.environments;
        let [environment] = this.environments;
        this.environment = environment;

        this.serverStatusService.monitorServerStatus();
    }

    get environments () {
        return this[environments];
    }

    get isServerRunning () {
        return this.serverStatusService.isServerRunning;
    }

    runProtractor () {
        this.runnerService.runProtractor({
            baseUrl: this.environment
        });
    }
}

export default angular.module('controlPanelController', [
    RunnerService.name,
    ServerStatusService.name
])
.controller('ControlPanelController', ControlPanelController)
