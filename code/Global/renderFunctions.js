
/**
 * function tries to check if the color contains just hex-characters
 * if so, it renders the color-definition prefixed with a '#'
 * otherwise it assumes the color is a named one
 */

function renderColor(c) {
   if (c && c.length == 6) {
      var nonhex = new RegExp("[^0-9,a-f]");
      nonhex.ignoreCase = true;
      var found = c.match(nonhex);
      if (!found) {
         // color-string contains just hex-characters, so we prefix it with '#'
         res.write("#" + c);
         return;
      }
   }
   res.write(c);
}

/**
 * function renders only a part of the text passed as argument
 * length of the string to show is defined by argument "limit"
 */

function renderTextPreview(text,limit) {
   var limit = Math.min(limit,text.length);
   var text = stripTags(text);
   var idx = 0;
   while (idx < limit) {
      var nIdx = text.indexOf(" ",idx);
      if (nIdx < 0)
         break;
      idx = ++nIdx;
   }
   var prev = text.substring(0,(idx > 1 ? idx : limit));
   // and now we "enrich" the text with <wbr>-tags
   for (var i=0;i<prev.length;i=i+30)
      res.write(prev.substring(i,i+30) + "<wbr>");
}

/**
 * Do Wiki style substitution, transforming
 * stuff contained between asterisks into links.
 */

function doWikiStuff (src) {
   // robert, disabled: didn't get the reason for this:
   // var src= " "+src;

   // do the Wiki link thing, <*asterisk style*>
   var regex = new RegExp ("<[*]([^*]+)[*]>");
   regex.ignoreCase=true;

   var text = "";
   var start = 0;
   while (true) {
      var found = regex.exec (src.substring(start));
      var to = found == null ? src.length : start + found.index;
      text += src.substring(start, to);
      if (found == null)
         break;
      var name = ""+(new java.lang.String (found[1])).trim();
      var item = path.weblog.topics.get (name);
      if (item == null && name.lastIndexOf("s") == name.length-1)
         item = path.weblog.topics.get (name.substring(0, name.length-1));
      if (item == null || !item.size())
         text += format(name)+" <small>[<a href=\""+path.weblog.stories.href("create")+"?topic="+escape(name)+"\">define "+format(name)+"</a>]</small>";
      else
         text += "<a href=\""+item.href()+"\">"+name+"</a>";
      start += found.index + found[1].length+4;
   }
   return text;
}

/**
 *  Renders a drop down box from an Array and an optional 
 *  current selection index. This is a simpler alternative 
 *  for the drop-down framework in hopobject. Its main 
 *  advantage is that Arrays are much simpler to set up in 
 *  JavaScript than (Hop)Objects:
 */
function simpleDropDownBox (name, options, selectedIndex, firstoption) {
   var str = "<select name=\""+name+"\" size=\"1\">";
   if (firstoption)
      str += "<option value=\"\">" + firstoption + "</option>";
   for (var i in options) {
      var name = encode (options[i]);
      var key = i;
      if (key == selectedIndex)
         str += "<option value=\""+key+"\" selected=\"true\">"+name+"</option>";
      else
         str += "<option value=\""+key+"\">"+name+"</option>";
   }
   str += "</select>";
   return str;
}


/**
 * Renders an arbitrary x/html element
 * @param name String containing the element's name (tag)
 * @param content String containing the element's content
 * @param attr Object containing the element's attributes as properties
 */
function renderMarkupElement(name, content, attr) {
  if (!content)
    content = "";
  // temporary mapping of class attribute
  // (due to backwards-compatibility)
  if (!attr["class"]) {
    attr["class"] = attr.style;
    delete(attr.style);
  }
  var attributes = "";
  for (var i in attr) {
    if (!attr[i])
      continue;
    attributes += " " + i + "=\"" + attr[i] + "\"";
	}
  res.write("<" + name + attributes + ">" + content + "</" + name + ">");
}


/**
 * renders image element
 * @param img Object contains the images's properties
 * @param param Object contains user-defined properties
 */
function renderImage(img, param) {
  if (!param.title)
    param.title = img.alttext;
  param.src = getProperty("imgUrl");
  param.src += img.weblog ? img.weblog.alias + "/" : "";
  param.src += img.filename + "." + img.fileext;
  if (!param.width)
    param.width = img.width;
  if (!param.height)
    param.height = img.height;
  if (!param.border)
    param.border = "0";
  param.alt = param.description ? param.description : img.alttext;
  delete(param.description);
  // delete(param.name);
  return(renderMarkupElement("img", null, param));
}
