// package: aitmed.ecos.v1beta1
// file: ecos/v1beta1/ecos_api.proto

import * as jspb from "google-protobuf";
import * as google_protobuf_field_mask_pb from "google-protobuf/google/protobuf/field_mask_pb";
import * as ecos_v1beta1_types_pb from "../../ecos/v1beta1/types_pb";

export class ceReq extends jspb.Message {
  getJwt(): string;
  setJwt(value: string): void;

  hasPmask(): boolean;
  clearPmask(): void;
  getPmask(): google_protobuf_field_mask_pb.FieldMask | undefined;
  setPmask(value?: google_protobuf_field_mask_pb.FieldMask): void;

  hasRmask(): boolean;
  clearRmask(): void;
  getRmask(): google_protobuf_field_mask_pb.FieldMask | undefined;
  setRmask(value?: google_protobuf_field_mask_pb.FieldMask): void;

  hasEdge(): boolean;
  clearEdge(): void;
  getEdge(): ecos_v1beta1_types_pb.Edge | undefined;
  setEdge(value?: ecos_v1beta1_types_pb.Edge): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ceReq.AsObject;
  static toObject(includeInstance: boolean, msg: ceReq): ceReq.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ceReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ceReq;
  static deserializeBinaryFromReader(message: ceReq, reader: jspb.BinaryReader): ceReq;
}

export namespace ceReq {
  export type AsObject = {
    jwt: string,
    pmask?: google_protobuf_field_mask_pb.FieldMask.AsObject,
    rmask?: google_protobuf_field_mask_pb.FieldMask.AsObject,
    edge?: ecos_v1beta1_types_pb.Edge.AsObject,
  }
}

export class ceResp extends jspb.Message {
  getJwt(): string;
  setJwt(value: string): void;

  getCode(): number;
  setCode(value: number): void;

  getError(): string;
  setError(value: string): void;

  hasEdge(): boolean;
  clearEdge(): void;
  getEdge(): ecos_v1beta1_types_pb.Edge | undefined;
  setEdge(value?: ecos_v1beta1_types_pb.Edge): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ceResp.AsObject;
  static toObject(includeInstance: boolean, msg: ceResp): ceResp.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ceResp, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ceResp;
  static deserializeBinaryFromReader(message: ceResp, reader: jspb.BinaryReader): ceResp;
}

export namespace ceResp {
  export type AsObject = {
    jwt: string,
    code: number,
    error: string,
    edge?: ecos_v1beta1_types_pb.Edge.AsObject,
  }
}

export class rxReq extends jspb.Message {
  getJwt(): string;
  setJwt(value: string): void;

  hasPmask(): boolean;
  clearPmask(): void;
  getPmask(): google_protobuf_field_mask_pb.FieldMask | undefined;
  setPmask(value?: google_protobuf_field_mask_pb.FieldMask): void;

  hasRmask(): boolean;
  clearRmask(): void;
  getRmask(): google_protobuf_field_mask_pb.FieldMask | undefined;
  setRmask(value?: google_protobuf_field_mask_pb.FieldMask): void;

  getObjtype(): number;
  setObjtype(value: number): void;

  clearIdList(): void;
  getIdList(): Array<Uint8Array | string>;
  getIdList_asU8(): Array<Uint8Array>;
  getIdList_asB64(): Array<string>;
  setIdList(value: Array<Uint8Array | string>): void;
  addId(value: Uint8Array | string, index?: number): Uint8Array | string;

  getXfname(): string;
  setXfname(value: string): void;

  getType(): number;
  setType(value: number): void;

  getKey(): string;
  setKey(value: string): void;

  getSfname(): string;
  setSfname(value: string): void;

  getLoid(): Uint8Array | string;
  getLoid_asU8(): Uint8Array;
  getLoid_asB64(): string;
  setLoid(value: Uint8Array | string): void;

  getMaxcount(): number;
  setMaxcount(value: number): void;

  getObfname(): string;
  setObfname(value: string): void;

  getScondition(): string;
  setScondition(value: string): void;

  getAsc(): boolean;
  setAsc(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): rxReq.AsObject;
  static toObject(includeInstance: boolean, msg: rxReq): rxReq.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: rxReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): rxReq;
  static deserializeBinaryFromReader(message: rxReq, reader: jspb.BinaryReader): rxReq;
}

