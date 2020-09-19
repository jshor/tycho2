import React, { useRef, useImperativeHandle, forwardRef } from 'react'
import { Vector3 } from 'three'
import { useFrame, useThree } from 'react-three-fiber'

const easeOutQuad = t => t * (2 - t)

const TRANSITION_TIME = 3000

function CameraControls (props, ref) {
  const group = useRef()
  const { camera } = useThree()

  let startPosition
  let endPosition // normalized (w.r.t <0>)
  let startTime = 0
  let endTime = 0
  let orbitalId
  let maxDistance

  const setFocus = (_endPosition, _orbitalId, _maxDistance) => {
    if (orbitalId === _orbitalId) return

    startPosition = group.current.position.clone()
    endPosition = _endPosition
      .clone()
      .sub(startPosition)

    startTime = (new Date()).getTime()
    endTime = startTime + TRANSITION_TIME
    orbitalId = _orbitalId
    // maxDistance = _maxDistance.clone()
  }

  const isFocusedOnOrbital = (_orbitalId) => {
    return orbitalId === _orbitalId && !endPosition
  }

  const updatePosition = (position) => {
    group.current.position.copy(position)
  }

  const moveTowardDestination = () => {
    const duration = endTime - startTime
    const elapsed = ((new Date()).getTime() - startTime) / duration
    const scalar = easeOutQuad(elapsed)

    if (elapsed < 1) {
      const nextPosition = endPosition
        .clone()
        .multiplyScalar(scalar)
        .add(startPosition)

      group.current.position.copy(nextPosition)
    } else {
      startPosition = null
      endPosition = null
      startTime = 0
      endTime = 0
    }
  }

  useFrame(() => {
    if (endPosition) {
      moveTowardDestination()
    }
  })

  useImperativeHandle(ref, () => ({
    setFocus,
    isFocusedOnOrbital,
    updatePosition
  }))

  return (
    <group ref={group}>
      <mesh>
        <boxGeometry attach="geometry" args={[1, 1, 1]} />
        <meshNormalMaterial attach="material" />
      </mesh>
    </group>
  )
}

export default forwardRef(CameraControls)
