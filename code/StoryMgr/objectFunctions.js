/**
 * function checks if story fits to the minimal needs (must have at least a text ;-)
 * @param Obj story-object to work on
 * @param Obj Object containing the properties needed for creating a new story
 * @param Obj User-Object creating this story
 * @return Obj Object containing three properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 *             - story (Obj): story-object containing assigned form-values
 *             - id (Int): id of created story
 */

function evalNewStory(s,param,creator) {
   var result;
   s.site = this._parent;
   // loop through param and collect content properties
   var cont = new HopObject();
   var contentIsCool = false;
   for (var i in param) {
      if (i.indexOf ("content_") == 0) {
         cont[i.substring(8)] = param[i].trim();
         if (!contentIsCool && param[i])
            contentIsCool = true;
      }
   }
   // if all story parts are null, return with error-message
   if (!contentIsCool)
      result = getError("textMissing");

   s.setContent (cont);
   // let's keep the title property
   s.title = param.content_title;
   s.prototype = "story";
   s.creator = creator;
   // check if the create date is set in the param object
   if (param.createtime) {
      var ctime = tryEval ('parseTimestamp(param.createtime, "yyyy-MM-dd HH:mm")');
      if (ctime.error)
          result = getError("timestampParse",param.createtime);
      else
         s.createtime = ctime.value;
      s.modifytime = new Date();
   } else {
      s.modifytime = s.createtime = new Date();
   }
   s.editableby = !isNaN(parseInt(param.editableby,10)) ? parseInt(param.editableby,10) : null;
   s.discussions = (param.discussions_array || param.discussions == null ? 1 : 0);
   if (s.createtime) {
      // create day of story with respect to site-timezone
      s.day = formatTimestamp(s.createtime,"yyyyMMdd");
   }
   s.ipaddress = param.http_remotehost;
   s.reads = 0;

   var topic = param.topic ? param.topic : parseInt(param.topicidx,10);
   if (!isNaN(topic) && topic >= 0) {
      var topicNode = this._parent.topics.get(topic);
      s.topic = topicNode ? topicNode.groupname : null;
   } else
      s.topic = topic ? topic : null;

   // check if topic-name contains any forbidden characters
   if (!isCleanForURL(s.topic))
      result = getError("topicNoSpecialChars");
   // check the online-status of the story
   var status = parseInt(param.online,10);
   if (param.publish || param.submit == "publish")
      status = param.addtofront ? 2 : 1;
   else if ((param.save || param.submit == "save") && isNaN(status))
      status = 0;
   if (isNaN(status))
      result = getError("storyPublish");
   else if (status == 1 && !s.topic)
      result = getError("storyTopicMissing");
   //else
      s.online = status;
   // if everything ok, so proceed with adding the story
   if (!result) {
      if (this.add(s)) {
         result = getConfirm("storyCreate");
         result.id = s._id;
         if (s.online) {
            s.site.lastupdate = s.modifytime;
            result.url = this.href()+s._id;
         } else
            result.url = this.href();
      } else
         result = getError("storyCreate");
   }
   result.story = s;
   return (result);
}


/**
 * delete a story
 * including all the comments
 * @param Obj Story-Object that should be deleted
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function deleteStory(currStory) {
   var result;
   // delete all comments of story
   currStory.deleteAll();
   if (this.remove(currStory)) {
      this._parent.lastupdate = new Date();
      result = getConfirm("storyDelete");
   } else
      result = getError("storyDelete");
   return (result);
}

/**
 * function loops over all stories and removes them (including their comments!)
 * @return Boolean true in any case
 */

function deleteAll() {
   for (var i=this.size();i>0;i--)
      this.deleteStory(this.get(i-1));
   return (result);
}
