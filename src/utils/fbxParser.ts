import * as THREE from 'three';
import { unzlibSync } from 'fflate';
import type { TopologyData, UpAxisIndex } from '@/types/viewer';

// FBX Tree node
class FBXTree {
  [key: string]: unknown;
  add(key: string, val: unknown) {
    this[key] = val;
  }
}

// Binary reader for FBX files
class BinaryReader {
  private dv: DataView;
  private offset: number;
  private littleEndian: boolean;

  constructor(buffer: ArrayBuffer, littleEndian = true) {
    this.dv = new DataView(buffer);
    this.offset = 0;
    this.littleEndian = littleEndian;
  }

  getOffset(): number { return this.offset; }
  size(): number { return this.dv.buffer.byteLength; }
  skip(length: number) { this.offset += length; }

  getBoolean(): boolean { return (this.getUint8() & 1) === 1; }

  getBooleanArray(size: number): boolean[] {
    const a: boolean[] = [];
    for (let i = 0; i < size; i++) a.push(this.getBoolean());
    return a;
  }

  getUint8(): number {
    const value = this.dv.getUint8(this.offset);
    this.offset += 1;
    return value;
  }

  getInt16(): number {
    const value = this.dv.getInt16(this.offset, this.littleEndian);
    this.offset += 2;
    return value;
  }

  getInt32(): number {
    const value = this.dv.getInt32(this.offset, this.littleEndian);
    this.offset += 4;
    return value;
  }

  getInt32Array(size: number): number[] {
    const a: number[] = [];
    for (let i = 0; i < size; i++) a.push(this.getInt32());
    return a;
  }

  getUint32(): number {
    const value = this.dv.getUint32(this.offset, this.littleEndian);
    this.offset += 4;
    return value;
  }

  getInt64(): number {
    let low: number, high: number;
    if (this.littleEndian) {
      low = this.getUint32();
      high = this.getUint32();
    } else {
      high = this.getUint32();
      low = this.getUint32();
    }
    if (high & 0x80000000) {
      high = ~high & 0xFFFFFFFF;
      low = ~low & 0xFFFFFFFF;
      if (low === 0xFFFFFFFF) high = (high + 1) & 0xFFFFFFFF;
      low = (low + 1) & 0xFFFFFFFF;
      return -(high * 0x100000000 + low);
    }
    return high * 0x100000000 + low;
  }

  getInt64Array(size: number): number[] {
    const a: number[] = [];
    for (let i = 0; i < size; i++) a.push(this.getInt64());
    return a;
  }

  getFloat32(): number {
    const value = this.dv.getFloat32(this.offset, this.littleEndian);
    this.offset += 4;
    return value;
  }

  getFloat32Array(size: number): number[] {
    const a: number[] = [];
    for (let i = 0; i < size; i++) a.push(this.getFloat32());
    return a;
  }

  getFloat64(): number {
    const value = this.dv.getFloat64(this.offset, this.littleEndian);
    this.offset += 8;
    return value;
  }

  getFloat64Array(size: number): number[] {
    const a: number[] = [];
    for (let i = 0; i < size; i++) a.push(this.getFloat64());
    return a;
  }

  getArrayBuffer(size: number): ArrayBuffer {
    const value = this.dv.buffer.slice(this.offset, this.offset + size) as ArrayBuffer;
    this.offset += size;
    return value;
  }

  getString(size: number): string {
    let s = '';
    for (let i = 0; i < size; i++) {
      s += String.fromCharCode(this.getUint8());
    }
    return s;
  }
}

// Binary FBX parser
class BinaryParser {
  parse(buffer: ArrayBuffer): FBXTree {
    const reader = new BinaryReader(buffer);
    const magic = reader.getString(20);

    if (!magic.includes('Kaydara FBX Binary')) {
      throw new Error('Not a binary FBX file');
    }

    reader.skip(3); // Reserved bytes
    const version = reader.getUint32();
    const is64 = version >= 7500;

    const fbxTree = new FBXTree();
    
    while (!this.endOfContent(reader, is64)) {
      const node = this.parseNode(reader, is64);
      if (node !== null) {
        fbxTree.add(node.name, node);
      }
    }

    return fbxTree;
  }

