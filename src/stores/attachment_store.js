'use strict';

const ActionTypes = require('../constants').ActionTypes;
const assign = require('object-assign');
const Dispatcher = require('../dispatcher');
const { Map } = require('immutable');
const Store = require('./store');

let attachments = Map();
let errors = Map();

class AttachmentsStore extends Store {
  constructor() {
    super();

    this.dispatchToken = Dispatcher.register((action) => {
      switch(action.actionType) {
        case ActionTypes.ATTACHMENT_UPLOADED:
          setAttachment(action);
          break;
        case ActionTypes.ATTACHMENT_FAILED:
          setError(action);
          break;
        default:
          return;
      }

      this.emitChange();
    });
  }

  getAttachments(commentId) {
    return attachments.get(commentId);
  }

  getError(commentId) {
    return errors.get(commentId);
  }
};

function setAttachment(action) {
  var commentId = action.commentId;
  var attachment = action.attachment;

  attachments = attachments.set(commentId, attachment);
}

function setError(action) {
  var commentId = action.commentId;
  var error = action.error;

  errors = errors.set(commentId, error);
}

module.exports = new AttachmentsStore();
