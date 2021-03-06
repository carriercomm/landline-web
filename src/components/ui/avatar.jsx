'use strict';

const React = require('react/addons');

const Avatar = React.createClass({
  propTypes: {
    url: React.PropTypes.string.isRequired
  },

  render() {
    let style = {
      avatar: {
        borderRadius: '50%',
        maxHeight: 24,
        maxWidth: 24
      }
    };

    return <img src={this.props.url} width={24} style={style.avatar} />;
  }
});

module.exports = Avatar;
