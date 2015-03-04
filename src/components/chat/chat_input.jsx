'use strict';

const AppStore = require('../../stores/app_store');
const autosize = require('autosize/src/autosize');
const ChatActions = require('../../actions/chat_actions');
const CurrentChannelMixin = require('../../mixins/current_channel_mixin');
const CurrentUserStore = require('../../stores/current_user_store');
const { Map } = require('immutable');
const React = require('react/addons');
const Typeahead = require('../typeahead/typeahead.jsx');
const TypeaheadStore = require('../../stores/typeahead_store');

const ENTER_KEY = 13;
const USERNAME_REGEX = /(^|\s)@(\w+)$/;

const ChatInput = React.createClass({
  mixins: [CurrentChannelMixin],

  componentDidMount() {
    autosize(this.refs.textarea.getDOMNode());
    TypeaheadStore.addChangeListener(this.replaceQueryWithUsername);
  },

  componentWillUnmount() {
    TypeaheadStore.removeChangeListener(this.replaceQueryWithUsername);
  },

  getInitialState() {
    return {
      body: '',
      channel: CurrentChannelMixin.getChannel(),
      partialUsername: null,
      user: CurrentUserStore.getUser()
    };
  },

  handleChange(e) {
    let partialUsername = null;
    let matches = e.target.value.match(USERNAME_REGEX);

    if (matches) {
      partialUsername = matches.slice(-1)[0] || '';
    }

    this.setState({
      body: e.target.value,
      partialUsername: partialUsername
    });
  },

  render() {
    let {
      body,
      user
    } = this.state;

    let style = {
      div: {
        boxShadow: '-4px 0 15px rgba(0,0,0,.15)'
      },
      textarea: {
        lineHeight: '1.1rem',
        overflow: "hidden",
        resize: "none",
        wordWrap: "break-word"
      }
    };

    if (user.get('Username') || user.get('username')) {
      return (
        <div className="full-width shadow px3 py1" style={style.div}>
          <Typeahead partialUsername={this.state.partialUsername}>
            <textarea autofocus={true}
                className="full-width field-light mb0"
                style={style.textarea}
                onKeyPress={this.submitMessage}
                onChange={this.handleChange}
                ref="textarea"
                value={body}
                placeholder="What do you want to say?" />
          </Typeahead>
        </div>
      );
    }

    return null;
  },

  replaceQueryWithUsername() {
    let username = TypeaheadStore.getCurrentUsername();
    let body = this.state.body;

    this.setState({
      body: body.replace(USERNAME_REGEX, (match, space) => {
        return space + '@' + username;
      }),
      partialUsername: null
    });
  },

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.body !== this.state.body;
  },

  submitMessage(e) {
    if (e.which === ENTER_KEY) {
      e.stopPropagation();

      ChatActions.submitMessage(
        `${AppStore.getUrl()}/rooms/${this.state.channel}/messages`,
        CurrentUserStore.getToken(),
        Map({
          user: this.state.user,
          body: this.state.body
        })
      );

      this.setState({
        body: ''
      });
    }
  }
});

module.exports = ChatInput;
