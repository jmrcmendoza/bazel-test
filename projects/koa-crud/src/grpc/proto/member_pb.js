// source: member.proto
/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!
/* eslint-disable */
// @ts-nocheck

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

goog.exportSymbol('proto.memberservice.Member', null, global);
goog.exportSymbol('proto.memberservice.MembersRequest', null, global);
goog.exportSymbol('proto.memberservice.MembersResponse', null, global);
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.memberservice.MembersRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.memberservice.MembersRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.memberservice.MembersRequest.displayName = 'proto.memberservice.MembersRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.memberservice.MembersResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.memberservice.MembersResponse.repeatedFields_, null);
};
goog.inherits(proto.memberservice.MembersResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.memberservice.MembersResponse.displayName = 'proto.memberservice.MembersResponse';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.memberservice.Member = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.memberservice.Member, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.memberservice.Member.displayName = 'proto.memberservice.Member';
}



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.memberservice.MembersRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.memberservice.MembersRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.memberservice.MembersRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.memberservice.MembersRequest.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.memberservice.MembersRequest}
 */
proto.memberservice.MembersRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.memberservice.MembersRequest;
  return proto.memberservice.MembersRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.memberservice.MembersRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.memberservice.MembersRequest}
 */
proto.memberservice.MembersRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.memberservice.MembersRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.memberservice.MembersRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.memberservice.MembersRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.memberservice.MembersRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.memberservice.MembersResponse.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.memberservice.MembersResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.memberservice.MembersResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.memberservice.MembersResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.memberservice.MembersResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    membersList: jspb.Message.toObjectList(msg.getMembersList(),
    proto.memberservice.Member.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.memberservice.MembersResponse}
 */
proto.memberservice.MembersResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.memberservice.MembersResponse;
  return proto.memberservice.MembersResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.memberservice.MembersResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.memberservice.MembersResponse}
 */
proto.memberservice.MembersResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.memberservice.Member;
      reader.readMessage(value,proto.memberservice.Member.deserializeBinaryFromReader);
      msg.addMembers(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.memberservice.MembersResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.memberservice.MembersResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.memberservice.MembersResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.memberservice.MembersResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getMembersList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.memberservice.Member.serializeBinaryToWriter
    );
  }
};


/**
 * repeated Member members = 1;
 * @return {!Array<!proto.memberservice.Member>}
 */
proto.memberservice.MembersResponse.prototype.getMembersList = function() {
  return /** @type{!Array<!proto.memberservice.Member>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.memberservice.Member, 1));
};


/**
 * @param {!Array<!proto.memberservice.Member>} value
 * @return {!proto.memberservice.MembersResponse} returns this
*/
proto.memberservice.MembersResponse.prototype.setMembersList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.memberservice.Member=} opt_value
 * @param {number=} opt_index
 * @return {!proto.memberservice.Member}
 */
proto.memberservice.MembersResponse.prototype.addMembers = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.memberservice.Member, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.memberservice.MembersResponse} returns this
 */
proto.memberservice.MembersResponse.prototype.clearMembersList = function() {
  return this.setMembersList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.memberservice.Member.prototype.toObject = function(opt_includeInstance) {
  return proto.memberservice.Member.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.memberservice.Member} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.memberservice.Member.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, ""),
    username: jspb.Message.getFieldWithDefault(msg, 2, ""),
    password: jspb.Message.getFieldWithDefault(msg, 3, ""),
    realname: jspb.Message.getFieldWithDefault(msg, 4, ""),
    email: jspb.Message.getFieldWithDefault(msg, 5, ""),
    bankaccount: jspb.Message.getFieldWithDefault(msg, 6, 0),
    createdat: jspb.Message.getFieldWithDefault(msg, 7, ""),
    updatedat: jspb.Message.getFieldWithDefault(msg, 8, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.memberservice.Member}
 */
proto.memberservice.Member.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.memberservice.Member;
  return proto.memberservice.Member.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.memberservice.Member} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.memberservice.Member}
 */
proto.memberservice.Member.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setUsername(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setPassword(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setRealname(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setEmail(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setBankaccount(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.setCreatedat(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readString());
      msg.setUpdatedat(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.memberservice.Member.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.memberservice.Member.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.memberservice.Member} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.memberservice.Member.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getUsername();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getPassword();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getRealname();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getEmail();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getBankaccount();
  if (f !== 0) {
    writer.writeInt32(
      6,
      f
    );
  }
  f = message.getCreatedat();
  if (f.length > 0) {
    writer.writeString(
      7,
      f
    );
  }
  f = message.getUpdatedat();
  if (f.length > 0) {
    writer.writeString(
      8,
      f
    );
  }
};


/**
 * optional string id = 1;
 * @return {string}
 */
proto.memberservice.Member.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.memberservice.Member} returns this
 */
proto.memberservice.Member.prototype.setId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string username = 2;
 * @return {string}
 */
proto.memberservice.Member.prototype.getUsername = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.memberservice.Member} returns this
 */
proto.memberservice.Member.prototype.setUsername = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string password = 3;
 * @return {string}
 */
proto.memberservice.Member.prototype.getPassword = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.memberservice.Member} returns this
 */
proto.memberservice.Member.prototype.setPassword = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string realName = 4;
 * @return {string}
 */
proto.memberservice.Member.prototype.getRealname = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.memberservice.Member} returns this
 */
proto.memberservice.Member.prototype.setRealname = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string email = 5;
 * @return {string}
 */
proto.memberservice.Member.prototype.getEmail = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.memberservice.Member} returns this
 */
proto.memberservice.Member.prototype.setEmail = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional int32 bankAccount = 6;
 * @return {number}
 */
proto.memberservice.Member.prototype.getBankaccount = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {number} value
 * @return {!proto.memberservice.Member} returns this
 */
proto.memberservice.Member.prototype.setBankaccount = function(value) {
  return jspb.Message.setProto3IntField(this, 6, value);
};


/**
 * optional string createdAt = 7;
 * @return {string}
 */
proto.memberservice.Member.prototype.getCreatedat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/**
 * @param {string} value
 * @return {!proto.memberservice.Member} returns this
 */
proto.memberservice.Member.prototype.setCreatedat = function(value) {
  return jspb.Message.setProto3StringField(this, 7, value);
};


/**
 * optional string updatedAt = 8;
 * @return {string}
 */
proto.memberservice.Member.prototype.getUpdatedat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/**
 * @param {string} value
 * @return {!proto.memberservice.Member} returns this
 */
proto.memberservice.Member.prototype.setUpdatedat = function(value) {
  return jspb.Message.setProto3StringField(this, 8, value);
};


goog.object.extend(exports, proto.memberservice);
