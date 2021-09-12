import yaml from 'yaml';
import type { AppConfig } from 'noodl-types';
export declare function extractPreloadPages(doc: yaml.Document | AppConfig | undefined): string[];
export declare function extractPages(doc: yaml.Document | AppConfig | undefined): string[];
