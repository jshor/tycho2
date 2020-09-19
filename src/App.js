import React, { useRef, createRef, useImperativeHandle } from 'react'
import { Vector3 } from 'three'
import { Canvas, extend, useFrame, useThree } from 'react-three-fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import CameraControls from './CameraControls'
import './App.css'

extend({ OrbitControls })

const initPosition = 50

const TRANSITION_TIME = 3000

const state = {
  previousCameraFocus: 'sun',
  currentCameraFocus: 'sun'
}

function getTime () {
  return (new Date()).getTime()
}

function getWorldPosition (obj) {
  const vector = new Vector3()

  vector.setFromMatrixPosition(obj.matrixWorld)

  return vector
}

function getPosition (radius, percentComplete) {
  const rad = (percentComplete * 360) * (Math.PI / 180)

  return new Vector3(
    radius * Math.sin(rad),
    0,
    radius * Math.cos(rad)
  )
}

function Orbital (props) {
  const orbital = createRef()
  const { radius, duration } = props

  let currentTime = getTime()
  let endTime = currentTime + duration
  let percent = 0

  useFrame(() => {
    currentTime = getTime()
    percent = (endTime - currentTime) / duration

    const position = getPosition(radius, percent)
    const controls = props.controls.current

    if (percent <= 0) {
      percent = 0
      endTime = currentTime + duration
    }

    if (controls.isFocusedOnOrbital(props.id)) {
      controls.updatePosition(position)
    }

    orbital.current.position.x = position.x
    orbital.current.position.z = position.z
  })

  const onClick = () => {
    const endTimeOfTransition = currentTime + TRANSITION_TIME
    const controls = props.controls.current

    let percentAtEndOfTransition = ((endTime - endTimeOfTransition) / duration) % 1

    if (percentAtEndOfTransition < 0) {
      percentAtEndOfTransition += 1
    }

    const position = getPosition(radius, percentAtEndOfTransition)

    controls.setFocus(position, props.id)
  }

  return (
    <group onClick={onClick} ref={orbital}>
      <mesh>
        <sphereGeometry attach="geometry" args={[2, 32, 32]} />
        <meshNormalMaterial attach="material" />
      </mesh>
      {props.children}
    </group>
  )
}

function Controls() {
  const controls = useRef()
  const { camera, gl } = useThree()

  useFrame(() => controls.current.update())

  return (
    <group>
      <orbitControls ref={controls} args={[camera, gl.domElement]} enableDamping dampingFactor={0.1} rotateSpeed={0.5} />
    </group>
  )
}

export default function App () {
  const controls = createRef()

  return (
    <Canvas style={{ background: '#272730' }} camera={{

      position: new Vector3(initPosition, initPosition, initPosition)
    }}>
      <gridHelper args={[100, 5]} />
      <mesh>
        <sphereGeometry attach="geometry" args={[2, 32, 32]} />
        <meshBasicMaterial attach="material" color={0xFFFEEE} />
      </mesh>
      <CameraControls ref={controls} />
      <Orbital controls={controls} duration={30000} radius={30} id="earth">
        {/* <Orbital controls={controls} duration={6000} radius={20} id="moon" /> */}
      </Orbital>
      <Orbital controls={controls} duration={40000} radius={80} id="venus" />

      <Controls />
    </Canvas>
  )
}
