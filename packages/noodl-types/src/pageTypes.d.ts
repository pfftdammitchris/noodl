import { ComponentObject } from './componentTypes';
export interface PageObject {
    components: ComponentObject[];
    final?: string;
    init?: string[];
    check?: string[];
    save?: string[];
    update?: string[];
    module?: string;
    pageNumber?: string;
    viewport?: any;
    lastTop?: number;
    [key: string]: any;
}
