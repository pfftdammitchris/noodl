import { DeviceType, Env, RootConfig, Url } from 'noodl-types';
import { LiteralUnion } from 'type-fest';
import * as t from './types';
declare class NoodlUtilsParser {
    configVersion(configObject: RootConfig, deviceType: LiteralUnion<DeviceType, string>, env: Env): any;
    appConfigUrl(rootConfig: RootConfig, deviceType: LiteralUnion<DeviceType, string>, env: Env): string;
    appConfigUrl(baseUrl: string, cadlMain: string, configVersion: string): string;
    destination(destination: Url.PageComponent): t.ParsedPageComponentUrlObject;
    destination(destination: string | undefined, args: {
        denoter?: string;
        duration?: number;
    }): t.ParsedGotoUrlObject;
    /**
     * Parses a NOODL destination, commonly received from goto
     * or pageJump actions as a string. The return value (for now) is
     * intended to be directly assigned to page.pageUrl (subject to change)
     * The target string to analyze here is the "destination" which might come
     * in various forms such as:
     *    GotoViewTag#redTag
     *
     * @param { string } pageUrl - Current page url (should be page.pageUrl from the Page instance)
     * @param { string } options.destination - Destination
     * @param { string } options.startPage
     */
    queryString({ destination, pageUrl, startPage, }: {
        destination: string;
        pageUrl: string;
        startPage?: string;
    }): string;
}
export default NoodlUtilsParser;
