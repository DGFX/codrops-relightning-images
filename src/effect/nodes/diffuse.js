import { Fn, step, uniform } from 'three/tsl'
import { depthFolder } from '../depth-map.js'
import { mapNode } from '../textures.js'

const uDepthThreshold = uniform(0)

export const diffuseNode = Fn(([vUv, depth]) =>
  mapNode.sample(vUv).rgb.mul(step(uDepthThreshold, depth)),
)

depthFolder.add(uDepthThreshold, 'value', 0, 1, 0.01).name('depth threshold')
