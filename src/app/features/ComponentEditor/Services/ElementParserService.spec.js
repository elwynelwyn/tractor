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
import './ElementParserService';
let elementParserService;

describe('ElementParserService.js:', () => {
    let filterParserService;

    beforeEach(() => {
        angular.mock.module('tractor.elementParserService');

        angular.mock.module($provide => {
            $provide.factory('filterParserService', () => {
                filterParserService = {};
                return filterParserService;
            });
        });

        angular.mock.inject((
            _elementParserService_
        ) => {
            elementParserService = _elementParserService_;
        });
    });

    describe('ElementParserService.parse', () => {
        it('should return an `ElementModel`', () => {
            let component = {};
            let ast = {
                expression: {
                    right: {
                        arguments: [],
                        callee: {
                            name: 'element'
                        }
                    }
                }
            };

            filterParserService.parse = angular.noop;
            sinon.stub(filterParserService, 'parse');

            let element = elementParserService.parse(component, ast);

            expect(element.component).to.equal(component);
        });

        it('should attempt to recursively parse any nested selectors', () => {
            let component = {};
            let ast = {
                expression: {
                    right: {
                        callee: {
                            object: {
                                callee: {
                                    object: {
                                        arguments: [],
                                        callee: {
                                            name: 'element'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            sinon.spy(elementParserService, 'parse');
            filterParserService.parse = angular.noop;
            sinon.stub(filterParserService, 'parse');

            elementParserService.parse(component, ast);

            expect(elementParserService.parse).to.have.been.calledThrice();

            elementParserService.parse.restore();
        });
        
        // it('should attempt to recursively parse any nested filters', () => {
        //     let component = {};
        //     let ast = {
        //         expression: {
        //             right: {
        //                 callee: {
        //                     object: {
        //                         callee: {
        //                             property: {
        //                                 name: 'filter'
        //                             },
        //                             object: {
        //                                 arguments: [],
        //                                 callee: {
        //                                     name: 'element'
        //                                 }
        //                             }
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     };
        //
        //     sinon.spy(elementParserService, 'parse');
        //     filterParserService.parse = angular.noop;
        //     sinon.stub(filterParserService, 'parse');
        //
        //     elementParserService.parse(component, ast);
        //
        //     expect(elementParserService.parse).to.have.been.calledTwice();
        //
        //     elementParserService.parse.restore();
        // });
        //
        // it('should attempt to parse an `element` selector', () => {
        //     let component = {};
        //     let ast = {
        //         expression: {
        //             right: {
        //                 arguments: [],
        //                 callee: {
        //                     name: 'element'
        //                 }
        //             }
        //         }
        //     };
        //
        //     let filter = {};
        //     filterParserService.parse = angular.noop;
        //     sinon.stub(filterParserService, 'parse').returns(filter);
        //
        //     let elementModel = elementParserService.parse(component, ast);
        //
        //     expect(elementModel.filters.length).to.equal(1);
        //     let [filterModel] = elementModel.filters;
        //     expect(filterModel).to.equal(filter);
        // });
        //
        // it('should attempt to parse an `element.all` selector', () => {
        //     let component = {};
        //     let ast = {
        //         expression: {
        //             right: {
        //                 arguments: [],
        //                 callee: {
        //                     object: {
        //                         name: 'element'
        //                     },
        //                     property: {
        //                         name: 'all'
        //                     }
        //                 }
        //             }
        //         }
        //     };
        //
        //     let filter = {};
        //     filterParserService.parse = angular.noop;
        //     sinon.stub(filterParserService, 'parse').returns(filter);
        //
        //     let elementModel = elementParserService.parse(component, ast);
        //
        //     expect(elementModel.filters.length).to.equal(1);
        //     let [filterModel] = elementModel.filters;
        //     expect(filterModel).to.equal(filter);
        // });
        //
        // it('should attempt to parse an `.element` selector', () => {
        //     let component = {};
        //     let ast = {
        //         expression: {
        //             right: {
        //                 arguments: [],
        //                 callee: {
        //                     property: {
        //                         name: 'element'
        //                     }
        //                 }
        //             }
        //         }
        //     };
        //
        //     let filter = {};
        //     filterParserService.parse = angular.noop;
        //     sinon.stub(filterParserService, 'parse').returns(filter);
        //
        //     let elementModel = elementParserService.parse(component, ast);
        //
        //     expect(elementModel.filters.length).to.equal(1);
        //     let [filterModel] = elementModel.filters;
        //     expect(filterModel).to.equal(filter);
        // });
        //
        // it('should attempt to parse an `.element.all` selector', () => {
        //     let component = {};
        //     let ast = {
        //         expression: {
        //             right: {
        //                 arguments: [],
        //                 callee: {
        //                     property: {
        //                         name: 'all'
        //                     }
        //                 }
        //             }
        //         }
        //     };
        //
        //     let filter = {};
        //     filterParserService.parse = angular.noop;
        //     sinon.stub(filterParserService, 'parse').returns(filter);
        //
        //     let elementModel = elementParserService.parse(component, ast);
        //
        //     expect(elementModel.filters.length).to.equal(1);
        //     let [filterModel] = elementModel.filters;
        //     expect(filterModel).to.equal(filter);
        // });
        //
        // it('should attempt to parse a `.filter` selector', () => {
        //     let component = {};
        //     let ast = {
        //         expression: {
        //             right: {
        //                 arguments: [],
        //                 callee: {
        //                     property: {
        //                         name: 'filter'
        //                     }
        //                 }
        //             }
        //         }
        //     };
        //
        //     let filter = {};
        //     filterParserService.parse = angular.noop;
        //     sinon.stub(filterParserService, 'parse').returns(filter);
        //
        //     let elementModel = elementParserService.parse(component, ast);
        //
        //     expect(elementModel.filters.length).to.equal(1);
        //     let [filterModel] = elementModel.filters;
        //     expect(filterModel).to.equal(filter);
        // });
        //
        // it('should attempt to parse a `.get` selector', () => {
        //     let component = {};
        //     let ast = {
        //         expression: {
        //             right: {
        //                 arguments: [],
        //                 callee: {
        //                     property: {
        //                         name: 'get'
        //                     }
        //                 }
        //             }
        //         }
        //     };
        //
        //     let filter = {};
        //     filterParserService.parse = angular.noop;
        //     sinon.stub(filterParserService, 'parse').returns(filter);
        //
        //     let elementModel = elementParserService.parse(component, ast);
        //
        //     expect(elementModel.filters.length).to.equal(1);
        //     let [filterModel] = elementModel.filters;
        //     expect(filterModel).to.equal(filter);
        // });

        it('should bail out and return `null` when it cannot parse', () => {
            let component = {};
            let ast = {
                expression: {
                    right: {}
                }
            };

            sinon.stub(console, 'warn');
            let element = elementParserService.parse(component, ast);

            expect(element).to.equal(null);

            console.warn.restore();
        });
    });
});
