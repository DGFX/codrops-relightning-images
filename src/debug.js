import { Inspector } from 'three/addons/inspector/Inspector.js'
import { int, output, select, uniform, vec3, vec4 } from 'three/tsl'

export const inspector = new Inspector()
export const gui = inspector.createParameters('Light plane')

const uDebugView = uniform(0, 'int')

const DEBUG_VIEWS = [
  { label: 'depth', node: (_material, depth) => vec3(depth) },
  {
    label: 'normal',
    node: (material) => material.normalNode.mul(0.5).add(0.5),
  },
  { label: 'diffuse', node: (material) => material.colorNode },
  { label: 'shadow', node: (material) => vec3(material.aoNode) },
]

export function setDebugView(material, depth) {
  material.outputNode = vec4(
    DEBUG_VIEWS.reduceRight(
      (fallback, { node }, index) =>
        select(
          uDebugView.equal(int(index + 1)),
          node(material, depth),
          fallback,
        ),
      output.rgb,
    ),
    output.a,
  )

  const debugView = gui.addFolder('Debug View').close()
  debugView
    .add(
      uDebugView,
      'value',
      Object.fromEntries([
        ['final', 0],
        ...DEBUG_VIEWS.map(({ label }, index) => [label, index + 1]),
      ]),
    )
    .name('output')
}
