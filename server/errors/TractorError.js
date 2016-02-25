'use strict';

// Constants:
import constants from '../constants';

export default function TractorError (message, status) {
    this.message = message;
    this.name = 'TractorError';
    this.status = status || constants.SERVER_ERROR;

    Error.captureStackTrace(this, TractorError);
}
TractorError.prototype = Object.create(Error.prototype);
TractorError.prototype.constructor = TractorError;