  private endOfContent(reader: BinaryReader, is64: boolean): boolean {
    const size = is64 ? 25 : 13;
    if (reader.size() - reader.getOffset() < size) return true;

    const start = reader.getOffset();
    let allZero = true;
    for (let i = 0; i < size; i++) {
      if (reader.getUint8() !== 0) allZero = false;
    }
    reader.skip(-size + (reader.getOffset() - start - size));
    
    return allZero;
  }

  private parseNode(reader: BinaryReader, is64: boolean): FBXNode | null {
    const endOffset = is64 ? Number(reader.getInt64()) : reader.getUint32();
    const numProperties = is64 ? Number(reader.getInt64()) : reader.getUint32();
    is64 ? reader.getInt64() : reader.getUint32(); // propertyListLen - skip
    const nameLen = reader.getUint8();
    const name = reader.getString(nameLen);

    if (endOffset === 0) return null;

    const propertyList: unknown[] = [];
    for (let i = 0; i < numProperties; i++) {
      propertyList.push(this.parseProperty(reader));
    }

    const node: FBXNode = { name, propertyList };

    if (reader.getOffset() < endOffset) {
      while (reader.getOffset() < endOffset) {
        const subNode = this.parseNode(reader, is64);
        if (subNode !== null) {
          this.parseSubNode(name, node, subNode);
        }
      }
    }

    return node;
  }

  private parseSubNode(parentName: string, node: FBXNode, subNode: FBXNode) {
    // Determine if this is a "singleProperty" node
    // A node is singleProperty if it has exactly one property and no nested children
    const isSingleProperty = subNode.propertyList.length === 1 && 
      Object.keys(subNode).filter(k => k !== 'name' && k !== 'propertyList').length === 0;

    // Handle Geometry and other ID-based nodes specially
    if (parentName === 'Objects') {
      // For Objects children (like Geometry, Model, etc.), store by ID
      if (subNode.propertyList.length > 0) {
        const id = subNode.propertyList[0];
        if (!(node as Record<string, unknown>)[subNode.name]) {
          (node as Record<string, unknown>)[subNode.name] = {};
        }
        ((node as Record<string, unknown>)[subNode.name] as Record<string, unknown>)[String(id)] = subNode;
      }
      return;
    }

    // Handle Properties70 specially - parse P nodes
    if (subNode.name === 'P' && parentName === 'Properties70') {
      const propName = subNode.propertyList[0] as string;
      // Store the value (typically the 4th element for most properties)
      if (subNode.propertyList.length >= 5) {
        (node as Record<string, unknown>)[propName] = subNode.propertyList[4];
      } else if (subNode.propertyList.length === 4) {
        (node as Record<string, unknown>)[propName] = subNode.propertyList[3];
      }
      return;
    }

    // For single property nodes
    if (isSingleProperty) {
      const value = subNode.propertyList[0];
      // If the value is an object with .a property (array), store the node with .a access
      if (value && typeof value === 'object' && 'a' in (value as object)) {
        (node as Record<string, unknown>)[subNode.name] = value;
      } else {
        (node as Record<string, unknown>)[subNode.name] = value;
      }
      return;
    }

    // For nodes with multiple properties
    if (subNode.propertyList.length > 0) {
      (node as Record<string, unknown>)[subNode.name] = subNode.propertyList;
    }

    // If the subNode has children, store them
    if (typeof (node as Record<string, unknown>)[subNode.name] !== 'object' || 
        (node as Record<string, unknown>)[subNode.name] === null) {
      (node as Record<string, unknown>)[subNode.name] = {};
    }

    for (const key in subNode) {
      if (key !== 'name' && key !== 'propertyList') {
        const target = (node as Record<string, unknown>)[subNode.name];
        if (target && typeof target === 'object') {
          (target as Record<string, unknown>)[key] = (subNode as Record<string, unknown>)[key];
        }
      }
    }
  }

