import { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { 
  ModelStats, 
  TopologyStats, 
  TopologyData, 
  ToggleStates, 
  LightingSettings,
  UpAxis,
  UpAxisIndex,
  AnimationState 
} from '@/types/viewer';
import { parseFBXTopology, detectUpAxisFromFBX } from '@/utils/fbxParser';
import { extractTopologyFromOBJ } from '@/utils/objParser';

interface UseModelLoaderOptions {
  onModelStatsUpdate: (stats: ModelStats) => void;
  onTopologyStatsUpdate: (stats: TopologyStats) => void;
  onStatusChange: (message: string, type: 'info' | 'loading' | 'error' | 'success') => void;
  onDetectedAxisChange: (axis: UpAxis | null) => void;
  onAnimationsLoaded: (state: Partial<AnimationState>) => void;
}

interface SceneRefs {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  controls: OrbitControls | null;
  currentModel: THREE.Object3D | null;
  surfaceGroup: THREE.Group | null;
  materialsGroup: THREE.Group | null;
  wireframeGroup: THREE.Group | null;
  topologyGroup: THREE.Group | null;
  edgesGroup: THREE.Group | null;
  bboxHelper: THREE.Box3Helper | null;
  lightPivot: THREE.Group | null;
  mixer: THREE.AnimationMixer | null;
  clock: THREE.Clock;
  uploadedFiles: Map<string, File | string>;
  lastLoadedFile: File | null;
  topologyData: TopologyData | null;
}

export function useModelLoader(options: UseModelLoaderOptions) {
  const { 
    onModelStatsUpdate, 
    onTopologyStatsUpdate, 
    onStatusChange, 
    onDetectedAxisChange,
    onAnimationsLoaded 
  } = options;

  const refs = useRef<SceneRefs>({
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    currentModel: null,
    surfaceGroup: null,
    materialsGroup: null,
    wireframeGroup: null,
    topologyGroup: null,
    edgesGroup: null,
    bboxHelper: null,
    lightPivot: null,
    mixer: null,
    clock: new THREE.Clock(),
    uploadedFiles: new Map(),
    lastLoadedFile: null,
    topologyData: null,
  });

  const animationFrameRef = useRef<number>(0);

  // Initialize scene
  const initScene = useCallback((container: HTMLDivElement) => {
    const { current: r } = refs;

    r.scene = new THREE.Scene();
    r.scene.background = new THREE.Color(0x1a1a2e);

    r.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.001,
      100000
    );
    r.camera.position.set(5, 5, 5);

    r.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      preserveDrawingBuffer: true // For screenshots
    });
    r.renderer.setSize(window.innerWidth, window.innerHeight);
    r.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.renderer.shadowMap.enabled = true;
    r.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    r.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    r.renderer.toneMappingExposure = 1.0;
    container.appendChild(r.renderer.domElement);

    r.controls = new OrbitControls(r.camera, r.renderer.domElement);
    r.controls.enableDamping = true;
    r.controls.dampingFactor = 0.05;
    r.controls.minDistance = 0.5;
    r.controls.maxDistance = 100;
    r.controls.screenSpacePanning = true;

    // Setup lighting
    setupLighting(r);

    // Setup environment
    setupEnvironment(r);

    // Grid helper
    const grid = new THREE.GridHelper(20, 40, 0x444466, 0x333355);
    (grid.material as THREE.Material).opacity = 0.5;
    (grid.material as THREE.Material).transparent = true;
    r.scene.add(grid);

    // Initialize groups
    r.surfaceGroup = new THREE.Group();
    r.materialsGroup = new THREE.Group();
    r.wireframeGroup = new THREE.Group();
    r.topologyGroup = new THREE.Group();
    r.edgesGroup = new THREE.Group();
    r.scene.add(r.surfaceGroup, r.materialsGroup, r.wireframeGroup, r.topologyGroup, r.edgesGroup);

    // Start animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      const delta = r.clock.getDelta();
      if (r.mixer) {
        r.mixer.update(delta);
      }
      
      r.controls?.update();
      if (r.renderer && r.scene && r.camera) {
        r.renderer.render(r.scene, r.camera);
      }
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (r.camera && r.renderer) {
        r.camera.aspect = window.innerWidth / window.innerHeight;
        r.camera.updateProjectionMatrix();
        r.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
      r.renderer?.dispose();
    };
  }, []);

  // Setup lighting
  const setupLighting = (r: SceneRefs) => {
    if (!r.scene) return;

    r.lightPivot = new THREE.Group();
    r.scene.add(r.lightPivot);

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.5);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    keyLight.shadow.bias = -0.0001;
    r.lightPivot.add(keyLight);

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0xe6f0ff, 0.6);
    fillLight.position.set(-5, 3, -2);
    r.lightPivot.add(fillLight);

    // Rim Light
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(0, 5, -8);
    r.lightPivot.add(rimLight);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404050, 0.6);
    r.scene.add(ambientLight);

    // Hemisphere light
    const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 0.8);
    r.scene.add(hemiLight);
  };

  // Setup environment
  const setupEnvironment = (r: SceneRefs) => {
    if (!r.scene || !r.renderer) return;

    const pmremGenerator = new THREE.PMREMGenerator(r.renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    const envGeo = new THREE.SphereGeometry(100, 32, 32);
    const envMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color(0x4488ff) },
        bottomColor: { value: new THREE.Color(0x88ccff) }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(h, 0.0)), 1.0);
        }
      `
    });
    const envMesh = new THREE.Mesh(envGeo, envMat);
    envScene.add(envMesh);

    const light1 = new THREE.PointLight(0xffffff, 1000);
    light1.position.set(10, 20, 15);
    envScene.add(light1);

    const light2 = new THREE.PointLight(0xffffff, 800);
    light2.position.set(-15, 10, -10);
    envScene.add(light2);

    const light3 = new THREE.PointLight(0xffffff, 600);
    light3.position.set(0, -10, 20);
    envScene.add(light3);

    const light4 = new THREE.PointLight(0xffffee, 800);
    light4.position.set(5, 30, 5);
    envScene.add(light4);

    const envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
    r.scene.environment = envMap;

    pmremGenerator.dispose();
  };

  // Clear scene
  const clearScene = useCallback(() => {
    const { current: r } = refs;

    [r.surfaceGroup, r.materialsGroup, r.wireframeGroup, r.topologyGroup, r.edgesGroup].forEach(group => {
      if (group) {
        while (group.children.length > 0) {
          const child = group.children[0];
          group.remove(child);
          if ((child as THREE.Mesh).geometry) {
            (child as THREE.Mesh).geometry.dispose();
          }
        }
      }
    });

    if (r.bboxHelper && r.scene) {
      r.scene.remove(r.bboxHelper);
      r.bboxHelper = null;
    }

    if (r.mixer) {
      r.mixer.stopAllAction();
      r.mixer = null;
    }

    r.currentModel = null;
    r.topologyData = null;
  }, []);

  // Find texture blob
  const findTextureBlob = useCallback((textureName: string): string | null => {
    const { current: r } = refs;
    const name = textureName.split(/[\/\\]/).pop()?.toLowerCase() || '';

    for (const [key, value] of r.uploadedFiles) {
      if (key.startsWith('blob:') && key.includes(name)) {
        return value as string;
      }
    }
    return null;
  }, []);

  // Remove lights from model
  const removeLightsFromModel = useCallback((model: THREE.Object3D) => {
    const lightsToRemove: THREE.Light[] = [];

    model.traverse((child) => {
      if ((child as THREE.Light).isLight) {
        lightsToRemove.push(child as THREE.Light);
      }
    });

    lightsToRemove.forEach((light) => {
      if (light.parent) {
        light.parent.remove(light);
      }
    });
  }, []);

  // Process loaded model
  const processLoadedModel = useCallback((
    model: THREE.Object3D, 
    topologyData: TopologyData | null,
    selectedAxis: UpAxisIndex,
    animations?: THREE.AnimationClip[]
  ) => {
    const { current: r } = refs;
    if (!r.scene || !r.camera || !r.controls) return;

    clearScene();
    r.currentModel = model;
    r.topologyData = topologyData;

    // Apply axis transformation
    if (selectedAxis === 0) {
      model.rotation.z = Math.PI / 2;
    } else if (selectedAxis === 2) {
      model.rotation.x = -Math.PI / 2;
    }

    let totalVertices = 0;
    let totalTriangles = 0;
    let objectCount = 0;
    const materials = new Set<string>();
    const textures = new Set<string>();

    // Process meshes
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        objectCount++;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const geometry = mesh.geometry;

        if (geometry.attributes.position) {
          totalVertices += geometry.attributes.position.count;
        }
        if (geometry.index) {
          totalTriangles += geometry.index.count / 3;
        } else if (geometry.attributes.position) {
          totalTriangles += geometry.attributes.position.count / 3;
        }

        // Fix materials
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach(mat => {
          if (mat) {
            materials.add(mat.uuid);
            const stdMat = mat as THREE.MeshStandardMaterial;
            if (stdMat.map) textures.add(stdMat.map.uuid);
            if (stdMat.normalMap) textures.add(stdMat.normalMap.uuid);
            if (stdMat.roughnessMap) textures.add(stdMat.roughnessMap.uuid);
            if (stdMat.metalnessMap) textures.add(stdMat.metalnessMap.uuid);

            if (stdMat.isMeshStandardMaterial || (mat as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial) {
              stdMat.envMap = r.scene!.environment;
              stdMat.envMapIntensity = 2.0;
              stdMat.needsUpdate = true;

              if (!stdMat.metalnessMap && stdMat.metalness > 0.5) {
                stdMat.metalness = 0.2;
              }
              if (!stdMat.roughnessMap && stdMat.roughness < 0.3) {
                stdMat.roughness = 0.5;
              }
              if (stdMat.color && !stdMat.map) {
                const brightness = (stdMat.color.r + stdMat.color.g + stdMat.color.b) / 3;
                if (brightness < 0.1) {
                  stdMat.color.setHex(0x808080);
                }
              }
            }

            mat.side = THREE.DoubleSide;
          }
        });

        // Create wireframe
        const wireframeGeo = new THREE.WireframeGeometry(geometry);
        const wireframeMat = new THREE.LineBasicMaterial({
          color: 0x00ff00,
          opacity: 0.5,
          transparent: true
        });
        const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
        mesh.getWorldPosition(wireframe.position);
        mesh.getWorldQuaternion(wireframe.quaternion);
        mesh.getWorldScale(wireframe.scale);
        r.wireframeGroup?.add(wireframe);

        // Create edge geometry
        const edgesGeo = new THREE.EdgesGeometry(geometry, 15);
        const edgesMat = new THREE.LineBasicMaterial({ color: 0x00ff88 });
        const edges = new THREE.LineSegments(edgesGeo, edgesMat);
        mesh.getWorldPosition(edges.position);
        mesh.getWorldQuaternion(edges.quaternion);
        mesh.getWorldScale(edges.scale);
        r.edgesGroup?.add(edges);
      }
    });

    // Add model to materials group
    r.materialsGroup?.add(model);

    // Create surface model with white material
    const surfaceModel = model.clone();
    surfaceModel.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const whiteMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.5,
          metalness: 0.1,
          side: THREE.DoubleSide,
          envMap: r.scene!.environment,
          envMapIntensity: 1.0
        });
        mesh.material = whiteMat;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    if (selectedAxis === 0) {
      surfaceModel.rotation.z = Math.PI / 2;
    } else if (selectedAxis === 2) {
      surfaceModel.rotation.x = -Math.PI / 2;
    }

    r.surfaceGroup?.add(surfaceModel);

    // Create topology visualization
    if (topologyData && topologyData.faces.length > 0) {
      createTopologyVisualization(topologyData, model);
      onTopologyStatsUpdate(topologyData.stats);
    } else {
      onTopologyStatsUpdate({ quads: 0, tris: 0, ngons: 0, edges: 0 });
    }

    // Create bounding box
    const box = new THREE.Box3().setFromObject(model);
    r.bboxHelper = new THREE.Box3Helper(box, new THREE.Color(0xffff00));
    r.bboxHelper.visible = false;
    r.scene.add(r.bboxHelper);

    // Center and fit camera
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    r.camera.near = maxDim / 1000;
    r.camera.far = maxDim * 100;
    r.camera.updateProjectionMatrix();

    r.controls.minDistance = maxDim * 0.01;
    r.controls.maxDistance = maxDim * 20;

    r.camera.position.set(
      center.x + maxDim * 1.5,
      center.y + maxDim * 0.75,
      center.z + maxDim * 1.5
    );
    r.controls.target.copy(center);
    r.controls.update();

    // Update stats
    onModelStatsUpdate({
      vertices: totalVertices,
      triangles: totalTriangles,
      objects: objectCount,
      materials: materials.size,
      textures: textures.size
    });

    // Setup animations if present
    if (animations && animations.length > 0) {
      r.mixer = new THREE.AnimationMixer(model);
      onAnimationsLoaded({
        animations,
        duration: animations[0].duration,
        currentIndex: 0,
        isPlaying: false,
        currentTime: 0,
        speed: 1
      });
    } else {
      onAnimationsLoaded({ animations: [] });
    }

    // Apply initial visibility
    if (r.surfaceGroup) r.surfaceGroup.visible = true;
    if (r.materialsGroup) r.materialsGroup.visible = false;
    if (r.wireframeGroup) r.wireframeGroup.visible = false;
    if (r.topologyGroup) r.topologyGroup.visible = false;
    if (r.edgesGroup) r.edgesGroup.visible = false;
  }, [clearScene, onModelStatsUpdate, onTopologyStatsUpdate, onAnimationsLoaded]);

  // Create topology visualization
  const createTopologyVisualization = useCallback((topologyData: TopologyData, model: THREE.Object3D) => {
    const { current: r } = refs;
    if (!r.topologyGroup) return;

    const { vertices, faces } = topologyData;
    if (!vertices || vertices.length === 0 || !faces || faces.length === 0) return;

    let transformVertex: (v: THREE.Vector3) => THREE.Vector3;

    if (topologyData.needsNormalization) {
      const modelBox = new THREE.Box3().setFromObject(model);
      const modelCenter = modelBox.getCenter(new THREE.Vector3());
      const modelSize = modelBox.getSize(new THREE.Vector3());

      const topoBox = new THREE.Box3();
      for (const v of vertices) {
        topoBox.expandByPoint(v);
      }
      const topoCenter = topoBox.getCenter(new THREE.Vector3());
      const topoSize = topoBox.getSize(new THREE.Vector3());

      // Use UNIFORM scaling based on max dimension to preserve proportions
      const modelMaxDim = Math.max(modelSize.x, modelSize.y, modelSize.z);
      const topoMaxDim = Math.max(topoSize.x, topoSize.y, topoSize.z);
      const uniformScale = topoMaxDim > 0 ? modelMaxDim / topoMaxDim : 1;

      transformVertex = (v: THREE.Vector3) => {
        return new THREE.Vector3(
          (v.x - topoCenter.x) * uniformScale + modelCenter.x,
          (v.y - topoCenter.y) * uniformScale + modelCenter.y,
          (v.z - topoCenter.z) * uniformScale + modelCenter.z
        );
      };
    } else {
      transformVertex = (v: THREE.Vector3) => v.clone();
    }

    // Create edge lines
    const edgeSet = new Set<string>();
    const edgePositions: number[] = [];

    for (const face of faces) {
      for (let i = 0; i < face.length; i++) {
        const a = face[i];
        const b = face[(i + 1) % face.length];
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;

        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          if (vertices[a] && vertices[b]) {
            const va = transformVertex(vertices[a]);
            const vb = transformVertex(vertices[b]);
            edgePositions.push(va.x, va.y, va.z, vb.x, vb.y, vb.z);
          }
        }
      }
    }

    if (edgePositions.length > 0) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));

      const material = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        opacity: 0.8,
        transparent: true
      });

      const lineSegments = new THREE.LineSegments(geometry, material);
      r.topologyGroup.add(lineSegments);
    }
  }, []);

  // Load FBX file
  const loadFBX = useCallback(async (file: File, selectedAxis: UpAxisIndex) => {
    const { current: r } = refs;
    onStatusChange('Loading FBX...', 'loading');

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Check if binary FBX
      const header = new Uint8Array(arrayBuffer, 0, 20);
      const headerStr = String.fromCharCode(...header);
      const isBinary = headerStr.startsWith('Kaydara FBX Binary');

      let topologyData: TopologyData | null = null;
      let detectedAxis: UpAxisIndex | null = null;

      if (isBinary) {
        try {
          detectedAxis = detectUpAxisFromFBX(arrayBuffer);
          if (detectedAxis !== null) {
            onDetectedAxisChange(['X', 'Y', 'Z'][detectedAxis] as UpAxis);
          }
          topologyData = parseFBXTopology(arrayBuffer, selectedAxis);
        } catch (e) {
          console.warn('Topology not available:', e);
        }
      }

      // Load with Three.js FBXLoader
      const loader = new FBXLoader();
      const model = loader.parse(arrayBuffer, '');

      removeLightsFromModel(model);
      processLoadedModel(model, topologyData, selectedAxis, (model as THREE.Object3D & { animations?: THREE.AnimationClip[] }).animations);

      const topoMsg = topologyData ? ' (with topology)' : ' (without original topology)';
      onStatusChange('FBX loaded successfully' + topoMsg, 'success');

    } catch (error) {
      console.error('Error loading FBX:', error);
      onStatusChange('Error: ' + (error as Error).message, 'error');
    }
  }, [onStatusChange, onDetectedAxisChange, removeLightsFromModel, processLoadedModel]);

  // Load OBJ file
  const loadOBJ = useCallback(async (file: File, selectedAxis: UpAxisIndex) => {
    const { current: r } = refs;
    onStatusChange('Loading OBJ...', 'loading');

    try {
      const text = await file.text();
      const topologyData = extractTopologyFromOBJ(text);

      // Look for MTL file
      let mtlFile: File | null = null;
      for (const [name, f] of r.uploadedFiles) {
        if (name.endsWith('.mtl') && f instanceof File) {
          mtlFile = f;
          break;
        }
      }

      const objLoader = new OBJLoader();

      if (mtlFile) {
        const mtlText = await mtlFile.text();
        const mtlLoader = new MTLLoader();
        const materials = mtlLoader.parse(mtlText, '');

        // Load textures
        for (const matName in materials.materials) {
          const mat = materials.materials[matName] as THREE.MeshPhongMaterial;
          if (mat.map) {
            const texName = (mat.map as THREE.Texture & { name?: string; sourceFile?: string }).name || 
                           (mat.map as THREE.Texture & { sourceFile?: string }).sourceFile;
            if (texName) {
              const blobUrl = findTextureBlob(texName);
              if (blobUrl) {
                mat.map = new THREE.TextureLoader().load(blobUrl);
                mat.map.flipY = true;
              }
            }
          }
        }

        objLoader.setMaterials(materials);
      }

      const model = objLoader.parse(text);
      removeLightsFromModel(model);
      processLoadedModel(model, topologyData, selectedAxis);
      onStatusChange('OBJ loaded successfully', 'success');

    } catch (error) {
      console.error('Error loading OBJ:', error);
      onStatusChange('Error: ' + (error as Error).message, 'error');
    }
  }, [onStatusChange, findTextureBlob, removeLightsFromModel, processLoadedModel]);

  // Load GLTF/GLB file
  const loadGLTF = useCallback(async (file: File, selectedAxis: UpAxisIndex) => {
    onStatusChange('Loading GLTF...', 'loading');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loader = new GLTFLoader();

      loader.parse(arrayBuffer, '', (gltf) => {
        removeLightsFromModel(gltf.scene);
        processLoadedModel(gltf.scene, null, selectedAxis, gltf.animations);
        onStatusChange('GLTF loaded successfully', 'success');
      }, (error) => {
        onStatusChange('Error loading GLTF', 'error');
      });

    } catch (error) {
      onStatusChange('Error: ' + (error as Error).message, 'error');
    }
  }, [onStatusChange, removeLightsFromModel, processLoadedModel]);

  // Handle files
  const handleFiles = useCallback(async (files: FileList, selectedAxis: UpAxis, isAxisReload = false) => {
    const { current: r } = refs;
    const axisIndex = ['X', 'Y', 'Z'].indexOf(selectedAxis) as UpAxisIndex;

    if (!isAxisReload) {
      r.uploadedFiles.clear();
    }

    // Collect all files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      r.uploadedFiles.set(file.name.toLowerCase(), file);

      if (['png', 'jpg', 'jpeg', 'tga', 'bmp', 'gif'].includes(ext)) {
        const url = URL.createObjectURL(file);
        r.uploadedFiles.set(`blob:${file.name.toLowerCase()}`, url);
      }
    }

    // Find main model file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (ext === 'fbx') {
        r.lastLoadedFile = file;
        await loadFBX(file, axisIndex);
        return;
      } else if (ext === 'obj') {
        r.lastLoadedFile = file;
        await loadOBJ(file, axisIndex);
        return;
      } else if (ext === 'gltf' || ext === 'glb') {
        r.lastLoadedFile = file;
        await loadGLTF(file, axisIndex);
        return;
      }
    }

    onStatusChange('No valid model file found', 'error');
  }, [loadFBX, loadOBJ, loadGLTF, onStatusChange]);

  // Reload with new axis
  const reloadWithAxis = useCallback(async (axis: UpAxis) => {
    const { current: r } = refs;
    if (r.lastLoadedFile) {
      onStatusChange('Applying new orientation...', 'loading');
      const fakeFileList = { 0: r.lastLoadedFile, length: 1 } as unknown as FileList;
      await handleFiles(fakeFileList, axis, true);
    }
  }, [handleFiles, onStatusChange]);

  // Update toggle visibility
  const updateToggleVisibility = useCallback((toggleStates: ToggleStates) => {
    const { current: r } = refs;
    if (r.surfaceGroup) r.surfaceGroup.visible = toggleStates.surface;
    if (r.materialsGroup) r.materialsGroup.visible = toggleStates.materials;
    if (r.wireframeGroup) r.wireframeGroup.visible = toggleStates.wireframe;
    if (r.topologyGroup) r.topologyGroup.visible = toggleStates.topology;
    if (r.edgesGroup) r.edgesGroup.visible = toggleStates.edges;
    if (r.bboxHelper) r.bboxHelper.visible = toggleStates.bbox;
  }, []);

  // Update lighting
  const updateLighting = useCallback((settings: LightingSettings) => {
    const { current: r } = refs;
    if (r.lightPivot) {
      r.lightPivot.rotation.y = THREE.MathUtils.degToRad(settings.envRotation);
    }
    if (r.renderer) {
      r.renderer.toneMappingExposure = settings.exposure;
    }
  }, []);

  // Take screenshot
  const takeScreenshot = useCallback(() => {
    const { current: r } = refs;
    if (!r.renderer) return;

    // Force render
    if (r.scene && r.camera) {
      r.renderer.render(r.scene, r.camera);
    }

    const dataUrl = r.renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `model-screenshot-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }, []);

  // Animation controls
  const playAnimation = useCallback(() => {
    const { current: r } = refs;
    if (r.mixer) {
      r.mixer.timeScale = 1;
    }
  }, []);

  const pauseAnimation = useCallback(() => {
    const { current: r } = refs;
    if (r.mixer) {
      r.mixer.timeScale = 0;
    }
  }, []);

  const seekAnimation = useCallback((time: number) => {
    const { current: r } = refs;
    if (r.mixer) {
      r.mixer.setTime(time);
    }
  }, []);

  const setAnimationSpeed = useCallback((speed: number) => {
    const { current: r } = refs;
    if (r.mixer) {
      r.mixer.timeScale = speed;
    }
  }, []);

  const playAnimationClip = useCallback((index: number, animations: THREE.AnimationClip[]) => {
    const { current: r } = refs;
    if (r.mixer && animations[index]) {
      r.mixer.stopAllAction();
      const action = r.mixer.clipAction(animations[index]);
      action.play();
    }
  }, []);

  return {
    initScene,
    handleFiles,
    reloadWithAxis,
    updateToggleVisibility,
    updateLighting,
    takeScreenshot,
    playAnimation,
    pauseAnimation,
    seekAnimation,
    setAnimationSpeed,
    playAnimationClip,
  };
}
