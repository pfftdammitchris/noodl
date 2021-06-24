// package: aitmed.ecos.v1beta1
// file: ecos/v1beta1/types.proto

import * as jspb from "google-protobuf";

export class Vertex extends jspb.Message {
  getCtime(): number;
  setCtime(value: number): void;

  getMtime(): number;
  setMtime(value: number): void;

  getAtime(): number;
  setAtime(value: number): void;

  getAtimes(): number;
  setAtimes(value: number): void;

  getTage(): number;
  setTage(value: number): void;

  getId(): Uint8Array | string;
  getId_asU8(): Uint8Array;
  getId_asB64(): string;
  setId(value: Uint8Array | string): void;

  getType(): number;
  setType(value: number): void;

  getName(): string;
  setName(value: string): void;

  getDeat(): string;
  setDeat(value: string): void;

  getPk(): Uint8Array | string;
  getPk_asU8(): Uint8Array;
  getPk_asB64(): string;
  setPk(value: Uint8Array | string): void;

  getEsk(): Uint8Array | string;
  getEsk_asU8(): Uint8Array;
  getEsk_asB64(): string;
  setEsk(value: Uint8Array | string): void;

  getUid(): string;
  setUid(value: string): void;

  getSubtype(): number;
  setSubtype(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Vertex.AsObject;
  static toObject(includeInstance: boolean, msg: Vertex): Vertex.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Vertex, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Vertex;
  static deserializeBinaryFromReader(message: Vertex, reader: jspb.BinaryReader): Vertex;
}

export namespace Vertex {
  export type AsObject = {
    ctime: number,
    mtime: number,
    atime: number,
    atimes: number,
    tage: number,
    id: Uint8Array | string,
    type: number,
    name: string,
    deat: string,
    pk: Uint8Array | string,
    esk: Uint8Array | string,
    uid: string,
    subtype: number,
  }
}

export class Edge extends jspb.Message {
  getCtime(): number;
  setCtime(value: number): void;

  getMtime(): number;
  setMtime(value: number): void;

  getAtime(): number;
  setAtime(value: number): void;

  getAtimes(): number;
  setAtimes(value: number): void;

  getTage(): number;
  setTage(value: number): void;

  getId(): Uint8Array | string;
  getId_asU8(): Uint8Array;
  getId_asB64(): string;
  setId(value: Uint8Array | string): void;

  getType(): number;
  setType(value: number): void;

  getName(): string;
  setName(value: string): void;

  getDeat(): string;
  setDeat(value: string): void;

  getSubtype(): number;
  setSubtype(value: number): void;

  getBvid(): Uint8Array | string;
  getBvid_asU8(): Uint8Array;
  getBvid_asB64(): string;
  setBvid(value: Uint8Array | string): void;

  getEvid(): Uint8Array | string;
  getEvid_asU8(): Uint8Array;
  getEvid_asB64(): string;
  setEvid(value: Uint8Array | string): void;

  getStime(): number;
  setStime(value: number): void;

  getEtime(): number;
  setEtime(value: number): void;

  getRefid(): Uint8Array | string;
  getRefid_asU8(): Uint8Array;
  getRefid_asB64(): string;
  setRefid(value: Uint8Array | string): void;

  getBesak(): Uint8Array | string;
  getBesak_asU8(): Uint8Array;
  getBesak_asB64(): string;
  setBesak(value: Uint8Array | string): void;

  getEesak(): Uint8Array | string;
  getEesak_asU8(): Uint8Array;
  getEesak_asB64(): string;
  setEesak(value: Uint8Array | string): void;

  getSig(): Uint8Array | string;
  getSig_asU8(): Uint8Array;
  getSig_asB64(): string;
  setSig(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Edge.AsObject;
  static toObject(includeInstance: boolean, msg: Edge): Edge.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Edge, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Edge;
  static deserializeBinaryFromReader(message: Edge, reader: jspb.BinaryReader): Edge;
}

export namespace Edge {
  export type AsObject = {
    ctime: number,
    mtime: number,
    atime: number,
    atimes: number,
    tage: number,
    id: Uint8Array | string,
    type: number,
    name: string,
    deat: string,
    subtype: number,
    bvid: Uint8Array | string,
    evid: Uint8Array | string,
    stime: number,
    etime: number,
    refid: Uint8Array | string,
    besak: Uint8Array | string,
    eesak: Uint8Array | string,
    sig: Uint8Array | string,
  }
}

export class Doc extends jspb.Message {
  getCtime(): number;
  setCtime(value: number): void;

  getMtime(): number;
  setMtime(value: number): void;

  getAtime(): number;
  setAtime(value: number): void;

  getAtimes(): number;
  setAtimes(value: number): void;

  getTage(): number;
  setTage(value: number): void;

  getId(): Uint8Array | string;
  getId_asU8(): Uint8Array;
  getId_asB64(): string;
  setId(value: Uint8Array | string): void;

  getType(): number;
  setType(value: number): void;

  getName(): string;
  setName(value: string): void;

  getDeat(): string;
  setDeat(value: string): void;

  getSize(): number;
  setSize(value: number): void;

  getFid(): Uint8Array | string;
  getFid_asU8(): Uint8Array;
  getFid_asB64(): string;
  setFid(value: Uint8Array | string): void;

  getEid(): Uint8Array | string;
  getEid_asU8(): Uint8Array;
  getEid_asB64(): string;
  setEid(value: Uint8Array | string): void;

  getOvid(): Uint8Array | string;
  getOvid_asU8(): Uint8Array;
  getOvid_asB64(): string;
  setOvid(value: Uint8Array | string): void;

  getReid(): Uint8Array | string;
  getReid_asU8(): Uint8Array;
  getReid_asB64(): string;
  setReid(value: Uint8Array | string): void;

  getSubtype(): number;
  setSubtype(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Doc.AsObject;
  static toObject(includeInstance: boolean, msg: Doc): Doc.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Doc, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Doc;
  static deserializeBinaryFromReader(message: Doc, reader: jspb.BinaryReader): Doc;
}

export namespace Doc {
  export type AsObject = {
    ctime: number,
    mtime: number,
    atime: number,
    atimes: number,
    tage: number,
    id: Uint8Array | string,
    type: number,
    name: string,
    deat: string,
    size: number,
    fid: Uint8Array | string,
    eid: Uint8Array | string,
    ovid: Uint8Array | string,
    reid: Uint8Array | string,
    subtype: number,
  }
}

