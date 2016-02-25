/* global describe:true, it:true */
'use strict';

// Utilities:
import _ from 'lodash';
import chai from 'chai';
import mockery from 'mockery';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

// Test setup:
const expect = chai.expect;
chai.use(sinonChai);

// Under test:
import getConfig from './get-config';

describe('server/api: get-config', () => {
    it('should respond with the current config:', () => {
        let request = {};
        let response = {
            send: _.noop
        };
        mockery.enable();
        mockery.registerMock('../config/config', {
            default: {}
        });

        sinon.stub(response, 'send');

        getConfig.handler(request, response);

        expect(response.send).to.have.been.calledWith({});

        mockery.deregisterMock('../config/config');
        mockery.disable();
    });
});
