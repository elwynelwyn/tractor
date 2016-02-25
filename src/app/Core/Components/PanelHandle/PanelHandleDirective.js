'use strict';

// Constants:
const FULL_WIDTH = 100;
const HANDLE_WIDTH = 0.25;
const MAX_POSITION = 70;
const MIN_POSITION = 10;

// Dependencies:
import angular from 'angular';
import PersistentStateService from '../../Services/PersistentStateService';

class PanelHandleDirective {
    constructor (
        $rootScope,
        persistentStateService
    ) {
        this.persistentStateService = persistentStateService;

        this.restrict = 'E';

        this.link = ($scope, $element, $attrs) => {
            let $handle = $element;
            let [handle] = $handle;
            let $parent = $handle.parent();
            let [parent] = $parent;
            let $children = $parent.children();
            let $siblings = [].filter.call($children, element => element !== handle);
            let panelName = $attrs.panelName;

            let [beforeElement] = $siblings;
            let [afterElement] = $siblings.slice().reverse();

            $handle.data('parent', parent);
            $handle.data('beforeElement', beforeElement);
            $handle.data('afterElement', afterElement);
            $handle.data('panelName', panelName);

            handle.addEventListener('mousedown', () => mousedown($handle));
            let $destroy = $rootScope.$on('$stateChangeStart', () => save.call(this, $handle));
            $scope.$on('$destroy', $destroy);

            let panelHandlePosition = this.persistentStateService.get(panelName);
            if (panelHandlePosition) {
                beforeElement.style.width = panelHandlePosition.before;
                afterElement.style.width = panelHandlePosition.after;
            }
        };
    }
}

function save ($handle) {
    let panelName = $handle.data('panelName');
    let beforeElement = $handle.data('beforeElement');
    let afterElement = $handle.data('afterElement');
    let before = beforeElement.style.width;
    let after = afterElement.style.width;
    this.persistentStateService.set(panelName, { before, after });
}

function mousedown ($handle) {
    angular.element(document.body).data('handle', $handle);
    document.body.classList.add('resizing');
    document.body.addEventListener('mousemove', mousemove);
    document.body.addEventListener('mouseup', mouseup);
}

function mousemove (event) {
    let $body = angular.element(document.body);
    let $handle = $body.data('handle');
    let parent = $handle.data('parent');
    let beforeElement = $handle.data('beforeElement');
    let afterElement = $handle.data('afterElement');
    let containerWidth = parseFloat(window.getComputedStyle(parent).width);
    let percent = Math.max(MIN_POSITION, event.clientX / containerWidth * FULL_WIDTH);
    percent = Math.min(percent, MAX_POSITION);
    beforeElement.style.width = `${percent}%`;
    afterElement.style.width = `${FULL_WIDTH - HANDLE_WIDTH - percent}%`;
}

function mouseup () {
    document.body.classList.remove('resizing');
    document.body.removeEventListener('mousemove', mousemove);
    document.body.removeEventListener('mouseup', mouseup);
}

export default angular.module('tractor.panelHandle', [
    PersistentStateService.name
])
.directive('tractorPanelHandle', (
    $rootScope,
    persistentStateService
) => new PanelHandleDirective($rootScope, persistentStateService));
