import * as babel from '@babel/core'
// import AitmedProtorepo from '@aitmed/protorepo/js/ecos/v1beta1/ecos_api_pb'
import * as u from '@jsmanifest/utils'
import * as ts from 'ts-morph'
import * as esbuild from 'esbuild'
import fs from 'fs-extra'
import path from 'path'
import grpcWeb from 'grpc-web'
import { Edge, Vertex, Doc } from '@aitmed/protorepo/js/ecos/v1beta1/types_pb'
import {
	cdReq,
	cdResp,
	ceReq,
	ceResp,
	cvReq,
	cvResp,
	dxReq,
	dxResp,
	rdResp,
	reResp,
	rvResp,
	rxReq,
} from '@aitmed/protorepo/js/ecos/v1beta1/ecos_api_pb'
// import { EcosAPIClient } from '../lib/ecos_apiServiceClientPb'
// import A from '../lib/ecos_api_pb'
// import B from '../lib/types_pb'
import * as t from './types'

const apiVersion = 'v1beta1'
const apiHost = 'albh2.aitmed.io'
const url = `https://${apiHost}`
// const ecos = new EcosAPIClient(apiHost, undefined) as t.Ecos

class EcosAPIClient {
	client_: grpcWeb.AbstractClientBase
	hostname_: string
	credentials_: null | { [index: string]: string }
	options_: null | { [index: string]: string }

	constructor(
		hostname: string,
		credentials?: null | { [index: string]: string },
		options?: null | { [index: string]: string },
	) {
		if (!options) options = {}
		if (!credentials) credentials = {}
		options['format'] = 'text'

		this.client_ = new grpcWeb.GrpcWebClientBase(options)
		this.hostname_ = hostname
		this.credentials_ = credentials
		this.options_ = options
	}

	methodInfoce = new grpcWeb.AbstractClientBase.MethodInfo(
		ceResp,
		(request: ceReq) => {
			return request.serializeBinary()
		},
		ceResp.deserializeBinary,
	)

	ce(
		request: ceReq,
		metadata: grpcWeb.Metadata | null,
		callback: (err: grpcWeb.Error, response: ceResp) => void,
	) {
		return this.client_.rpcCall(
			this.hostname_ + '/aitmed.ecos.v1beta1.EcosAPI/ce',
			request,
			metadata || {},
			this.methodInfoce,
			callback,
		)
	}

	methodInfore = new grpcWeb.AbstractClientBase.MethodInfo(
		reResp,
		(request: rxReq) => {
			return request.serializeBinary()
		},
		reResp.deserializeBinary,
	)

	re(
		request: rxReq,
		metadata: grpcWeb.Metadata | null,
		callback: (err: grpcWeb.Error, response: reResp) => void,
	) {
		return this.client_.rpcCall(
			this.hostname_ + '/aitmed.ecos.v1beta1.EcosAPI/re',
			request,
			metadata || {},
			this.methodInfore,
			callback,
		)
	}

	methodInfodx = new grpcWeb.AbstractClientBase.MethodInfo(
		dxResp,
		(request: dxReq) => {
			return request.serializeBinary()
		},
		dxResp.deserializeBinary,
	)

	dx(
		request: dxReq,
		metadata: grpcWeb.Metadata | null,
		callback: (err: grpcWeb.Error, response: dxResp) => void,
	) {
		return this.client_.rpcCall(
			this.hostname_ + '/aitmed.ecos.v1beta1.EcosAPI/dx',
			request,
			metadata || {},
			this.methodInfodx,
			callback,
		)
	}

	methodInfocv = new grpcWeb.AbstractClientBase.MethodInfo(
		cvResp,
		(request: cvReq) => {
			return request.serializeBinary()
		},
		cvResp.deserializeBinary,
	)

	cv(
		request: cvReq,
		metadata: grpcWeb.Metadata | null,
		callback: (err: grpcWeb.Error, response: cvResp) => void,
	) {
		return this.client_.rpcCall(
			this.hostname_ + '/aitmed.ecos.v1beta1.EcosAPI/cv',
			request,
			metadata || {},
			this.methodInfocv,
			callback,
		)
	}

	methodInforv = new grpcWeb.AbstractClientBase.MethodInfo(
		rvResp,
		(request: rxReq) => {
			return request.serializeBinary()
		},
		rvResp.deserializeBinary,
	)

	rv(
		request: rxReq,
		metadata: grpcWeb.Metadata | null,
		callback: (err: grpcWeb.Error, response: rvResp) => void,
	) {
		return this.client_.rpcCall(
			this.hostname_ + '/aitmed.ecos.v1beta1.EcosAPI/rv',
			request,
			metadata || {},
			this.methodInforv,
			callback,
		)
	}

	methodInfocd = new grpcWeb.AbstractClientBase.MethodInfo(
		cdResp,
		(request: cdReq) => {
			return request.serializeBinary()
		},
		cdResp.deserializeBinary,
	)

	cd(
		request: cdReq,
		metadata: grpcWeb.Metadata | null,
		callback: (err: grpcWeb.Error, response: cdResp) => void,
	) {
		return this.client_.rpcCall(
			this.hostname_ + '/aitmed.ecos.v1beta1.EcosAPI/cd',
			request,
			metadata || {},
			this.methodInfocd,
			callback,
		)
	}

	methodInford = new grpcWeb.AbstractClientBase.MethodInfo(
		rdResp,
		(request: rxReq) => {
			return request.serializeBinary()
		},
		rdResp.deserializeBinary,
	)

	rd(
		request: rxReq,
		metadata: grpcWeb.Metadata | null,
		callback: (err: grpcWeb.Error, response: rdResp) => void,
	) {
		return this.client_.rpcCall(
			this.hostname_ + '/aitmed.ecos.v1beta1.EcosAPI/rd',
			request,
			metadata || {},
			this.methodInford,
			callback,
		)
	}
}

const ecos = new EcosAPIClient(apiHost, undefined)

console.log(ecos)
