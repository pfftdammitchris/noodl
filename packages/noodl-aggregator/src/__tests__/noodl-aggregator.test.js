"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const com = require("noodl-common");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const nock_1 = require("nock");
const yaml_1 = require("yaml");
const noodl_aggregator_1 = require("../noodl-aggregator");
const c = require("../constants");
const cadlEndpointYml = fs_extra_1.default.readFileSync(path_1.default.join(__dirname, './fixtures/cadlEndpoint.yml'), 'utf8');
const meet4dYml = fs_extra_1.default.readFileSync(path_1.default.join(__dirname, './fixtures/meet4d.yml'), 'utf8');
const pathToFixtures = path_1.default.join(__dirname, './fixtures');
const cadlEndpointDoc = yaml_1.default.parseDocument(cadlEndpointYml);
const preloadPages = cadlEndpointDoc.get('preload').toJSON();
const pages = cadlEndpointDoc.get('page').toJSON();
const data = com.loadFiles(pathToFixtures, { as: 'object' });
const mockAllPageRequests = (_aggregator = aggregator) => {
    for (let page of [...preloadPages, ...pages]) {
        page.startsWith('~/') && (page = page.replace('~/', ''));
        nock_1.default(baseUrl).get(`/${page}_en.yml`).reply(200, data[page]);
    }
};
let aggregator;
let assetsUrl = `https://public.aitmed.com/cadl/meet3_0.45d/assets/`;
let baseConfigUrl = `https://${c.DEFAULT_CONFIG_HOSTNAME}/config`;
let baseUrl = `https://public.aitmed.com/cadl/meet3_0.45d/`;
beforeEach(() => {
    aggregator = new noodl_aggregator_1.default('meet4d');
    nock_1.default(baseConfigUrl).get('/meet4d.yml').reply(200, meet4dYml);
    nock_1.default(baseUrl).get('/cadlEndpoint.yml').reply(200, cadlEndpointYml);
});
afterEach(() => {
    nock_1.default.cleanAll();
});
const init = async (_aggregator = aggregator) => _aggregator.init({ loadPages: false, loadPreloadPages: false });
describe(com.coolGold(`noodl-aggregator`), () => {
    describe(com.italic(`init`), () => {
        it(`should initiate both the root config and app config`, async () => {
            const { doc } = await init();
            chai_1.expect(doc.root?.has('cadlMain')).to.be.true;
            chai_1.expect(doc.app?.has('preload')).to.be.true;
            chai_1.expect(doc.app?.has('page')).to.be.true;
        });
        it(`should be able to get the assets url`, async () => {
            chai_1.expect(aggregator.assetsUrl).not.to.eq(assetsUrl);
            await init();
            chai_1.expect(aggregator.assetsUrl).to.eq(assetsUrl);
        });
        it(`should be able to get the baseUrl`, async () => {
            chai_1.expect(aggregator.baseUrl).not.to.eq(baseUrl);
            await init();
            chai_1.expect(aggregator.baseUrl).to.eq(baseUrl);
        });
        it(`should be able to get the config version (latest)`, async () => {
            chai_1.expect(aggregator.configVersion).to.eq('');
            await init();
            chai_1.expect(aggregator.configVersion).to.eq('0.45d');
        });
        it(`should be able to get the app config url`, async () => {
            chai_1.expect(aggregator.appConfigUrl).to.eq('');
            await init();
            chai_1.expect(aggregator.configVersion).to.eq('0.45d');
        });
        it(`should load all the preload pages by default`, async () => {
            for (const name of preloadPages) {
                nock_1.default(baseUrl)
                    .get(new RegExp(name, 'gi'))
                    .reply(200, `
					${name}:
						VoidObj: vVoOiIdD
						Style:
							top: '0'
					`);
            }
            await aggregator.init({ loadPages: false });
            preloadPages.forEach((preloadPage) => {
                chai_1.expect(aggregator.root.get(preloadPage)).to.exist;
            });
        });
        it(`should load all the pages by default`, async () => {
            mockAllPageRequests();
            await aggregator.init({ loadPreloadPages: false });
            pages.forEach((page) => chai_1.expect(aggregator.root.get(page.replace('~/', ''))).to.exist);
        });
    });
    describe(com.italic(`extractAssets`), () => {
        it(`should extract the assets`, async () => {
            mockAllPageRequests();
            await aggregator.init();
            const assetsUrl = aggregator.assetsUrl;
            const assets = aggregator.extractAssets();
            chai_1.expect(assets).to.have.length.greaterThan(0);
            for (const asset of assets) {
                chai_1.expect(asset).to.have.property('url', `${assetsUrl}${asset.filename}${asset.ext}`);
            }
        });
    });
});
//# sourceMappingURL=noodl-aggregator.test.js.map