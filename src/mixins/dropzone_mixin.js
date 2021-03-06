'use strict';

if (typeof __TEST__ === 'undefined') {
  require('../styles/dropzone.css');
}

const ActionTypes = require('../constants').ActionTypes;
const AttachmentActions = require('../actions/attachment_actions');
const AttachmentStore = require('../stores/attachment_store');
const Dispatcher = require('../dispatcher');
const Dropzone = require('dropzone');
const UploadingAttachmentsStore = require('../stores/uploading_attachments_store');

Dropzone.autoDiscover = false;

const DropzoneMixin = {
  componentDidMount() {
    this.dropzone = new Dropzone(this.getDOMNode(), {
      accept: this.onAccept(this.props.commentId),
      clickable: false,
      sending: this.onSending,
      url: `https://s3.amazonaws.com/${__S3_BUCKET__}`
    });

    AttachmentStore.addChangeListener(this.getAttachments);
    UploadingAttachmentsStore.addChangeListener(this.getUploadingAttachments);
  },

  componentWillUnmount() {
    this.dropzone = null;
  },

  getAttachments() {
    let commentId = this.props.commentId;
    let attachment = AttachmentStore.getAttachments(commentId);
    let currentText = this.state.body || '';
    let replaceText = `![Uploading... ${attachment.name}]()`;

    this.setState({
      body: currentText.replace(replaceText, `${attachment.href}\n`)
    });
  },

  getUploadingAttachments() {
    let commentId = this.props.commentId;
    let attachments = UploadingAttachmentsStore.getUploadingAttachments(commentId);

    if (attachments.length) {
      let newText = attachments.join(' ');
      let currentText = this.state.text || '';

      this.setState({
        body: currentText + newText
      });
    }
  },

  onAccept: AttachmentActions.uploadAttachment,

  // Sign the upload with data from the server
  // The server signs the payload for AWS S3 using the private key (which we
  // can't expose in the client), setting up the ACL, expiration, etc. We then
  // need to attach this information to the uploading file so that S3 accepts
  // it.
  onSending(file, xhr, formData) {
    for (let k in file.form) {
      formData.append(k, file.form[k]);
    }
  }
};

module.exports = DropzoneMixin;
