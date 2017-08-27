import React from 'react';
import PropTypes from 'prop-types';

class Label extends React.Component {

  static propTypes = {
    position: PropTypes.object,
    orbital: PropTypes.object.isRequired
  }

  getPosition = (pos) => {
    if (pos) {
      return {
        position: 'absolute',
        top: `${pos.top}px`,
        left: `${pos.left}px`
      };
    }
    return null;
  }
  
  render() {
    return (
      <span style={this.getPosition(this.props.position)}>
        {this.props.orbital.name}
      </span>
    );
  }
}

export default Label;