  private parseProperty(reader: BinaryReader): unknown {
    const type = reader.getString(1);

    switch (type) {
      case 'C': return reader.getBoolean();
      case 'D': return reader.getFloat64();
      case 'F': return reader.getFloat32();
      case 'I': return reader.getInt32();
      case 'L': return reader.getInt64();
      case 'R': {
        const length = reader.getUint32();
        return reader.getArrayBuffer(length);
      }
      case 'S': {
        const length = reader.getUint32();
        return reader.getString(length);
      }
      case 'Y': return reader.getInt16();
      case 'b':
      case 'c':
      case 'd':
      case 'f':
      case 'i':
      case 'l':
        return this.parseArrayProperty(reader, type);
      default:
        throw new Error('Unknown property type: ' + type);
    }
  }

  private parseArrayProperty(reader: BinaryReader, type: string): { a: number[] | boolean[] } {
    const arrayLength = reader.getUint32();
    const encoding = reader.getUint32();
    const compressedLength = reader.getUint32();

    let data: ArrayBuffer;
    if (encoding === 1) {
      const compressed = new Uint8Array(reader.getArrayBuffer(compressedLength));
      data = unzlibSync(compressed).buffer as ArrayBuffer;
    } else {
      const elementSize = type === 'd' || type === 'l' ? 8 : 4;
      data = reader.getArrayBuffer(arrayLength * elementSize);
    }

    const dataReader = new BinaryReader(data);
    
    switch (type) {
      case 'b':
      case 'c':
        return { a: dataReader.getBooleanArray(arrayLength) };
      case 'd':
        return { a: dataReader.getFloat64Array(arrayLength) };
      case 'f':
        return { a: dataReader.getFloat32Array(arrayLength) };
      case 'i':
        return { a: dataReader.getInt32Array(arrayLength) };
      case 'l':
        return { a: dataReader.getInt64Array(arrayLength) };
      default:
        return { a: [] };
    }
  }
}

interface FBXNode {
  name: string;
  propertyList: unknown[];
  [key: string]: unknown;
}

