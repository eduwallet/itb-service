import moment from 'moment';
import { v4 } from 'uuid';

interface SessionState {
    id:string;
    expiry:Date;
    [x:string]:any;
}

class SessionManager {
    public sessions:Map<string,SessionState>;
    
    public constructor() {
        this.sessions = new Map<string,SessionState>();
    }

    public async get(id:string): Promise<SessionState> {
        if (!id || id == '') {
            id = v4();
        }
        if (!this.sessions.has(id)) {
            this.sessions.set(id, {id:id, expiry: moment().add(1, 'hour').toDate()});
        }    
        return this.sessions.get(id)!;
    }

    public async set(state:SessionState)
    {
        this.sessions.set(state.id, state);
    }

    public async clear()
    {
        const now = Date();
        const removeKeys:string[] = [];
        for (const key of this.sessions.keys()) {
            let state = this.sessions[key];
            if (state.expiry < now) {
                removeKeys.push(key);
            }
        }

        for (const key of removeKeys) {
            this.sessions.delete(key);
        }
    }
}
const _manager = new SessionManager();

export function getSessionManager() {
    return _manager;
}