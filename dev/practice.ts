import { Project, ProjectOptions, ScriptTarget, ts } from 'ts-morph'
import yaml from 'yaml'
import { Alias, Collection, Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'
import fs from 'fs-extra'
import path from 'path'
import NoodlPage from './noodl-morph/NoodlPage'
import NoodlScalar from './noodl-morph/NoodlScalar'
import NoodlPair from './noodl-morph/NoodlPair'
import NoodlMap from './noodl-morph/NoodlMap'
import NoodlSeq from './noodl-morph/NoodlSeq'
import PageResolverMixin from './noodl-morph/mixins/PageResolverMixin'
import { Mixin, mix } from './noodl-morph/Mixin/mix'

const doc = yaml.parseDocument(
	fs.readFileSync('output/server/VideoChat.yml', 'utf8'),
)

const page = new NoodlPage(doc)

// console.log(page.getActionChains())

// const project = new Project({
// 	compilerOptions: {
// 		module: ts.ModuleKind.CommonJS,
// 		target: ts.ScriptTarget.ESNext,
// 	}
// })

// project.getSourceFiles('dev/runServer.ts')

// const src = `
//   const two = 2;
//   const four = 4;
// `
