import React, { useRef, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react'
import { Vector3, Box3 } from 'three'
import { extend, useFrame, useThree } from 'react-three-fiber'
import { TRANSITION_TIME } from './constants'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// import { FlyControls } from 'drei'

const easeOutQuad = t => t * (2 - t)

const IDEAL_DISTANCE_FACTOR = 2





function SpaceshipControlsImpl (props, ref) {
  const { gl } = useThree()
  const domElement = document.createElement('div')
  const controls = useMemo(() => new FirstPersonControls(props.camera, domElement), [props.camera, domElement])
  // const ref = useRef()
  // const controls = useRef()

  useFrame((_, delta) => {
    controls.update(delta)
  })

  useEffect(() => {
    controls.movementSpeed = 10
    controls.lookSpeed = 0.01
    controls.heightSpeed = true
    controls.lookAt(new Vector3(0, 0, 0))
    // controls.rollSpeed = Math.PI / 24
    controls.constrainVertical = true
    controls.domElement = gl.domElement
    controls.handleResize()
    gl.domElement.addEventListener( 'mousemove', controls.onMouseMove.bind(controls), false );
  })

  return (
    <primitive dispose={null} object={controls} ref={ref} {...props} />
  )
}

const SpaceshipControls = forwardRef(SpaceshipControlsImpl)







function CameraControls (props, ref) {
  const group = useRef()
  const controls = useRef()
  const { camera, gl } = useThree()
  const fakeCamera = camera.clone()

  let startPosition
  let endPosition // normalized (w.r.t <0>)
  let startTime = 0
  let endTime = 0
  let orbitalRadius = 0
  let orbitalId
  let zoomVector

  const setFocus = (_endPosition, _orbitalId, _orbitalRadius) => {
    if (orbitalId === _orbitalId) return // don't re-animate already-focused orbital

    // set the start and end vectors for the camera's centroid and zoom
    startPosition = group.current.position.clone()
    endPosition = _endPosition
      .clone()
      .sub(startPosition)
    zoomVector = camera.position.clone()

    // set the animation start time and deadline
    startTime = Date.now()
    endTime = startTime + TRANSITION_TIME
    orbitalId = _orbitalId
    orbitalRadius = _orbitalRadius

    // set the min zoom distance to the orbital radius (to avoid camera-orbital collision)
    controls.current.minDistance = orbitalRadius
  }

  const isFocusedOnOrbital = (_orbitalId) => {
    return orbitalId === _orbitalId && !endPosition
  }

  const updatePosition = (position) => {
    console.log('update to: ', position)
    group.current.position.copy(position)
  }

  const moveTowardDestination = () => {
    const duration = endTime - startTime
    const elapsed = (Date.now() - startTime) / duration
    const scalar = easeOutQuad(elapsed)

    if (elapsed < 1) {
      // move the dolly to the next animated position
      const nextPosition = endPosition
        .clone()
        .multiplyScalar(scalar)
        .add(startPosition)

      group.current.position.copy(nextPosition)

      // zoom in/out closer to the destination zoom level
      const nextZoomVector = zoomVector
        .clone()
        .multiplyScalar(1 - scalar)

      if (nextZoomVector.length() > controls.current.minDistance * IDEAL_DISTANCE_FACTOR) {
        // zoom in only if the magnitude doesn't exceed the ideal viewing distance
        fakeCamera.position.copy(nextZoomVector)
      }
    } else {
      zoomVector = null
      startPosition = null
      endPosition = null
      startTime = 0
      endTime = 0
    }
  }

  const getZoom = () => {
    const { minDistance, maxDistance } = controls.current
    const currDistance = camera.position.length()
    const percent = (currDistance - minDistance) / (maxDistance - minDistance)
    // var factor = zoomDistance / currDistance

    // console.log('currDist: ', currDistance, percent, maxDistance)
  }

  const { clock } = useThree()

  useFrame(() => {
    if (endPosition) {
      moveTowardDestination()
    }
    // getZoom()
    camera.copy(fakeCamera)
    // controls.current.update()
  })

  useImperativeHandle(ref, () => ({
    setFocus,
    isFocusedOnOrbital,
    updatePosition
  }))

  useEffect(() => {
    group.current.add(camera)
  })

  return (
    <group ref={group}>
      <mesh>
        <boxGeometry attach="geometry" args={[1, 1, 1]} />
        <meshNormalMaterial attach="material" />
      </mesh>
      <SpaceshipControls ref={controls} camera={fakeCamera} />
    </group>
  )
}

export default forwardRef(CameraControls)
