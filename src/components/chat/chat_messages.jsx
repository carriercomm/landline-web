'use strict';

const AppStore = require('../../stores/app_store');
const ChatActions = require('../../actions/chat_actions');
const ChatInput = require('./chat_input.jsx');
const ChatMessage = require('./chat_message.jsx');
const ChatMessagesStore = require('../../stores/chat_messages_store');
const CurrentUserStore = require('../../stores/current_user_store');
const React = require('react/addons');
const Router = require('react-router');

const ChatMessages = React.createClass({
  mixins: [Router.State],

  componentDidMount() {
    ChatMessagesStore.addChangeListener(this.updateMessages);
    ChatActions.init();

    this.handleChannelChange();
    this.scrollToBottom();
  },

  componentDidUpdate() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
    }
  },

  componentWillReceiveProps(p) {
    let previousChannel = this.state.channel;

    this.setState({
      channel: this.getParams().roomSlug
    }, () => {
      this.updateMessages();
      this.handleChannelChange()
    });
  },

  handleChannelChange(){
    if (ChatMessagesStore.getMessages(this.state.channel).size === 0) {
      ChatActions.getMessages(this.state.channel);
    }
  },

  componentWillUpdate() {
    let node = this.refs.messages.getDOMNode();
    // magic number :(
    // After scrolling, it seems like the scroll value is sometimes off by one;
    // the ||-check makes sure we catch that.
    this.shouldScrollToBottom = node.scrollTop + node.offsetHeight === node.scrollHeight ||
      node.scrollHeight - (node.scrollTop + node.offsetHeight) === 1;
  },

  getInitialState() {
    return this.getMessages();
  },

  getMessages() {
    var state = {
      channel: this.getParams().roomSlug,
      messages: ChatMessagesStore.getMessages(this.getParams().roomSlug)
    };
    return state;
  },

  render() {
    let style = {
      chatMessages: {
        height: '100%',
        minHeight: 1,
        overflowY: 'auto'
      }
    };

    return (
      <div className="flex flex-stretch flex-column" style={style.chatMessages}>
        <div className="flex-auto left-align p3" style={style.chatMessages} ref="messages">
          {this.renderMessages()}
        </div>
        <ChatInput currentRoom={this.state.channel} />
      </div>
    );
  },

  renderMessages() {
    return this.state.messages.map((message, i) => {
      return <ChatMessage message={message.toJS ? message.toJS() : message}
          key={`message-${i}`} />
    }).toJS();
  },

  scrollToBottom() {
    let node = this.refs.messages.getDOMNode();
    node.scrollTop = node.scrollHeight;
  },

  updateMessages() {
    this.setState(this.getMessages());
  }
});

module.exports = ChatMessages;
