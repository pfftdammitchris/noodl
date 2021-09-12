"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const Metadata_1 = require("../Metadata");
const utils_1 = require("../utils");
const actionsVisitor_js_1 = require("../Metadata/visitors/actionsVisitor.js");
const componentsVisitor_js_1 = require("../Metadata/visitors/componentsVisitor.js");
const hasuraApiEndpoint = 'https://data.pro.hasura.io/v1/graphql';
const graphqlEndpoint = 'https://ecos-noodl.hasura.app/v1/graphql';
const adminSecret = 'VzqnFhstCXpdPz6bl76kmALogk8n0dDxAm1Y6DFj2k7xcy25Dpu86HzSq5aG6wQo';
const cloudIp = '54.176.149.52';
const project = {
    name: 'ecos-noodl',
    id: '50b3455b-079d-47ce-9048-4826ea6d8d65',
};
const owner = 'pfftdammitchris@gmail.com';
const handler = async (event, context) => {
    try {
        const { queryStringParameters, rawUrl } = event;
        const params = queryStringParameters;
        console.log({ params });
        const configName = params?.config || '';
        if (!configName)
            throw new Error(`Variable "config" is required`);
        const metadata = new Metadata_1.default(configName);
        if ([params.actionTypes, params.actionObjects, params.actionsStats].some((cond) => !!cond)) {
            const options = {};
            params.actionTypes && (options.actionTypes = true);
            params.actionObjects && (options.actionObjects = true);
            params.actionsStats && (options.actionsStats = true);
            metadata.createVisitor(actionsVisitor_js_1.default, options);
        }
        if ([
            params.componentTypes,
            params.componentObjects,
            params.componentsStats,
        ].some((cond) => !!cond)) {
            const options = {};
            params.componentTypes && (options.componentTypes = true);
            params.componentObjects && (options.componentObjects = true);
            params.componentsStats && (options.componentsStats = true);
            metadata.createVisitor(componentsVisitor_js_1.default, options);
        }
        await metadata.run();
        return utils_1.getSuccessResponse(metadata.context);
    }
    catch (error) {
        return utils_1.getErrorResponse(error);
    }
};
exports.handler = handler;
//# sourceMappingURL=metadata.js.map