export namespace rxReq {
  export type AsObject = {
    jwt: string,
    pmask?: google_protobuf_field_mask_pb.FieldMask.AsObject,
    rmask?: google_protobuf_field_mask_pb.FieldMask.AsObject,
    objtype: number,
    idList: Array<Uint8Array | string>,
    xfname: string,
    type: number,
    key: string,
    sfname: string,
    loid: Uint8Array | string,
    maxcount: number,
    obfname: string,
    scondition: string,
    asc: boolean,
  }
}

export class reResp extends jspb.Message {
  getJwt(): string;
  setJwt(value: string): void;

  getCode(): number;
  setCode(value: number): void;

  getError(): string;
  setError(value: string): void;

  clearEdgeList(): void;
  getEdgeList(): Array<ecos_v1beta1_types_pb.Edge>;
  setEdgeList(value: Array<ecos_v1beta1_types_pb.Edge>): void;
  addEdge(value?: ecos_v1beta1_types_pb.Edge, index?: number): ecos_v1beta1_types_pb.Edge;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): reResp.AsObject;
  static toObject(includeInstance: boolean, msg: reResp): reResp.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: reResp, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): reResp;
  static deserializeBinaryFromReader(message: reResp, reader: jspb.BinaryReader): reResp;
}

export namespace reResp {
  export type AsObject = {
    jwt: string,
    code: number,
    error: string,
    edgeList: Array<ecos_v1beta1_types_pb.Edge.AsObject>,
  }
}

export class rvResp extends jspb.Message {
  getJwt(): string;
  setJwt(value: string): void;

  getCode(): number;
  setCode(value: number): void;

  getError(): string;
  setError(value: string): void;

  clearVertexList(): void;
  getVertexList(): Array<ecos_v1beta1_types_pb.Vertex>;
  setVertexList(value: Array<ecos_v1beta1_types_pb.Vertex>): void;
  addVertex(value?: ecos_v1beta1_types_pb.Vertex, index?: number): ecos_v1beta1_types_pb.Vertex;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): rvResp.AsObject;
  static toObject(includeInstance: boolean, msg: rvResp): rvResp.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: rvResp, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): rvResp;
  static deserializeBinaryFromReader(message: rvResp, reader: jspb.BinaryReader): rvResp;
}

export namespace rvResp {
  export type AsObject = {
    jwt: string,
    code: number,
    error: string,
    vertexList: Array<ecos_v1beta1_types_pb.Vertex.AsObject>,
  }
}

export class rdResp extends jspb.Message {
  getJwt(): string;
  setJwt(value: string): void;

  getCode(): number;
  setCode(value: number): void;

  getError(): string;
  setError(value: string): void;

  clearDocList(): void;
  getDocList(): Array<ecos_v1beta1_types_pb.Doc>;
  setDocList(value: Array<ecos_v1beta1_types_pb.Doc>): void;
  addDoc(value?: ecos_v1beta1_types_pb.Doc, index?: number): ecos_v1beta1_types_pb.Doc;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): rdResp.AsObject;
  static toObject(includeInstance: boolean, msg: rdResp): rdResp.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: rdResp, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): rdResp;
  static deserializeBinaryFromReader(message: rdResp, reader: jspb.BinaryReader): rdResp;
}

export namespace rdResp {
  export type AsObject = {
    jwt: string,
    code: number,
    error: string,
    docList: Array<ecos_v1beta1_types_pb.Doc.AsObject>,
  }
}

export class dxReq extends jspb.Message {
  getJwt(): string;
  setJwt(value: string): void;

  clearIdList(): void;
  getIdList(): Array<Uint8Array | string>;
  getIdList_asU8(): Array<Uint8Array>;
  getIdList_asB64(): Array<string>;
  setIdList(value: Array<Uint8Array | string>): void;
  addId(value: Uint8Array | string, index?: number): Uint8Array | string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): dxReq.AsObject;
  static toObject(includeInstance: boolean, msg: dxReq): dxReq.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: dxReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): dxReq;
  static deserializeBinaryFromReader(message: dxReq, reader: jspb.BinaryReader): dxReq;
}

export namespace dxReq {
  export type AsObject = {
    jwt: string,
    idList: Array<Uint8Array | string>,
  }
}

export class dxResp extends jspb.Message {
  getJwt(): string;
  setJwt(value: string): void;

  getCode(): number;
  setCode(value: number): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): dxResp.AsObject;
  static toObject(includeInstance: boolean, msg: dxResp): dxResp.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: dxResp, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): dxResp;
  static deserializeBinaryFromReader(message: dxResp, reader: jspb.BinaryReader): dxResp;
}

