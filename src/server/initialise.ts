import Debug from 'debug';
const debug = Debug('itb:server');

import express, { Router } from 'express';
import morgan from 'morgan';
import cors, { CorsOptions } from 'cors'
import { getEnv } from '../utils/getEnv';
import { credentialIssuanceRequest } from './endpoints/credentialIssuanceRequest';
import { issueStatus } from './endpoints/issueStatus';

const PORT = Number.parseInt(getEnv('PORT', '5000'));
const LISTEN_ADDRESS = getEnv('LISTEN_ADDRESS', '0.0.0.0');

export async function initialise()
{
    debug("initialising http service");
    const app = basicExpressServer();
    const router = Router();
    app.use('/', router);

    credentialIssuanceRequest(router);
    issueStatus(router);

    debug("opening listening port");
    app.listen(PORT, LISTEN_ADDRESS, () => {});
    debug("service is live");
}

function basicExpressServer() {
    const app = express();
    app.use(morgan("combined"));

    //const store = new expressSession.MemoryStore()
    //app.use(expressSession({ store });

    const corsOptions: CorsOptions = {
        origin: '*',
        credentials: true,
        optionsSuccessStatus: 204,
    }
    app.use(cors(corsOptions));
    app.use(express.urlencoded({ limit: '50mb', extended: true }))
    app.use(express.json({ limit: '50mb' }));
    return app;
}