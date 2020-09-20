import React, { useRef, useMemo, useCallback, useEffect, createRef, useImperativeHandle } from 'react'
import { Euler, Vector3, EllipseCurve, Path } from 'three'
import { Canvas, useFrame, useThree } from 'react-three-fiber'
import CameraControls from './CameraControls'
import { TRANSITION_TIME } from './constants'
import './App.css'
import { getFocus } from './math/geometry'

const initPosition = 50

function getPosition (percentComplete, path) {
  // const rad = (percentComplete * 360) * (Math.PI / 180)
  const { x, y } = path.getPoint(percentComplete)

  return new Vector3(x, y, 0)
}


function Ellipse (props) {
  const update = useCallback(self => {
    self.setFromPoints(props.geometry.getPoints(50))
  }, [])

  return (
    <line>
      <bufferGeometry attach="geometry" onUpdate={update} />
      <lineBasicMaterial attach="material" color="hotpink" />
    </line>
  )
}


function Orbital (props) {
  const orbital = createRef()
  const cameraMarker = createRef() // marks the future camera position when focus changes
  const { radius, duration, semimajor, semiminor } = props

  let currentTime = Date.now()
  let endTime = currentTime + duration
  let percent = 0

  const focus = getFocus(semimajor, semiminor)
  const ellipse = useMemo(() => new EllipseCurve(
    0,  focus,            // ax, aY
    semimajor, semiminor,
    0,  2 * Math.PI,  // aStartAngle, aEndAngle
    false,            // aClockwise
    0                 // aRotation
  ), [])
  const path = new Path(ellipse.getPoints(50))


  useFrame(() => {
    currentTime = Date.now()
    percent = (endTime - currentTime) / duration

    const position = getPosition(percent, path)
    const controls = props.controls.current

    if (percent <= 0) {
      percent = 0
      endTime = currentTime + duration
    }

    orbital.current.position.copy(position)

    if (controls.isFocusedOnOrbital(props.id)) {
      controls.updatePosition(orbital.current.getWorldPosition())
    }
  })

  const onClick = () => {
    const endTimeOfTransition = currentTime + TRANSITION_TIME
    const controls = props.controls.current

    let percentAtEndOfTransition = ((endTime - endTimeOfTransition) / duration) % 1

    if (percentAtEndOfTransition < 0) {
      percentAtEndOfTransition += 1
    }

    const position = getPosition(percentAtEndOfTransition, ellipse)

    cameraMarker.current.position.copy(position)
    controls.setFocus(cameraMarker.current.getWorldPosition(), props.id, props.radius)
  }

  const rotation = new Euler( 1, 0, 0, 'XYZ' ) // barycentric rotation (relative to ecliptic plane)

  return (
    <group rotation={rotation}>
      <Ellipse geometry={ellipse} />

      <group ref={cameraMarker} />
      <group onClick={onClick} ref={orbital}>
        {/* <axesHelper args={[100]} /> */}
        <mesh>
          <sphereGeometry attach="geometry" args={[props.radius, 32, 32]} />
          <meshNormalMaterial attach="material" />
        </mesh>
        {props.children}
      </group>
    </group>
  )
}

export default function App () {
  const controls = createRef()

  return (
    <Canvas style={{ background: '#272730' }} camera={{

      position: new Vector3(initPosition, initPosition, initPosition)
    }} gl={{ logarithmicDepthBuffer: true }}>
      <gridHelper args={[100, 5]} />
      <mesh>
        <sphereGeometry attach="geometry" args={[2, 32, 32]} />
        <meshBasicMaterial attach="material" color={0xFFFEEE} />
      </mesh>
      <CameraControls ref={controls} />

      <Orbital controls={controls} duration={30000} radius={30} radius={2} semimajor={11} semiminor={10} id="earth">
        {/* <Orbital controls={controls} duration={6000} radius={20} radius={2} id="moon" /> */}
      </Orbital>
      <Orbital controls={controls} duration={4000} radius={80} radius={3} semimajor={25} semiminor={23} id="venus" />
      {/* <Controls /> */}
    </Canvas>
  )
}
