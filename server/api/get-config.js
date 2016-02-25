'use strict';

export default { handler };

function handler (request, response) {
    const config = require('../config/config');
    response.send(config.default);
}
