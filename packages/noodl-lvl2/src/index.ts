// import Ecos, {
// 	Edge,
// 	Doc,
// 	Vertex,
// 	cdReq as CreateDocRequest,
// 	cvReq as CreateVertexRequest,
// 	dxReq as DeleteDocumentRequest,
// 	rxReq as RetrieveDeleteRequest,
// 	cdResp as CreateDocResponse,
// 	cvResp as CreateVertexResponse,
// 	dxResp as DeleteDocumentResponse,
// 	rdResp as RetrieveDocumentResponse,
// 	reResp as RetrieveEdgeResponse,
// 	rvResp as RetrieveVertexResponse,
// } from '@aitmed/protorepo'
// import { EcosAPIClient } from '@aitmed/protorepo/dist/types/js/ecos/v1beta1/ecos_apiServiceClientPb'
import EcosLvl2Sdk from '@aitmed/ecos-lvl2-sdk'

class NoodlLevel2 {
	//
}

const lvl2 = new EcosLvl2Sdk({
	apiVersion: 'v1beta1',
	apiHost: 'albh2.aitmed.io',
	configUrl: `https://public.aitmed.com/config/meet4d.yml`,
	env: 'development',
})

;(async () => {
	const config = await lvl2.loadConfigData()
})()

export default NoodlLevel2
