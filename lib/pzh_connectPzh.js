/*******************************************************************************
 *  Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2012 - 2013 Samsung Electronics (UK) Ltd
 * Author: Habib Virji (habib.virji@samsung.com)
 *******************************************************************************/
var Pzh_connectPzh = function () {
    var PzhObject = this;
    var logger = require("webinos-utilities").webinosLogging(__filename);
    this.connectOtherPZH = function (to, options) {
        try {
            if (!logger.id) {
              logger.addId(PzhObject.getSessionId());
            }
            if (typeof PzhObject._pendingPZHConnections === "undefined") {
              PzhObject._pendingPZHConnections = {};
            }
            if (!PzhObject._pendingPZHConnections.hasOwnProperty(to)) {
              PzhObject._pendingPZHConnections[to] = true;
              var pzhDetails = PzhObject.getExternalCertificate(to);
              var connPzh, connDetails;
              connDetails = options;
              connDetails.servername = to;
              connDetails.host = pzhDetails.host;
              connDetails.port = pzhDetails.port;
              logger.log ("connection from " + PzhObject.getSessionId() + " - to PZH " + connDetails.servername + " initiated at host " + connDetails.host + " and port " + connDetails.port);
              connPzh = require("tls").connect (connDetails, function () {
                logger.log ("connection status : " + connPzh.authorized);
                if (connPzh.authorized) {
                  PzhObject.handlePzhAuthorization(to, connPzh, true);
                } else {
                  logger.error("connection authorization Failed - " + connPzh.authorizationError);
                }
              });
              connPzh.on ("data", function (buffer) {
                PzhObject.handleData(connPzh, buffer);
              });
              connPzh.on ("error", function (err) {
                delete PzhObject._pendingPZHConnections[to];
                logger.error(err.message);
              });
              connPzh.on ("end", function () {
                delete PzhObject._pendingPZHConnections[to];
                if(connPzh.id) {
                  PzhObject.removeRoute(connPzh.id);
                }
              });
            } else {
              logger.info("Connection already pending for: " + to);
            }
        } catch (err) {
            logger.error ("connecting other pzh failed in setting configuration " + err);
        }
    };
};
module.exports = Pzh_connectPzh;