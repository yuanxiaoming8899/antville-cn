/**
 * function tries to get the skin-object from skinmanager
 * if not existing, returns a temporary skin-object
 * containing the source of the file-skin
 */

function fetchSkin(proto,name) {
   var currProto = this._parent.skinmanager.get(proto);
   if (currProto && currProto.get(name))
      return(currProto.get(name));
   else {
      var s = new skin();
      s.skin = app.skinfiles[proto][name];
      return (s);
   }
}

/**
 * function stores skin
 * @param String Name of prototype
 * @param String Name of skin
 * @param String Source of modified skin
 * @param Obj User-object modifying this skin
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */

function saveSkin(proto,name,source,creator) {
   var result = new Object();
   result.error = false;
   if (proto && name) {
      var s = this.fetchSkin(proto,name);
      if (!s.proto && skin) {
         s.creator = creator;
         s.createtime = new Date();
         s.name = name;
         s.proto = proto;
         this._parent.skinmanager.add(s);
      } else if (s.proto && !source)
         this._parent.skinmanager.get(s.proto).remove(s);
      if (source)
         s.skin = source;
      result.message = "Changes were saved successfully!";
   } else {
      result.message = "Couldn't find skin for update!";
      result.error = true;
   }
   return (result);
}

/**
 * function deletes a skin
 * @param Obj Skin-HopObject to delete
 * @return String Message indicating success of failure
 */

function deleteSkin(s) {
   if (this._parent.skinmanager.get(s.proto).remove(s))
      return ("Skin deleted successfully!");
   else
      return ("Couldn't delete skin!");
}

/**
 * function deletes all skins belonging to this manager
 */

function deleteAll() {
   var mgr = this._parent.skinmanager;
   for (var i=mgr.size();i>0;i--) {
      var proto = mgr.get(i-1);
      for (var j=proto.size();j>0;j--)
         proto.remove(proto.get(j-1));
   }
   return;
}