// Extract topology data from parsed FBX tree
export function extractTopologyFromFBXTree(
  fbxTree: FBXTree, 
  upAxis: UpAxisIndex
): TopologyData | null {
  const result: TopologyData = {
    vertices: [],
    faces: [],
    stats: { quads: 0, tris: 0, ngons: 0, edges: 0 },
    needsNormalization: true,
  };

  // Try to detect up axis from GlobalSettings
  let fileUpAxis = 1; // Default Y-up
  const globalSettings = fbxTree.GlobalSettings as FBXNode | undefined;
  if (globalSettings?.Properties70) {
    const props = globalSettings.Properties70 as Record<string, unknown>;
    if (props.UpAxis !== undefined) fileUpAxis = props.UpAxis as number;
  }

  // Use selected axis
  const selectedAxis = upAxis;
  console.log(`FBX UpAxis - File: ${fileUpAxis}, Selected: ${selectedAxis} (${['X', 'Y', 'Z'][selectedAxis]})`);

  // Find Geometry nodes
  const objects = fbxTree.Objects as FBXNode | undefined;
  if (!objects?.Geometry) {
    console.warn('No geometries found in FBXTree');
    return result;
  }

  const geometries = objects.Geometry as Record<string, FBXNode>;
  console.log('Found geometries:', Object.keys(geometries).length);

  // Process all geometries
  for (const geoId in geometries) {
    const geo = geometries[geoId];
    if (!geo || typeof geo !== 'object') continue;

    // Find Vertices - handle both direct array and object with .a property
    let verticesRaw: number[] | null = null;
    const vertices = geo.Vertices;
    if (vertices) {
      if (Array.isArray(vertices)) {
        verticesRaw = vertices;
      } else if (vertices && typeof vertices === 'object' && 'a' in vertices) {
        verticesRaw = (vertices as { a: number[] }).a;
      }
    }

    // Find PolygonVertexIndex
    let indices: number[] | null = null;
    const polyIndex = geo.PolygonVertexIndex;
    if (polyIndex) {
      if (Array.isArray(polyIndex)) {
        indices = polyIndex;
      } else if (polyIndex && typeof polyIndex === 'object' && 'a' in polyIndex) {
        indices = (polyIndex as { a: number[] }).a;
      }
    }

    console.log(`Geometry ${geoId}: vertices=${verticesRaw?.length || 0}, indices=${indices?.length || 0}`);

    if (!verticesRaw || !indices || verticesRaw.length === 0 || indices.length === 0) continue;

    // Convert vertices with axis transformation
    const startVertexIndex = result.vertices.length;

    for (let i = 0; i < verticesRaw.length; i += 3) {
      const x = verticesRaw[i];
      const y = verticesRaw[i + 1];
      const z = verticesRaw[i + 2];

      let finalX: number, finalY: number, finalZ: number;

      if (selectedAxis === 0) {
        // X-up: rotate so X is vertical
        finalX = y;
        finalY = x;
        finalZ = z;
      } else if (selectedAxis === 2) {
        // Z-up: rotate so Z is vertical
        finalX = x;
        finalY = z;
        finalZ = -y;
      } else {
        // Y-up (default): no transformation
        finalX = x;
        finalY = y;
        finalZ = z;
      }

      result.vertices.push(new THREE.Vector3(finalX, finalY, finalZ));
    }

    // Parse PolygonVertexIndex with offset
    let currentFace: number[] = [];

    for (let i = 0; i < indices.length; i++) {
      let idx = indices[i];

      if (idx < 0) {
        idx = ~idx;
        currentFace.push(idx + startVertexIndex);

        if (currentFace.length === 3) result.stats.tris++;
        else if (currentFace.length === 4) result.stats.quads++;
        else if (currentFace.length >= 5) result.stats.ngons++;

        result.faces.push([...currentFace]);
        currentFace = [];
      } else {
        currentFace.push(idx + startVertexIndex);
      }
    }
  }

  // Count edges
  result.stats.edges = countEdges(result.faces);

  console.log('FBX Topology extracted:', result.stats, 'vertices:', result.vertices.length);
  return result;
}

// Detect up axis from FBX binary data
export function detectUpAxisFromFBX(buffer: ArrayBuffer): UpAxisIndex | null {
  try {
    const parser = new BinaryParser();
    const fbxTree = parser.parse(buffer);
    
    const globalSettings = fbxTree.GlobalSettings as FBXNode | undefined;
    if (globalSettings?.Properties70) {
      const props = globalSettings.Properties70 as Record<string, unknown>;
      if (props.UpAxis !== undefined) {
        return props.UpAxis as UpAxisIndex;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

// Parse FBX binary for topology
export function parseFBXTopology(buffer: ArrayBuffer, upAxis: UpAxisIndex): TopologyData | null {
  try {
    const parser = new BinaryParser();
    const fbxTree = parser.parse(buffer);
    return extractTopologyFromFBXTree(fbxTree, upAxis);
  } catch (error) {
    console.warn('Failed to parse FBX topology:', error);
    return null;
  }
}

// Count unique edges from faces
function countEdges(faces: number[][]): number {
  const edgeSet = new Set<string>();
  
  for (const face of faces) {
    for (let i = 0; i < face.length; i++) {
      const a = face[i];
      const b = face[(i + 1) % face.length];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      edgeSet.add(key);
    }
  }
  
  return edgeSet.size;
}
