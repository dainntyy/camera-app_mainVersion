export const handlers = {
  newDoclet: function (e) {
    if (e.doclet.comment) {
      const match = e.doclet.comment.match(/@description\[uk\]\s+([^\n]+)/);
      if (match && match[1]) {
        e.doclet.description = match[1].trim();
      }
    }
  },
};
