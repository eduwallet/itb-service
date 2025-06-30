import { Router, Request, Response } from 'express';
import fs from "fs";
import { getEnv } from '../../utils/getEnv';
import { getSessionManager } from '../../utils/sessionManager';
import qrcode from 'qrcode';
import { debug } from 'console';

interface StatusResponse {
    sessionId:string;
    status:string;
    reason:string;
}

export function issueStatus(router:Router) {
    router.get('/issueStatus',
        async (request:Request, response:Response<StatusResponse>) => {
            try {
                const obj = await doRequest(request.query);
                response.send(obj)
            }
            catch (e) {
                response.send({
                    sessionId: request.params.sessionId ?? 'unknown',
                    status: "fail",
                    reason: e.toString()
                })
            }
        }
    );
}

async function doRequest(params:any): Promise<StatusResponse>
{
    const response:StatusResponse = {
        sessionId: params.sessionId ?? 'unknown',
        status: 'fail',
        reason: 'unknown'
    }
    debug("parameters passed", params);
    if (!params.sessionId || params.sessionId === '') {
        throw new Error ("no issuance session found");
    }

    const sm = getSessionManager();
    const session = await sm.get(params.sessionId);
    const configurationPath = getEnv('CONF_DIR', './conf') + '/' + session.test + '.json';
    debug("trying reading test at ", configurationPath);
    const config = JSON.parse(fs.readFileSync(configurationPath , 'utf8').toString());
    debug("read", config);

    if (!config || typeof(config) !== 'object' || !config.name) {
        throw new Error("no issuance session found");
    }

    // fetch the status
    debug("fetching status at ", config.status);
    const offerResponse = await fetch(
        config.status,
        {
            method:'POST',
            body: JSON.stringify({id: session.offerId }),
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

    if (!offerResponse.status) {
        throw new Error("unsupported return values");
    }
    response.status = 'pending';
    response.reason = 'ok';
    if (offerResponse.status == 'CREDENTIAL_ISSUED') {
        response.status = 'success';
    }

    debug("returning response", response);
    return response;
}