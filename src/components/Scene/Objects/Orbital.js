import React from 'react';
import ReactAnimationFrame from 'react-animation-frame';
import PropTypes from 'prop-types';
import Mesh from '../Utils/Mesh';

class Orbital extends React.Component {

  static propTypes = {
    updateScreenPosition: PropTypes.func.isRequired,
    eclipticGroupRotation: PropTypes.object.isRequired,
    orbitalGroupRotation: PropTypes.object.isRequired,
    pathVertices: PropTypes.array.isRequired,
    bodyPosition: PropTypes.object.isRequired,
    bodyRotation: PropTypes.object.isRequired,
    bodyRadius: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired
  }

  onAnimationFrame = () => {
    this.props.updateScreenPosition(this.refs.mesh);
  }

  render() {
    return (
      <group rotation={this.props.eclipticGroupRotation}>
        <group rotation={this.props.orbitalGroupRotation} position={this.props.bodyPosition}>
          <Mesh
            rotation={this.props.bodyRotation}
            radius={this.props.bodyRadius}
            ref="mesh"
          />
          {this.props.children}
        </group>
        <line>
          <lineBasicMaterial color={0x0000ff} />
          <geometry vertices={this.props.pathVertices} />
        </line>
      </group>
    );
  }
}

export default ReactAnimationFrame(Orbital);
