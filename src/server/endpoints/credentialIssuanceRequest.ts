import { Router, Request, Response } from 'express';
import fs from "fs";
import { getEnv } from '../../utils/getEnv';
import { getSessionManager } from '../../utils/sessionManager';
import qrcode from 'qrcode';
import { debug } from 'console';

interface CredentialRequestResponse {
    sessionId:string;
    qr?:string;
    status?:string;
    reason?:string;
}

export function credentialIssuanceRequest(router:Router) {
    router.get('/credentialIssuanceRequest',
        async (request:Request, response:Response<CredentialRequestResponse>) => {
            try {
                const obj = await doRequest(request.query);
                response.send(obj)
            }
            catch (e) {
                response.send({
                    sessionId: request.params.sessionId ?? 'unknown',
                    status: "failure",
                    reason: e.toString()
                })
            }
        }
    );
}

async function doRequest(params:any): Promise<CredentialRequestResponse>
{
    const response:CredentialRequestResponse = {
        sessionId: params.sessionId ?? 'unknown'
    }
    debug("parameters passed", params);
    if (!params.sessionId || params.sessionId === '') {
        throw new Error ("invalid session id");
    }

    const test = params.credentialType;
    const configurationPath = getEnv('CONF_DIR', './conf') + '/' + test + '.json';
    debug("trying reading test at ", configurationPath);
    const config = JSON.parse(fs.readFileSync(configurationPath , 'utf8').toString());
    debug("read", config);

    if (!config || typeof(config) !== 'object' || !config.name) {
        throw new Error("test not configured");
    }

    // fetch the offer
    debug("fetching offer at ", config.url);
    const offerResponse = await fetch(
        config.url,
        {
            method:'POST',
            body: JSON.stringify(config.data),
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + config.token
            }
        }
    )
    .then((r) => r.json())
    .catch((e) => {
        debug("caught ", e);
        throw new Error("failed to retrieve offer");
    });

    if (!offerResponse.uri || !offerResponse.id) {
        throw new Error("unsupported return values");
    }

    const sm = getSessionManager();
    const session = await sm.get(params.sessionId);
    session.uri = offerResponse.uri;
    session.offerId = offerResponse.id;
    await sm.set(session);

    // create a qr-code image
    await qrcode.toDataURL(offerResponse.uri, {type:'terminal'}).then((r) => response.qr = r).catch((e) => {
        debug(e);
        throw new Error("unable to generate QR code");
    });
    debug("returning response", response);

    return response;
}