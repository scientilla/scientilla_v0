/*
 * Scientilla v0.0.1 (http://www.scientilla.net)
 * Copyright 2014 Fondazione Istituto Italiano di Tecnologia (http://www.iit.it)
 * Licensed under MIT (https://github.com/scientilla/scientilla/blob/master/LICENSE)
 */

module.exports = function () {
    return {
        ssl_port: 443,
        ssl_key_path: "/../certs/certificate.key",
        ssl_cert_path: "/../certs/certificate.cert",
        installation_name: "Your Installation Name",
        installation_url: "https://your.domain.com[:port]",
        seed: false
    };
};