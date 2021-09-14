var _Gitlab_req, _Gitlab_token;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import dotenv from 'dotenv';
dotenv.config();
import * as u from '@jsmanifest/utils';
import axios from 'axios';
import chalk from 'chalk';
const tag = `[${chalk.keyword('navajowhite')('gitlab')}]`;
class Gitlab {
    constructor(token) {
        _Gitlab_req.set(this, axios.create({
            baseURL: `https://gitlab.aitmed.com/api/v4`,
            headers: {
                Authorization: `Bearer ${process.env.GITLAB_TOKEN}`,
            },
        }));
        _Gitlab_token.set(this, '');
        __classPrivateFieldSet(this, _Gitlab_token, token, "f");
    }
    async getProjects() {
        try {
            const resp = await __classPrivateFieldGet(this, _Gitlab_req, "f").get(`/projects`);
            return resp.data;
        }
        catch (error) {
            u.throwError(error);
        }
    }
}
_Gitlab_req = new WeakMap(), _Gitlab_token = new WeakMap();
const gitlab = new Gitlab(process.env.GITLAB_TOKEN);
const start = async () => {
    try {
        const result = await gitlab.getProjects();
        result.forEach((r) => console.log(r.name));
        // console.log(`Projects`, result)
    }
    catch (error) {
        console.error(error);
    }
};
const activeProjects = [{ label: 'search', id: 213 }];
start();
export default Gitlab;
//# sourceMappingURL=gitlab.js.map