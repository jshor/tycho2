import React from 'react';
import PropTypes from 'prop-types';
import Body from '../Body';

export default class Orbital extends React.Component {

  static propTypes = {
    updatePosition: PropTypes.func.isRequired,
    eclipticGroupRotation: PropTypes.object.isRequired,
    orbitalGroupRotation: PropTypes.object.isRequired,
    pathVertices: PropTypes.array.isRequired,
    bodyPosition: PropTypes.object.isRequired,
    bodyRotation: PropTypes.object.isRequired,
    bodyRadius: PropTypes.number.isRequired,
    pathOpacity: PropTypes.number,
    id: PropTypes.string.isRequired
  }

  onAnimationFrame = () => {
    this.props.updatePosition(this.refs.body);
  }

  render() {
    return (
      <group rotation={this.props.eclipticGroupRotation}>
        <group
          rotation={this.props.orbitalGroupRotation}
          position={this.props.bodyPosition}>
          <Body
            rotation={this.props.bodyRotation}
            radius={this.props.bodyRadius}
            ref="body"
          />
          {this.props.children}
        </group>
        <line>
          <lineBasicMaterial
            color={this.props.atmosphereColor}
            opacity={this.props.pathOpacity}
          />
          <geometry
            vertices={this.props.pathVertices}
          />
        </line>
      </group>
    );
  }
}