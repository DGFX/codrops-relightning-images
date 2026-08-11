import {
  cameraFar,
  cameraNear,
  positionView,
  viewZToOrthographicDepth,
} from 'three/tsl'
import { Mesh, MeshPhongNodeMaterial, PlaneGeometry } from 'three/webgpu'
import { setDebugView } from '../debug.js'
import { diffuseNode } from './nodes/diffuse.js'
import { normalNode, uDisplacementScale } from './nodes/normal.js'
import { shadowNode } from './nodes/shadow.js'
import { coverUv } from './nodes/texture-fit.js'
import { depthNode } from './textures.js'

export function createPlane() {
  const vUv = coverUv()
  const depth = depthNode.sample(vUv).r

  const material = new MeshPhongNodeMaterial({ specular: 0x000000 })
  material.colorNode = diffuseNode(vUv, depth)
  material.normalNode = normalNode(vUv)
  material.aoNode = shadowNode(vUv, depth)
  material.depthNode = viewZToOrthographicDepth(
    positionView.z.add(depth.sub(1).mul(uDisplacementScale)),
    cameraNear,
    cameraFar,
  )

  setDebugView(material, depth)

  return new Mesh(new PlaneGeometry(1, 1), material)
}