export namespace dxResp {
  export type AsObject = {
    jwt: string,
    code: number,
    error: string,
  }
}

export class cvReq extends jspb.Message {
  getJwt(): string;
  setJwt(value: string): void;

  hasPmask(): boolean;
  clearPmask(): void;
  getPmask(): google_protobuf_field_mask_pb.FieldMask | undefined;
  setPmask(value?: google_protobuf_field_mask_pb.FieldMask): void;

  hasRmask(): boolean;
  clearRmask(): void;
  getRmask(): google_protobuf_field_mask_pb.FieldMask | undefined;
  setRmask(value?: google_protobuf_field_mask_pb.FieldMask): void;

  hasVertex(): boolean;
  clearVertex(): void;
  getVertex(): ecos_v1beta1_types_pb.Vertex | undefined;
  setVertex(value?: ecos_v1beta1_types_pb.Vertex): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): cvReq.AsObject;
  static toObject(includeInstance: boolean, msg: cvReq): cvReq.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: cvReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): cvReq;
  static deserializeBinaryFromReader(message: cvReq, reader: jspb.BinaryReader): cvReq;
}

export namespace cvReq {
  export type AsObject = {
    jwt: string,
    pmask?: google_protobuf_field_mask_pb.FieldMask.AsObject,
    rmask?: google_protobuf_field_mask_pb.FieldMask.AsObject,
    vertex?: ecos_v1beta1_types_pb.Vertex.AsObject,
  }
}

export class cvResp extends jspb.Message {
  getJwt(): string;
  setJwt(value: string): void;

  getCode(): number;
  setCode(value: number): void;

  getError(): string;
  setError(value: string): void;

  hasVertex(): boolean;
  clearVertex(): void;
  getVertex(): ecos_v1beta1_types_pb.Vertex | undefined;
  setVertex(value?: ecos_v1beta1_types_pb.Vertex): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): cvResp.AsObject;
  static toObject(includeInstance: boolean, msg: cvResp): cvResp.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: cvResp, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): cvResp;
  static deserializeBinaryFromReader(message: cvResp, reader: jspb.BinaryReader): cvResp;
}

export namespace cvResp {
  export type AsObject = {
    jwt: string,
    code: number,
    error: string,
    vertex?: ecos_v1beta1_types_pb.Vertex.AsObject,
  }
}

export class cdReq extends jspb.Message {
  getJwt(): string;
  setJwt(value: string): void;

  hasPmask(): boolean;
  clearPmask(): void;
  getPmask(): google_protobuf_field_mask_pb.FieldMask | undefined;
  setPmask(value?: google_protobuf_field_mask_pb.FieldMask): void;

  hasRmask(): boolean;
  clearRmask(): void;
  getRmask(): google_protobuf_field_mask_pb.FieldMask | undefined;
  setRmask(value?: google_protobuf_field_mask_pb.FieldMask): void;

  hasDoc(): boolean;
  clearDoc(): void;
  getDoc(): ecos_v1beta1_types_pb.Doc | undefined;
  setDoc(value?: ecos_v1beta1_types_pb.Doc): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): cdReq.AsObject;
  static toObject(includeInstance: boolean, msg: cdReq): cdReq.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: cdReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): cdReq;
  static deserializeBinaryFromReader(message: cdReq, reader: jspb.BinaryReader): cdReq;
}

export namespace cdReq {
  export type AsObject = {
    jwt: string,
    pmask?: google_protobuf_field_mask_pb.FieldMask.AsObject,
    rmask?: google_protobuf_field_mask_pb.FieldMask.AsObject,
    doc?: ecos_v1beta1_types_pb.Doc.AsObject,
  }
}

export class cdResp extends jspb.Message {
  getJwt(): string;
  setJwt(value: string): void;

  getCode(): number;
  setCode(value: number): void;

  getError(): string;
  setError(value: string): void;

  hasDoc(): boolean;
  clearDoc(): void;
  getDoc(): ecos_v1beta1_types_pb.Doc | undefined;
  setDoc(value?: ecos_v1beta1_types_pb.Doc): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): cdResp.AsObject;
  static toObject(includeInstance: boolean, msg: cdResp): cdResp.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: cdResp, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): cdResp;
  static deserializeBinaryFromReader(message: cdResp, reader: jspb.BinaryReader): cdResp;
}

export namespace cdResp {
  export type AsObject = {
    jwt: string,
    code: number,
    error: string,
    doc?: ecos_v1beta1_types_pb.Doc.AsObject,
  }
}

